/**
 * RangeKeeper — Daily Planner Prompt
 *
 * Purpose: Takes all pending micro-tasks and creates an optimized, ordered
 * daily sequence with specific time blocks, breaks, and transitions.
 *
 * Design principles:
 * - Output is a SEQUENCE, not a list. Order matters enormously.
 * - High-urgency / high-cognitive work scheduled during student's peak energy windows
 * - Transitions are explicit blocks — ASD students need structured context switching
 * - Never schedule back-to-back deep work without breaks
 * - Respect calendar events (class, appointments)
 * - Leave buffer — never fill 100% of available time
 * - If too much to fit, triage honestly and warn
 */

import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface PendingMicroTask {
  microTaskId: string;
  assignmentTitle: string;
  courseCode: string;
  taskTitle: string;
  taskDescription: string;
  startInstruction: string;
  estimatedMinutes: number;
  taskType: "DEEP_WORK" | "LIGHT_WORK" | "ADMIN" | "REVIEW";
  urgencyScore: number; // 0-100
  dueDate: string; // ISO
  requiresPhysicalSpace: string | null;
  requiresInternet: boolean;
  prerequisiteComplete: boolean;
  daysUntilDue: number;
  courseColor: string;
}

export interface CalendarEvent {
  title: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: "CLASS" | "APPOINTMENT" | "FOCUS_BLOCK" | "OTHER";
}

export interface DailyPlannerInput {
  studentName: string;
  planDate: string; // ISO date string, e.g., "2026-03-18"
  dayOfWeek: string; // "Monday", "Tuesday", etc.
  timezone: string;
  wakeUpTime: string; // HH:MM
  sleepTime: string; // HH:MM
  peakEnergyBlocks: string[]; // e.g., ["09:00-11:00", "14:00-16:00"]
  maxDeepWorkMinutes: number;
  preferredBreakMinutes: number;
  transitionBufferMin: number;
  pendingTasks: PendingMicroTask[];
  calendarEvents: CalendarEvent[]; // Fixed commitments to work around
  // Cognitive load context
  recentDayStreak: number; // Days of consecutive completions (higher = more capacity)
  tasksCompletedYesterday: number;
}

export interface PlannedTimeBlock {
  sequence: number;
  blockType: "DEEP_WORK" | "LIGHT_WORK" | "BREAK" | "TRANSITION" | "ADMIN" | "REVIEW";
  title: string;
  description: string;
  startInstruction: string | null; // null for breaks/transitions
  startTime: string; // HH:MM
  durationMinutes: number;
  microTaskId: string | null;
  courseCode: string | null;
  urgencySignal: "normal" | "watch" | "urgent"; // For visual indicator in UI
}

export interface DailyPlannerOutput {
  morningMessage: string; // Sent with the plan — warm, specific, not generic
  timeBlocks: PlannedTimeBlock[];
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  tasksScheduled: number;
  tasksDeferred: string[]; // microTaskIds that didn't fit — with reason
  planRationale: string; // Internal reasoning — not shown to student
  deferralWarnings: string[]; // Urgent tasks that were deferred — flag for parent view
}

export function buildDailyPlannerMessages(
  input: DailyPlannerInput
): ChatCompletionMessageParam[] {
  const tasksJson = input.pendingTasks
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .map((t) => ({
      id: t.microTaskId,
      course: t.courseCode,
      task: t.taskTitle,
      type: t.taskType,
      minutes: t.estimatedMinutes,
      urgency: t.urgencyScore,
      daysUntilDue: t.daysUntilDue,
      requiresSpace: t.requiresPhysicalSpace,
      canStart: t.prerequisiteComplete,
      startInstruction: t.startInstruction,
    }));

  const calendarJson = input.calendarEvents.map((e) => ({
    title: e.title,
    from: e.startTime,
    to: e.endTime,
    type: e.type,
  }));

  const systemPrompt = `You are RangeKeeper's daily planning engine. You build structured daily sequences for college students with ASD and ADHD.

YOUR JOB:
- Take a list of pending tasks and build one clean, ordered day sequence
- Output valid JSON — no markdown, no explanation outside JSON

SCHEDULING RULES:
1. PEAK ENERGY = DEEP WORK. Never waste a peak energy window on admin or light tasks.
2. AFTER LUNCH DIP (12:30-14:00): Schedule LIGHT_WORK or ADMIN, not DEEP_WORK.
3. TRANSITIONS ARE MANDATORY. Insert a 5-minute transition block whenever switching between tasks from different courses or different task types.
4. BREAKS ARE NOT OPTIONAL. After every deep work block, schedule a real break (minimum ${input.preferredBreakMinutes} minutes).
5. NEVER FILL 100% OF TIME. Leave at least 20% of waking hours unscheduled as buffer.
6. TASK ORDERING: Higher urgency first, but check prerequisites. Cluster same-course tasks when possible (reduces context switching).
7. IF IT WON'T FIT: Triage honestly. Include deferred task IDs in "tasksDeferred". Never create a schedule that's impossible to complete.
8. NEVER SCHEDULE PAST STUDENT'S SLEEP TIME.
9. RESPECT calendar events — never schedule over them.
10. IF TODAY HAS ZERO URGENT TASKS: Schedule only 1-2 tasks. Don't overwhelm when the day doesn't require it.

MORNING MESSAGE RULES:
- 2-4 sentences max
- Acknowledge the day specifically ("You've got a 2pm class, so let's front-load the reading")
- Name the actual tasks, not categories ("the Psych reading and one section of the essay")
- NEVER say "Great day ahead!" or "You've got this!" — be specific and real
- Tone: calm, matter-of-fact friend who happens to have your schedule

OUTPUT: Return valid JSON only. No markdown.`;

  const userPrompt = `Build ${input.dayOfWeek}'s plan for ${input.studentName}.

DATE: ${input.planDate}
SCHEDULE WINDOW: ${input.wakeUpTime} to ${input.sleepTime}
PEAK ENERGY: ${input.peakEnergyBlocks.join(", ")}
MAX FOCUS BLOCK: ${input.maxDeepWorkMinutes} min
BREAK PREFERENCE: ${input.preferredBreakMinutes} min
TRANSITION BUFFER: ${input.transitionBufferMin} min

RECENT CONTEXT:
- Day streak: ${input.recentDayStreak} consecutive completion days
- Tasks completed yesterday: ${input.tasksCompletedYesterday}
${input.recentDayStreak === 0 ? "- NOTE: Student hasn't completed tasks recently. Start light today. 2-3 tasks max." : ""}
${input.tasksCompletedYesterday >= 5 ? "- NOTE: High output yesterday. Student may be fatigued. Don't overload today." : ""}

FIXED CALENDAR EVENTS (do not schedule over these):
${calendarJson.length > 0 ? JSON.stringify(calendarJson, null, 2) : "No fixed events today."}

PENDING TASKS (sorted by urgency):
${JSON.stringify(tasksJson, null, 2)}

Build the day. Return this JSON structure:
{
  "morningMessage": "2-4 sentence message for student",
  "timeBlocks": [
    {
      "sequence": 1,
      "blockType": "DEEP_WORK",
      "title": "Block title (max 60 chars)",
      "description": "What to do in this block",
      "startInstruction": "First action to take",
      "startTime": "09:00",
      "durationMinutes": 45,
      "microTaskId": "mtask_001",
      "courseCode": "PSYCH 201",
      "urgencySignal": "normal"
    }
  ],
  "totalWorkMinutes": 90,
  "totalBreakMinutes": 20,
  "tasksScheduled": 3,
  "tasksDeferred": ["mtask_004"],
  "planRationale": "Internal explanation of scheduling decisions",
  "deferralWarnings": ["mtask_004 has urgencyScore 85 and is due in 2 days — flagging for parent"]
}`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}

export const dailyPlannerConfig = {
  model: "gpt-4o" as const,
  temperature: 0.4,
  response_format: { type: "json_object" as const },
  max_tokens: 3000,
};

// ============================================================
// POST-PROCESSING — Validate AI output before storing
// ============================================================

export function validateAndNormalizePlan(
  raw: DailyPlannerOutput,
  input: DailyPlannerInput
): DailyPlannerOutput {
  // 1. Ensure time blocks are strictly sequential (no overlaps)
  // 2. Ensure breaks exist between deep work blocks
  // 3. Ensure plan ends before sleepTime
  // 4. Ensure all microTaskIds in the plan actually came from input tasks
  // This function is implemented in src/lib/ai/plan-validator.ts

  const validTaskIds = new Set(input.pendingTasks.map((t) => t.microTaskId));
  const cleanedBlocks = raw.timeBlocks.filter(
    (b) => !b.microTaskId || validTaskIds.has(b.microTaskId)
  );

  return {
    ...raw,
    timeBlocks: cleanedBlocks,
  };
}
