/**
 * POST /api/tasks/[id]/complete
 *
 * Marks a task as complete for the authenticated student.
 * Side effects:
 * - Updates task completion timestamp
 * - Checks if all tasks for the parent assignment are complete
 * - Logs completion time to improve future time estimates
 * - Re-scores urgency for dependent tasks
 * - Optionally triggers a celebratory nudge
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { z } from 'zod';

const completeBodySchema = z.object({
  /** How many minutes were actually spent (for velocity tracking) */
  actualMinutesSpent: z.number().min(0).optional(),
  /** Optional note about the completion */
  note: z.string().max(500).optional(),
});

interface RouteParams {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: taskId } = params;

    // 2. Parse optional body
    const body = await request.json().catch(() => ({}));
    const parsed = completeBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }
    const { actualMinutesSpent, note } = parsed.data;

    // 3. Fetch the task and verify ownership
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        student: { select: { userId: true } },
        assignment: {
          include: {
            tasks: { where: { isComplete: false } },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.student.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden — this task belongs to another student' }, { status: 403 });
    }

    if (task.isComplete) {
      return NextResponse.json({
        message: 'Task is already marked complete',
        task: { id: task.id, completedAt: task.completedAt },
      });
    }

    const completedAt = new Date();

    // 4. Mark task complete
    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        isComplete: true,
        completedAt,
        actualMinutesSpent: actualMinutesSpent ?? null,
        // TODO: Append note to task notes array if schema supports it
      },
    });

    // 5. Check if this was the last incomplete task for the assignment
    const remainingTasks = task.assignment.tasks.filter((t) => t.id !== taskId);
    const assignmentNowComplete = remainingTasks.length === 0;

    if (assignmentNowComplete) {
      await db.assignment.update({
        where: { id: task.assignment.id },
        data: {
          isComplete: true,
          completedAt,
        },
      });
    }

    // 6. Log actual time for velocity learning
    if (actualMinutesSpent !== undefined) {
      // TODO: Update student's rolling velocity average
      // await updateStudentVelocity(task.studentId, task.estimatedMinutes, actualMinutesSpent);
    }

    // 7. Re-score urgency for tasks that were blocked by this one
    // TODO: Find tasks blocked by this task and re-run urgency scorer
    // const unblocked = await db.taskDependency.findMany({ where: { dependsOnTaskId: taskId } });
    // for (const dep of unblocked) { await recalculateUrgency(dep.taskId); }

    // 8. Enqueue a completion celebration nudge (non-blocking)
    // TODO: nudgeQueue.add('celebrate', { studentId: task.studentId, taskTitle: task.title });

    return NextResponse.json({
      success: true,
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        isComplete: updatedTask.isComplete,
        completedAt: updatedTask.completedAt,
      },
      assignmentComplete: assignmentNowComplete,
      message: assignmentNowComplete
        ? `🎉 Assignment "${task.assignment.title}" is fully complete!`
        : `✅ Task complete! ${remainingTasks.length} step(s) remaining for this assignment.`,
    });
  } catch (error) {
    console.error('[/api/tasks/[id]/complete] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id]/complete
 * Undoes a task completion (in case of accidental tap).
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: taskId } = params;

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { student: { select: { userId: true } } },
  });

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  if (task.student.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updatedTask = await db.task.update({
    where: { id: taskId },
    data: { isComplete: false, completedAt: null },
  });

  // Also un-complete the parent assignment if it was marked complete
  await db.assignment.updateMany({
    where: { id: task.assignmentId, isComplete: true },
    data: { isComplete: false, completedAt: null },
  });

  return NextResponse.json({
    success: true,
    message: 'Task completion undone',
    task: { id: updatedTask.id, isComplete: false },
  });
}
