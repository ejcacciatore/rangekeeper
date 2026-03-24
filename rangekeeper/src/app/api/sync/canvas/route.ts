/**
 * POST /api/sync/canvas
 *
 * Triggers a Canvas LMS sync for the authenticated student.
 * Fetches courses, assignments, and grades from Canvas and upserts them
 * into the local database. Enqueues AI task decomposition for new assignments.
 *
 * This is designed to be called:
 * - Manually by the student ("Sync now" button)
 * - On a schedule via BullMQ (every 6 hours)
 * - Automatically after sign-in
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validate optional request body
const syncRequestSchema = z.object({
  /** Force a full re-sync even if data is recent */
  force: z.boolean().optional().default(false),
  /** Sync only a specific course (by Canvas course ID) */
  courseId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json().catch(() => ({}));
    const parsed = syncRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }
    const { force, courseId } = parsed.data;

    // 3. Look up the student's Canvas credentials
    // TODO: Fetch canvasApiKey and canvasBaseUrl from the student's profile
    const student = await db.student.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        canvasUserId: true,
        lastSyncAt: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found. Please complete setup.' }, { status: 404 });
    }

    // 4. Throttle: skip if synced in the last 30 minutes (unless forced)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (!force && student.lastSyncAt && student.lastSyncAt > thirtyMinutesAgo) {
      return NextResponse.json({
        message: 'Sync skipped — data is fresh',
        lastSyncAt: student.lastSyncAt,
        nextSyncAvailableAt: new Date(student.lastSyncAt.getTime() + 30 * 60 * 1000),
      });
    }

    // TODO: Step 5 — Fetch courses from Canvas API
    // const canvasClient = new CanvasClient({ baseUrl: CANVAS_BASE_URL, apiKey: CANVAS_API_KEY });
    // const courses = await canvasClient.getCourses({ enrollmentState: 'active' });

    // TODO: Step 6 — For each course, fetch assignments
    // const assignments = await Promise.all(courses.map(c => canvasClient.getAssignments(c.id)));

    // TODO: Step 7 — Upsert courses and assignments into DB
    // await upsertCoursesAndAssignments(student.id, courses, assignments.flat());

    // TODO: Step 8 — Identify new/changed assignments and enqueue AI decomposition
    // for (const newAssignment of newAssignments) {
    //   await decompositionQueue.add('decompose', { studentId: student.id, assignmentId: newAssignment.id });
    // }

    // TODO: Step 9 — Update lastSyncAt
    // await db.student.update({ where: { id: student.id }, data: { lastSyncAt: new Date() } });

    // Temporary stub response
    return NextResponse.json({
      message: 'Canvas sync initiated',
      studentId: student.id,
      syncedAt: new Date().toISOString(),
      // TODO: Return counts: coursesSync, assignmentsSynced, newAssignments, decompositionJobsQueued
    });
  } catch (error) {
    console.error('[/api/sync/canvas] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/sync/canvas
 * Returns the last sync status for the authenticated student.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const student = await db.student.findUnique({
    where: { userId: session.user.id },
    select: { lastSyncAt: true },
  });

  return NextResponse.json({
    lastSyncAt: student?.lastSyncAt ?? null,
    status: student?.lastSyncAt ? 'synced' : 'never_synced',
  });
}
