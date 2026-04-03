/**
 * GET /api/parent/dashboard
 *
 * Returns a parent-safe summary of a student's academic status.
 * Requires a valid parent access token (not the student's session).
 *
 * Privacy design:
 * - Parents see summary-level data only (assignment names, urgency levels, completion streaks)
 * - Parents do NOT see assignment grades, content, or private notes
 * - Students can revoke parent access at any time
 * - All parent access is logged for transparency
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { startOfWeek, endOfWeek, subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate — parent can use their own session or a parent-specific access token
    const session = await getServerSession(authOptions);
    const parentToken = request.headers.get('x-parent-token');

    let studentId: string | null = null;
    let parentId: string | null = null;

    if (parentToken) {
      // TODO: Look up parent access token
      // const access = await db.parentAccess.findUnique({
      //   where: { token: parentToken, isActive: true, expiresAt: { gt: new Date() } },
      // });
      // if (!access) return NextResponse.json({ error: 'Invalid or expired parent token' }, { status: 401 });
      // studentId = access.studentId;
      // parentId = access.parentId;
      return NextResponse.json({ error: 'Parent token auth not yet implemented' }, { status: 501 });
    } else if (session?.user?.id) {
      // Logged-in parent user — verify they have an active parent relationship
      // TODO: Look up ParentStudent relationship
      // const relationship = await db.parentStudent.findFirst({
      //   where: { parent: { userId: session.user.id }, isActive: true },
      // });
      // if (!relationship) return NextResponse.json({ error: 'No linked student found' }, { status: 403 });
      // studentId = relationship.studentId;
      // parentId = relationship.parentId;
      return NextResponse.json({ error: 'Parent dashboard not yet configured. Ask your student to send you an invite.' }, { status: 403 });
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // NOTE: Code below is functional but unreachable until auth is wired up above.
    // It shows the intended shape of the parent dashboard response.

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const sevenDaysAgo = subDays(now, 7);

    // 2. Fetch student public profile
    const student = await db.student.findUnique({
      where: { id: studentId! },
      select: {
        id: true,
        user: { select: { name: true } },
        currentSemester: true,
        lastSyncAt: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 3. Upcoming high-urgency assignments (names only, no grades)
    const urgentAssignments = await db.assignment.findMany({
      where: {
        course: { enrollments: { some: { studentId: studentId! } } },
        isComplete: false,
        dueDate: { gte: now },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        course: { select: { name: true } },
        tasks: {
          where: { studentId: studentId!, isComplete: false },
          select: { urgencyScore: true },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    // 4. Tasks completed this week (for streak/progress)
    const completedThisWeek = await db.task.count({
      where: {
        studentId: studentId!,
        isComplete: true,
        completedAt: { gte: weekStart, lte: weekEnd },
      },
    });

    // 5. Log this parent access for student transparency
    // TODO: await db.parentAccessLog.create({ data: { parentId, studentId, accessedAt: now, endpoint: 'dashboard' } });

    return NextResponse.json({
      student: {
        name: student.user.name,
        semester: student.currentSemester,
        lastSyncAt: student.lastSyncAt,
      },
      weekSummary: {
        tasksCompletedThisWeek: completedThisWeek,
        // TODO: tasksScheduledThisWeek, completionRate
      },
      upcomingAssignments: urgentAssignments.map((a) => ({
        id: a.id,
        title: a.title,
        courseName: a.course.name,
        dueDate: a.dueDate,
        urgencyLevel:
          Math.max(0, ...a.tasks.map((t) => t.urgencyScore ?? 0)) >= 67
            ? 'high'
            : Math.max(0, ...a.tasks.map((t) => t.urgencyScore ?? 0)) >= 34
            ? 'medium'
            : 'low',
        // Note: no grades or scores visible to parents
      })),
      note: 'This summary is provided with your student\'s consent. Grades and assignment content are not shared.',
    });
  } catch (error) {
    console.error('[/api/parent/dashboard] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
