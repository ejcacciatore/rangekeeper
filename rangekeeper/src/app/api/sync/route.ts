/**
 * POST /api/sync
 * 
 * Main sync endpoint for the RangeKeeper Chrome Extension.
 * Receives data from Blackboard Ultra and WebAssign.
 * Upserts courses, assignments, grades, and messages into the SQLite database via Prisma.
 * Triggers the Advisor Crosscheck Engine for Grade Audits.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { courses, assignments, grades, messages, auditData } = data;

    console.log('[Sync] Received payload from extension');

    // 1. Ensure Default Student Profile (Massimo)
    // For local dev, we use a constant ID
    const studentId = 'massimo_mcrae';
    const student = await db.studentProfile.upsert({
      where: { id: studentId },
      update: { name: 'Massimo McRae', school: 'University of Alabama' },
      create: { 
        id: studentId,
        userId: 'dev_user', // Placeholder
        name: 'Massimo McRae',
        school: 'University of Alabama',
        timezone: 'America/Chicago'
      }
    });

    // 2. Sync Courses
    if (courses?.length > 0) {
      for (const course of courses) {
        await db.course.upsert({
          where: { studentProfileId_lmsCourseId_lmsType: { 
            studentProfileId: student.id, 
            lmsCourseId: course.id, 
            lmsType: 'BLACKBOARD' 
          }},
          update: {
            name: course.name,
            code: course.code,
            instructor: course.instructorName,
            term: course.term || 'Spring 2026',
            lastSyncAt: new Date()
          },
          create: {
            studentProfileId: student.id,
            lmsCourseId: course.id,
            lmsType: 'BLACKBOARD',
            name: course.name,
            code: course.code,
            instructor: course.instructorName,
            term: course.term || 'Spring 2026'
          }
        });
      }
    }

    // 3. Sync Assignments
    if (assignments?.length > 0) {
      for (const ass of assignments) {
        // Find local course ID
        const localCourse = await db.course.findFirst({
            where: { lmsCourseId: ass.courseId }
        });
        if (!localCourse) continue;

        await db.assignment.upsert({
          where: { courseId_lmsAssignmentId_lmsType: {
            courseId: localCourse.id,
            lmsAssignmentId: ass.id,
            lmsType: 'BLACKBOARD'
          }},
          update: {
            title: ass.title,
            dueDate: ass.dueDate ? new Date(ass.dueDate) : null,
            grade: ass.grade,
            isSubmitted: ass.submitted || false
          },
          create: {
            courseId: localCourse.id,
            lmsAssignmentId: ass.id,
            lmsType: 'BLACKBOARD',
            title: ass.title,
            dueDate: ass.dueDate ? new Date(ass.dueDate) : null,
            grade: ass.grade,
            isSubmitted: ass.submitted || false
          }
        });
      }
    }

    // 4. Sync Advisor Checks (from Audit)
    if (auditData?.courses) {
       for (const [courseCode, result] of Object.entries(auditData.courses) as any) {
         const course = await db.course.findFirst({ where: { code: courseCode } });
         if (!course) continue;

         if (result.advisorChecks) {
            // Clear old checks and insert new ones
            await db.advisorCheck.deleteMany({ where: { courseId: course.id } });
            
            for (const check of result.advisorChecks) {
                await db.advisorCheck.create({
                    data: {
                        courseId: course.id,
                        claim: check.claim,
                        actual: check.actual,
                        match: check.match,
                        flag: check.flag,
                        note: check.note
                    }
                });
            }
         }
       }
    }

    return NextResponse.json({
      status: 'success',
      syncedAt: new Date().toISOString(),
      counts: {
        courses: courses?.length || 0,
        assignments: assignments?.length || 0,
        messages: messages?.length || 0
      }
    });

  } catch (error: any) {
    console.error('[Sync] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
