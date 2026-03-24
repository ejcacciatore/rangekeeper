/**
 * GET /api/plan/today
 *
 * Returns the AI-generated daily plan for today for the authenticated student.
 * If no plan exists for today, generates one on-demand.
 *
 * The daily plan is a prioritized, time-blocked list of micro-tasks the student
 * should focus on today, calibrated to their energy level, available hours,
 * and urgency scores across all active assignments.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Look up student
    const student = await db.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // 3. Check for an existing plan generated today
    const existingPlan = await db.dailyPlan.findFirst({
      where: {
        studentId: student.id,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        planItems: {
          orderBy: { scheduledOrder: 'asc' },
          include: {
            task: {
              include: {
                assignment: {
                  select: {
                    title: true,
                    dueDate: true,
                    gradeWeight: true,
                    course: { select: { name: true, color: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (existingPlan) {
      return NextResponse.json({
        plan: existingPlan,
        generated: false,
        message: 'Using cached plan for today',
      });
    }

    // 4. No plan yet — generate one
    // TODO: Call the daily planner AI prompt with the student's active tasks
    // const activeTasks = await db.task.findMany({
    //   where: { studentId: student.id, isComplete: false, assignment: { dueDate: { gte: today } } },
    //   include: { assignment: true },
    //   orderBy: [{ urgencyScore: 'desc' }, { assignment: { dueDate: 'asc' } }],
    // });

    // TODO: Build daily planner prompt and call OpenAI
    // const { buildDailyPlannerPrompt } = await import('@/ai/prompts/daily-planner');
    // const planJson = await ai.chat.completions.create({ ... });

    // TODO: Persist the generated plan as a DailyPlan + DailyPlanItem records

    // Stub: return empty plan with instructions
    return NextResponse.json({
      plan: {
        date: today.toISOString(),
        studentId: student.id,
        planItems: [],
        generatedAt: today.toISOString(),
        totalEstimatedMinutes: 0,
        message: 'Plan generation not yet implemented — sync Canvas and check back soon.',
      },
      generated: true,
    });
  } catch (error) {
    console.error('[/api/plan/today] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/plan/today
 * Force-regenerates today's plan, discarding any cached version.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Delete existing plan for today and re-generate
  // await db.dailyPlan.deleteMany({ where: { studentId, date: { gte: todayStart, lte: todayEnd } } });
  // Then follow same logic as GET above

  return NextResponse.json({ message: 'Plan regeneration not yet implemented' }, { status: 501 });
}
