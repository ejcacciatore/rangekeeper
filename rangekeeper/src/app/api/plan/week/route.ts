/**
 * GET /api/plan/week
 *
 * Returns a high-level weekly overview for the authenticated student.
 * Shows workload distribution across the next 7 days, upcoming deadlines,
 * and warns if any day is over-scheduled or under-scheduled.
 *
 * This is a read-heavy endpoint — safe to cache aggressively (ISR or Redis).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { addDays, startOfDay, endOfDay, format, eachDayOfInterval } from 'date-fns';

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

    const today = startOfDay(new Date());
    const weekEnd = endOfDay(addDays(today, 6));

    // 3. Fetch all assignments due within the next 7 days
    const upcomingAssignments = await db.assignment.findMany({
      where: {
        course: { enrollments: { some: { studentId: student.id } } },
        dueDate: { gte: today, lte: weekEnd },
        isComplete: false,
      },
      include: {
        course: { select: { name: true, color: true } },
        tasks: {
          where: { isComplete: false, studentId: student.id },
          select: { id: true, estimatedMinutes: true, urgencyScore: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    // 4. Fetch tasks scheduled per day (from existing daily plans)
    const weekDays = eachDayOfInterval({ start: today, end: weekEnd });

    // TODO: Query DailyPlan + DailyPlanItem for each day to get scheduled workload
    // const dailyPlans = await db.dailyPlan.findMany({
    //   where: { studentId: student.id, date: { gte: today, lte: weekEnd } },
    //   include: { planItems: { include: { task: true } } },
    // });

    // 5. Build the week overview
    const weekOverview = weekDays.map((day) => {
      const dayAssignments = upcomingAssignments.filter(
        (a) => startOfDay(a.dueDate).getTime() === day.getTime()
      );

      const totalRemainingMinutes = dayAssignments.reduce((sum, a) => {
        return sum + a.tasks.reduce((s, t) => s + (t.estimatedMinutes ?? 0), 0);
      }, 0);

      return {
        date: format(day, 'yyyy-MM-dd'),
        label: format(day, 'EEEE, MMM d'),
        isToday: day.getTime() === today.getTime(),
        assignmentsDue: dayAssignments.map((a) => ({
          id: a.id,
          title: a.title,
          courseName: a.course.name,
          courseColor: a.course.color,
          dueDate: a.dueDate,
          remainingTaskCount: a.tasks.length,
          remainingMinutes: a.tasks.reduce((s, t) => s + (t.estimatedMinutes ?? 0), 0),
          maxUrgencyScore: Math.max(0, ...a.tasks.map((t) => t.urgencyScore ?? 0)),
        })),
        scheduledMinutes: 0, // TODO: from daily plans
        totalRemainingMinutesForDueItems: totalRemainingMinutes,
        // TODO: isOverloaded = scheduledMinutes > student.dailyCapacityMinutes
        isOverloaded: false,
      };
    });

    // 6. Summary stats
    const totalDueThisWeek = upcomingAssignments.length;
    const highUrgencyCount = upcomingAssignments.filter((a) =>
      a.tasks.some((t) => (t.urgencyScore ?? 0) >= 67)
    ).length;

    return NextResponse.json({
      weekStart: format(today, 'yyyy-MM-dd'),
      weekEnd: format(weekEnd, 'yyyy-MM-dd'),
      weekOverview,
      summary: {
        totalAssignmentsDue: totalDueThisWeek,
        highUrgencyAssignments: highUrgencyCount,
        // TODO: Compute overloaded days count
        overloadedDays: 0,
      },
    });
  } catch (error) {
    console.error('[/api/plan/week] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
