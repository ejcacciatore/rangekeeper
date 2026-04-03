/**
 * RangeKeeper — Nudge Generator Prompt
 *
 * Purpose: Generate personalized, specific, actionable nudge messages.
 * NOT generic. NOT "Don't forget your assignment!"
 *
 * Design principles:
 * - Each nudge names the specific task and the specific first action
 * - Escalation levels: gentle → instructional → motivational → alert
 * - Respect that the student is an adult — no condescension
 * - Vary language across nudges so they don't feel robotic
 * - SMS-first: 160 chars max for Level 1-2, slightly more for Level 3
 * - Never shame. Never "you should have started earlier."
 * - Acknowledge the difficulty of starting without making it a big deal
 */

import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export type NudgeLevel = "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "LEVEL_4";
export type NudgeChannel = "SMS" | "PUSH" | "EMAIL" | "IN_APP";

export interface NudgeGeneratorInput {
  // Task context
  studentName: string;
  taskTitle: string;
  taskDescription: string;
  startInstruction: string;
  courseName: string;
  courseCode: string;
  assignmentTitle: string;
  estimatedMinutes: number;

  // Urgency context
  assignmentDueDate: string; // ISO
  daysUntilDue: number;
  minutesUntilDue: number;
  tasksRemainingForAssignment: number;
  totalTasksForAssignment: number;

  // Timing context
  scheduledStartTime: string; // HH:MM — when this block was supposed to start
  minutesPastScheduled: number; // How late the student is (0 = on time, 30 = 30 min late)
  timeOfDay: "morning" | "afternoon" | "evening";

  // Escalation context
  level: NudgeLevel;
  priorNudgesIgnored: number; // How many nudges have been sent without response
  studentHasResponded: boolean; // Did student respond to any nudge today?
  tasksCompletedToday: number;

  // Channel (affects length/format)
  channel: NudgeChannel;

  // Personal context (optional — used when available)
  streakDays: number;
  recentWinTitle: string | null; // Last task they completed
}

export interface NudgeGeneratorOutput {
  message: string;
  promptVersion: string;
}

const LEVEL_GUIDELINES = {
  LEVEL_1: {
    tone: "Calm and informational. Just a heads-up that the block is starting. Brief.",
    maxChars: 160,
    examples: [
      "Hey {name} — your {task} block starts now. Open {start}",
      "{task} is up. You've got {minutes} min. {start}",
      "Time for {course} — {task}. Just open {start} and you're moving.",
    ],
  },
  LEVEL_2: {
    tone: "More specific and instructional. Assume they saw the first nudge but didn't start. Give them the exact first step.",
    maxChars: 200,
    examples: [
      "Still on {task}. First step: {start}. That's it, just that one thing.",
      "{name}, {task} — step 1: {start}. Once it's open, you're started.",
      "Gentle push: open {start}. You don't have to finish, just get it open.",
    ],
  },
  LEVEL_3: {
    tone: "Acknowledge it's hard to start. Reframe the size. Name one specific small thing. Not pep talk — matter-of-fact.",
    maxChars: 280,
    examples: [
      "Starting is the hard part. For {task}, just do {start}. 5 minutes, that's all. You can bail after 5 if you need to.",
      "{task} feels big but it's really just {start}. That's the whole first step. Do that one thing.",
      "Not pushing — just noting {assignment} is due in {days} days and you've got {remaining} steps left. {start} is where it starts.",
    ],
  },
  LEVEL_4: {
    tone: "Factual status update for parent. Not alarming but informative.",
    maxChars: 300,
    examples: [
      "{name} has 3 scheduled tasks today and hasn't started. {assignment} is due in {days} days with {remaining} steps left.",
    ],
  },
};

export function buildNudgeGeneratorMessages(
  input: NudgeGeneratorInput
): ChatCompletionMessageParam[] {
  const levelGuidelines = LEVEL_GUIDELINES[input.level];
  const isParentNudge = input.level === "LEVEL_4";

  const systemPrompt = `You are RangeKeeper's nudge writer. You write personalized, specific notification messages for college students with ASD and ADHD.

CRITICAL RULES:
1. NEVER write "Don't forget!" or "Remember to!" or "You should" — these are shame-adjacent
2. NEVER be generic. Every message must name the specific task and specific first action
3. The startInstruction is your anchor — reference it in the message
4. Character limit for SMS: ${levelGuidelines.maxChars} chars MAXIMUM
5. Tone: ${levelGuidelines.tone}
6. Write in second person ("you", "your") — direct and personal
7. No exclamation marks in Level 1-2. One maximum in Level 3 (for genuine encouragement only)
8. No "Great job!" or "You've got this!" — respect the student as an adult
9. If student has completions today, you can briefly acknowledge that momentum
10. If student has a streak, you CAN mention it — "Day 5 — you've been on a run"

OUTPUT: Return a single JSON object: { "message": "the message text" }
Return ONLY the JSON. No explanation.`;

  const userPrompt = `Write a ${input.level} nudge message.

STUDENT: ${input.studentName}
CHANNEL: ${input.channel} (${levelGuidelines.maxChars} char max)

TASK TO NUDGE:
- Task: ${input.taskTitle}
- Description: ${input.taskDescription}
- First action: ${input.startInstruction}
- Course: ${input.courseCode} — ${input.courseName}
- Estimated time: ${input.estimatedMinutes} minutes
- Assignment: ${input.assignmentTitle}

TIMING:
- Scheduled start: ${input.scheduledStartTime}
- Minutes past scheduled: ${input.minutesPastScheduled} ${input.minutesPastScheduled === 0 ? "(on time)" : "(late)"}
- Time of day: ${input.timeOfDay}
- Days until assignment due: ${input.daysUntilDue}

CONTEXT:
- Prior nudges ignored: ${input.priorNudgesIgnored}
- Responded to any nudge today: ${input.studentHasResponded ? "yes" : "no"}
- Tasks completed today: ${input.tasksCompletedToday}
- Current streak: ${input.streakDays} days
- Last completed task: ${input.recentWinTitle ?? "none today"}
- Tasks remaining on this assignment: ${input.tasksRemainingForAssignment} of ${input.totalTasksForAssignment}

${input.level === "LEVEL_3" ? `This is the 3rd nudge. The student hasn't responded. Be honest about the time crunch without being alarming. Give them the smallest possible first step.` : ""}
${input.level === "LEVEL_4" ? `This message goes to a PARENT/COACH, not the student. Write a factual status update.` : ""}
${input.tasksCompletedToday > 0 ? `The student HAS completed ${input.tasksCompletedToday} task(s) today — acknowledge this briefly if appropriate.` : ""}

Return: { "message": "your message here" }`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}

export const nudgeGeneratorConfig = {
  model: "gpt-4o-mini" as const, // Cost optimization — high volume
  temperature: 0.7, // More variety so messages don't feel repetitive
  response_format: { type: "json_object" as const },
  max_tokens: 200,
};

// ============================================================
// EXAMPLE MESSAGES by Level (for UI preview / testing)
// ============================================================

export const nudgeExamples = {
  LEVEL_1: {
    sms: "Hey Alex — Psych reading block starts now. Open Canvas → PSYCH 201 → Week 4 → Reading 2",
    push: "Psych reading — 40 min. Open Canvas to start.",
  },
  LEVEL_2: {
    sms: "Still on Psych reading. Step 1: Open Canvas → PSYCH 201 → Week 4 → Reading 2. That's it.",
    push: "Psych reading: First step is just opening Canvas. That gets you started.",
  },
  LEVEL_3: {
    sms: "The Psych reading is 16 pages. Not small, but you've done harder. Open Canvas → Week 4 now. 5 minutes in and you'll be moving.",
    push: "Starting feels hard — but this is just 16 pages. Open Canvas → Week 4. Do 5 minutes. That's your only job right now.",
  },
  LEVEL_4: {
    sms: "Alex has 3 scheduled tasks today and hasn't started. Midterm Essay is due in 7 days with 5 steps remaining.",
  },
};

// ============================================================
// CELEBRATION MESSAGES (on task completion)
// ============================================================

export interface CelebrationInput {
  studentName: string;
  taskTitle: string;
  courseName: string;
  streakDays: number;
  tasksCompletedToday: number;
  wasUnderEstimate: boolean; // Did they finish faster than estimated?
  celebrationStyle: "emoji" | "minimal" | "verbose";
}

export function buildCelebrationMessage(input: CelebrationInput): string {
  const { studentName, taskTitle, tasksCompletedToday, streakDays, celebrationStyle, wasUnderEstimate } = input;

  const streakNote =
    streakDays >= 3
      ? ` Day ${streakDays} — you're on a run.`
      : "";

  const speedNote = wasUnderEstimate ? " Faster than expected." : "";

  if (celebrationStyle === "minimal") {
    return `✓ ${taskTitle} done.${streakNote}`;
  }

  if (celebrationStyle === "emoji") {
    const count = tasksCompletedToday;
    return `✅ ${taskTitle} — done! That's #${count} today.${speedNote}${streakDays >= 3 ? ` 🔥 Day ${streakDays}.` : ""}`;
  }

  // verbose
  return (
    `Nice work, ${studentName}. "${taskTitle}" is done. ` +
    `That's ${tasksCompletedToday} task${tasksCompletedToday !== 1 ? "s" : ""} today.` +
    speedNote +
    streakNote
  );
}
