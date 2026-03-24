/**
 * BullMQ Queue Setup
 *
 * Defines all queues used by RangeKeeper for background job processing.
 * Jobs are processed by worker processes (see src/workers/).
 *
 * Queues:
 * - nudgeQueue       — Send SMS/push nudges to students
 * - planQueue        — Generate/refresh daily plans
 * - syncQueue        — Canvas LMS sync jobs
 * - decompositionQueue — AI task decomposition for new assignments
 * - urgencyQueue     — Recalculate urgency scores
 *
 * Usage (in API routes):
 *   import { nudgeQueue } from '@/lib/queue';
 *   await nudgeQueue.add('send-nudge', { studentId, type: 'reminder' });
 */

import { Queue, Worker, QueueEvents, type ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';

// ---------------------------------------------------------------------------
// Redis connection
// ---------------------------------------------------------------------------

/**
 * Create a shared Redis connection for BullMQ.
 * BullMQ recommends using a dedicated connection per queue, but for
 * simplicity during development we share one per process.
 */
function createRedisConnection(): IORedis {
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
  const connection = new IORedis(url, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
  });

  connection.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });

  return connection;
}

// Singleton pattern to avoid creating multiple connections
const globalForQueues = globalThis as unknown as {
  redisConnection: IORedis | undefined;
};

export const redisConnection: IORedis =
  globalForQueues.redisConnection ?? createRedisConnection();

if (process.env.NODE_ENV !== 'production') {
  globalForQueues.redisConnection = redisConnection;
}

// ---------------------------------------------------------------------------
// Shared queue options
// ---------------------------------------------------------------------------

const defaultQueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 5_000, // Start with 5 second delay, double on each retry
    },
    removeOnComplete: { count: 100 }, // Keep last 100 completed jobs for debugging
    removeOnFail: { count: 200 },     // Keep last 200 failed jobs
  },
};

// ---------------------------------------------------------------------------
// Queue definitions
// ---------------------------------------------------------------------------

/**
 * Nudge Queue
 * Handles sending SMS and push notifications to students.
 *
 * Job data shape:
 * {
 *   studentId: string;
 *   type: 'reminder' | 'encouragement' | 'deadline_warning' | 'start_now' | 'celebrate';
 *   assignmentId?: string;
 *   channel: 'sms' | 'push' | 'email';
 *   triggeredBy: 'scheduler' | 'manual' | 'system';
 *   scheduledFor?: string; // ISO datetime, if future delivery requested
 * }
 */
export const nudgeQueue = new Queue('nudges', defaultQueueOptions);

/**
 * Daily Plan Queue
 * Generates or refreshes the daily plan for a student.
 *
 * Job data shape:
 * {
 *   studentId: string;
 *   date?: string; // ISO date string, defaults to today
 *   force?: boolean; // Regenerate even if plan exists
 * }
 */
export const planQueue = new Queue('daily-plans', defaultQueueOptions);

/**
 * Canvas Sync Queue
 * Syncs a student's courses and assignments from Canvas LMS.
 *
 * Job data shape:
 * {
 *   studentId: string;
 *   courseId?: string; // Scope to a specific course
 *   force?: boolean;
 * }
 */
export const syncQueue = new Queue('canvas-sync', defaultQueueOptions);

/**
 * Task Decomposition Queue
 * Runs AI decomposition on a newly imported Canvas assignment.
 *
 * Job data shape:
 * {
 *   studentId: string;
 *   assignmentId: string;
 *   forceRedecompose?: boolean; // Re-decompose even if tasks already exist
 * }
 */
export const decompositionQueue = new Queue('task-decomposition', {
  ...defaultQueueOptions,
  defaultJobOptions: {
    ...defaultQueueOptions.defaultJobOptions,
    // Decomposition is expensive — limit concurrency via rate limiting
    attempts: 2,
  },
});

/**
 * Urgency Scoring Queue
 * Recalculates urgency scores for tasks after events (completion, dependency change, etc.)
 *
 * Job data shape:
 * {
 *   studentId: string;
 *   taskIds?: string[]; // Scope to specific tasks; if omitted, re-scores all active tasks
 *   reason: 'scheduled' | 'dependency_complete' | 'assignment_added' | 'manual';
 * }
 */
export const urgencyQueue = new Queue('urgency-scoring', defaultQueueOptions);

// ---------------------------------------------------------------------------
// Queue event listeners (for monitoring / logging)
// ---------------------------------------------------------------------------

if (process.env.NODE_ENV !== 'production') {
  const allQueues = [nudgeQueue, planQueue, syncQueue, decompositionQueue, urgencyQueue];
  for (const queue of allQueues) {
    const events = new QueueEvents(queue.name, { connection: createRedisConnection() });
    events.on('completed', ({ jobId }) => {
      console.log(`[Queue:${queue.name}] Job ${jobId} completed`);
    });
    events.on('failed', ({ jobId, failedReason }) => {
      console.error(`[Queue:${queue.name}] Job ${jobId} failed: ${failedReason}`);
    });
  }
}

// ---------------------------------------------------------------------------
// Scheduling helpers
// ---------------------------------------------------------------------------

/**
 * Schedules the daily plan generation job for all active students.
 * Call this once at startup and the repeatable job handles itself.
 */
export async function scheduleDailyPlanGeneration(): Promise<void> {
  await planQueue.add(
    'generate-all-daily-plans',
    { all: true },
    {
      repeat: {
        pattern: '0 6 * * *', // 6:00 AM UTC daily
        tz: 'UTC',
      },
      jobId: 'daily-plan-cron', // Stable ID prevents duplicate cron jobs
    }
  );
  console.log('[Queue] Daily plan generation scheduled (06:00 UTC)');
}

/**
 * Schedules canvas sync for all students every 6 hours.
 */
export async function scheduleCanvasSync(): Promise<void> {
  await syncQueue.add(
    'sync-all-students',
    { all: true },
    {
      repeat: {
        pattern: '0 */6 * * *', // Every 6 hours
      },
      jobId: 'canvas-sync-cron',
    }
  );
  console.log('[Queue] Canvas sync scheduled (every 6 hours)');
}

/**
 * Schedules urgency score recalculation nightly.
 */
export async function scheduleUrgencyRecalculation(): Promise<void> {
  await urgencyQueue.add(
    'recalculate-all-urgency',
    { all: true, reason: 'scheduled' },
    {
      repeat: {
        pattern: '0 3 * * *', // 3:00 AM UTC daily
      },
      jobId: 'urgency-recalc-cron',
    }
  );
  console.log('[Queue] Urgency recalculation scheduled (03:00 UTC)');
}
