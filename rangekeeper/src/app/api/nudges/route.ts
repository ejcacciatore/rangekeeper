/**
 * GET  /api/nudges     — List recent nudges for the authenticated student
 * POST /api/nudges     — Trigger a nudge manually or preview nudge content
 * PATCH /api/nudges    — Update nudge preferences (frequency, quiet hours, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { nudgeQueue } from '@/lib/queue';
import { z } from 'zod';

/**
 * GET /api/nudges
 * Returns the last N nudges sent to the student.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const student = await db.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const [nudges, total] = await db.$transaction([
      db.nudge.findMany({
        where: { studentId: student.id },
        orderBy: { sentAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.nudge.count({ where: { studentId: student.id } }),
    ]);

    return NextResponse.json({ nudges, total, limit, offset });
  } catch (error) {
    console.error('[GET /api/nudges] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const triggerNudgeSchema = z.object({
  type: z.enum(['reminder', 'encouragement', 'deadline_warning', 'start_now']),
  /** If provided, nudge relates to this assignment */
  assignmentId: z.string().optional(),
  /** If true, build and return the nudge message without sending it */
  preview: z.boolean().optional().default(false),
  /** Override channel for this nudge */
  channel: z.enum(['sms', 'push', 'email']).optional().default('sms'),
});

/**
 * POST /api/nudges
 * Manually trigger or preview a nudge.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = triggerNudgeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    const student = await db.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true, phoneNumber: true, nudgePreferences: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    if (parsed.data.preview) {
      // TODO: Generate nudge message text using the nudge-generator AI prompt
      // const { buildNudgePrompt } = await import('@/ai/prompts/nudge-generator');
      // const message = await generateNudgeMessage({ type, studentId: student.id, assignmentId });

      return NextResponse.json({
        preview: true,
        message: '[Preview] Your assignment "Research Paper Outline" is due in 2 days. Have you started the introduction yet? Even 20 minutes today will help! 📚',
        channel: parsed.data.channel,
        type: parsed.data.type,
      });
    }

    // Enqueue a real nudge job
    const job = await nudgeQueue.add('send-nudge', {
      studentId: student.id,
      type: parsed.data.type,
      assignmentId: parsed.data.assignmentId,
      channel: parsed.data.channel,
      triggeredBy: 'manual',
    });

    return NextResponse.json({
      message: 'Nudge queued successfully',
      jobId: job.id,
      estimatedDelivery: 'within 60 seconds',
    });
  } catch (error) {
    console.error('[POST /api/nudges] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const nudgePreferencesSchema = z.object({
  /** Whether nudges are enabled at all */
  enabled: z.boolean().optional(),
  /** Max nudges per day */
  maxPerDay: z.number().min(1).max(10).optional(),
  /** Local time HH:MM for quiet hours start (e.g. "22:00") */
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  /** Local time HH:MM for quiet hours end (e.g. "08:00") */
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  /** Preferred channels */
  channels: z.array(z.enum(['sms', 'push', 'email'])).optional(),
});

/**
 * PATCH /api/nudges
 * Update the student's nudge preferences.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = nudgePreferencesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    // TODO: Update nudge preferences on student record
    // await db.student.update({
    //   where: { userId: session.user.id },
    //   data: { nudgePreferences: { ...existing, ...parsed.data } },
    // });

    return NextResponse.json({ message: 'Nudge preferences updated', preferences: parsed.data });
  } catch (error) {
    console.error('[PATCH /api/nudges] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
