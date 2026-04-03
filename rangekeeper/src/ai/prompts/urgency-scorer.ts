/**
 * Urgency Scorer Prompt
 *
 * Calculates a real urgency score (0–100) for a task based on multiple factors:
 * - Due date proximity
 * - Estimated effort remaining
 * - Blocking dependencies
 * - Grade/weight impact
 * - Student's historical completion velocity
 */

import { differenceInCalendarDays, format, addDays } from 'date-fns';

export interface TaskContext {
  taskId: string;
  title: string;
  description?: string;
  dueDate: Date;
  estimatedHoursRemaining: number;
  /** 0–1 fraction of grade this assignment represents */
  gradeWeight: number;
  /** IDs of tasks that must be completed before this one */
  blockedByTaskIds: string[];
  /** IDs of tasks that are blocked by this one */
  blockingTaskIds: string[];
  /** Average hours of focused work the student completes per day */
  historicalDailyVelocityHours: number;
  /** Fraction of tasks the student completes on time (0–1) */
  historicalOnTimeRate: number;
  /** Hours of work already completed on this task */
  hoursAlreadyCompleted: number;
}

export interface UrgencyResult {
  taskId: string;
  urgencyScore: number; // 0–100
  explanation: string;
  factors: {
    dueDateScore: number;
    effortScore: number;
    dependencyScore: number;
    gradeImpactScore: number;
    behavioralRiskScore: number;
  };
  recommendedStartByDate: Date;
  recommendedStartByLabel: string;
  warningFlags: string[];
}

/**
 * Builds the system prompt for the urgency scorer LLM call.
 */
export function buildUrgencyScorerSystemPrompt(): string {
  return `You are an academic urgency analyst specializing in executive function support for college students with ASD and ADHD.

Your role is to calculate a precise urgency score for academic tasks based on quantitative factors. You think like a behavioral coach combined with a project manager — you understand that urgency is not just about deadline proximity, but about the realistic gap between what needs to be done and what a specific student can accomplish given their personal work patterns.

When scoring urgency, you consider:
1. **Due date proximity** — How many days remain? Is the deadline today, this week, or next month?
2. **Effort gap** — Given the student's daily work velocity, how many days of focused work are needed? Does the math work out?
3. **Dependency chains** — Does this task block other tasks? Is this task itself blocked by incomplete predecessors?
4. **Grade impact** — High-weight assignments (midterms, finals, major projects) deserve elevated urgency even if distant.
5. **Behavioral risk** — Students with low on-time completion rates need earlier warnings. Past patterns predict future behavior.

You output a structured urgency analysis with:
- A single urgency score from 0 (no urgency) to 100 (critical / must start immediately)
- A clear, plain-language explanation the student can read
- A recommended "start by" date that gives them a realistic buffer
- Specific warning flags when risk factors compound

Be honest but not alarming. Your goal is to help students prioritize and act, not to create anxiety.`;
}

/**
 * Builds the user prompt for a specific task's urgency assessment.
 */
export function buildUrgencyScorerUserPrompt(
  task: TaskContext,
  allTasks: Array<{ id: string; title: string; dueDate: Date; isComplete: boolean }>,
  currentDate: Date = new Date()
): string {
  const daysUntilDue = differenceInCalendarDays(task.dueDate, currentDate);
  const workDaysNeeded =
    task.historicalDailyVelocityHours > 0
      ? Math.ceil(task.estimatedHoursRemaining / task.historicalDailyVelocityHours)
      : task.estimatedHoursRemaining; // fallback: 1 hour = 1 day if velocity unknown

  const bufferDays = daysUntilDue - workDaysNeeded;

  const blockedByDetails = task.blockedByTaskIds
    .map((id) => {
      const dep = allTasks.find((t) => t.id === id);
      if (!dep) return `  - Unknown task (id: ${id})`;
      const daysUntilDepDue = differenceInCalendarDays(dep.dueDate, currentDate);
      return `  - "${dep.title}" (due in ${daysUntilDepDue}d, complete: ${dep.isComplete})`;
    })
    .join('\n');

  const blockingDetails = task.blockingTaskIds
    .map((id) => {
      const dep = allTasks.find((t) => t.id === id);
      return dep ? `  - "${dep.title}" (due: ${format(dep.dueDate, 'MMM d')})` : `  - Unknown task (id: ${id})`;
    })
    .join('\n');

  const incompleteDependencies = task.blockedByTaskIds.filter((id) => {
    const dep = allTasks.find((t) => t.id === id);
    return dep && !dep.isComplete;
  });

  return `Please calculate an urgency score for the following academic task.

## Task Details
- **Title:** ${task.title}
- **Description:** ${task.description ?? 'No description provided'}
- **Due Date:** ${format(task.dueDate, 'EEEE, MMMM d, yyyy')} (${daysUntilDue} days from now)
- **Hours Already Completed:** ${task.hoursAlreadyCompleted}h
- **Estimated Hours Remaining:** ${task.estimatedHoursRemaining}h
- **Grade Weight:** ${(task.gradeWeight * 100).toFixed(1)}% of final grade

## Time Math
- Student's average daily work velocity: ${task.historicalDailyVelocityHours}h/day
- Work days needed at current velocity: ${workDaysNeeded} day(s)
- Buffer days (days remaining minus days needed): ${bufferDays} day(s)
${bufferDays < 0 ? '⚠️  NEGATIVE BUFFER — student cannot complete this at current pace without intervention.' : ''}

## Dependency Analysis
**Blocked by (must be done first):**
${blockedByDetails || '  None'}
${
  incompleteDependencies.length > 0
    ? `⚠️  ${incompleteDependencies.length} prerequisite(s) are NOT yet complete.`
    : ''
}

**Blocking (other tasks depend on this one):**
${blockingDetails || '  None'}

## Student Historical Patterns
- On-time completion rate: ${(task.historicalOnTimeRate * 100).toFixed(0)}%
- This student ${task.historicalOnTimeRate >= 0.8 ? 'generally completes work on time' : task.historicalOnTimeRate >= 0.5 ? 'sometimes struggles with deadlines' : 'frequently misses deadlines — higher urgency buffer is warranted'}.

## Your Task
Return a JSON object with exactly this structure:
\`\`\`json
{
  "urgencyScore": <number 0-100>,
  "explanation": "<2-4 sentence plain-language explanation for the student>",
  "factors": {
    "dueDateScore": <number 0-100>,
    "effortScore": <number 0-100>,
    "dependencyScore": <number 0-100>,
    "gradeImpactScore": <number 0-100>,
    "behavioralRiskScore": <number 0-100>
  },
  "recommendedStartByDate": "<ISO 8601 date string>",
  "warningFlags": ["<flag>", ...]
}
\`\`\`

Scoring guidance:
- dueDateScore: 0 = months away, 100 = due today or overdue
- effortScore: 0 = trivial remaining work, 100 = more work than time allows
- dependencyScore: 0 = no dependencies, 100 = blocking many tasks or blocked by incomplete prereqs
- gradeImpactScore: 0 = extra credit / low stakes, 100 = >30% of grade
- behavioralRiskScore: 0 = student always finishes early, 100 = student historically misses deadlines
- urgencyScore: weighted combination — be holistic, not purely arithmetic

Warning flags to consider:
- "DEADLINE_TODAY", "DEADLINE_TOMORROW", "NEGATIVE_BUFFER", "INCOMPLETE_DEPENDENCIES",
  "HIGH_GRADE_WEIGHT", "BLOCKING_OTHER_TASKS", "LOW_VELOCITY", "HISTORY_OF_LATE_SUBMISSION"`;
}

/**
 * Parses the LLM response and enriches it with computed fields.
 */
export function parseUrgencyResponse(
  rawJson: string,
  task: TaskContext,
  currentDate: Date = new Date()
): UrgencyResult {
  let parsed: {
    urgencyScore: number;
    explanation: string;
    factors: {
      dueDateScore: number;
      effortScore: number;
      dependencyScore: number;
      gradeImpactScore: number;
      behavioralRiskScore: number;
    };
    recommendedStartByDate: string;
    warningFlags: string[];
  };

  try {
    // Strip markdown code fences if present
    const cleaned = rawJson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse urgency scorer response: ${rawJson}`);
  }

  const startByDate = new Date(parsed.recommendedStartByDate);
  const isToday = differenceInCalendarDays(startByDate, currentDate) === 0;
  const isPast = startByDate < currentDate;

  const startByLabel = isPast
    ? 'Should have started already — start NOW'
    : isToday
    ? 'Start today'
    : `Start by ${format(startByDate, 'EEEE, MMMM d')}`;

  return {
    taskId: task.taskId,
    urgencyScore: Math.min(100, Math.max(0, Math.round(parsed.urgencyScore))),
    explanation: parsed.explanation,
    factors: parsed.factors,
    recommendedStartByDate: startByDate,
    recommendedStartByLabel: startByLabel,
    warningFlags: parsed.warningFlags ?? [],
  };
}

/**
 * Computes a deterministic urgency score without LLM for fast/offline use.
 * Used as a fallback or for pre-filtering before sending to the LLM.
 */
export function computeHeuristicUrgencyScore(
  task: TaskContext,
  allTasks: Array<{ id: string; isComplete: boolean }>,
  currentDate: Date = new Date()
): Pick<UrgencyResult, 'urgencyScore' | 'factors' | 'recommendedStartByDate' | 'warningFlags'> {
  const daysUntilDue = differenceInCalendarDays(task.dueDate, currentDate);

  // Due date score: exponential decay — closer = higher score
  const dueDateScore = daysUntilDue <= 0 ? 100 : daysUntilDue <= 1 ? 90 : daysUntilDue <= 3 ? 70 : daysUntilDue <= 7 ? 50 : daysUntilDue <= 14 ? 30 : daysUntilDue <= 30 ? 15 : 5;

  // Effort score: ratio of work days needed to days available
  const workDaysNeeded =
    task.historicalDailyVelocityHours > 0
      ? task.estimatedHoursRemaining / task.historicalDailyVelocityHours
      : task.estimatedHoursRemaining;
  const effortRatio = daysUntilDue > 0 ? workDaysNeeded / daysUntilDue : 10;
  const effortScore = Math.min(100, Math.round(effortRatio * 60));

  // Dependency score
  const incompleteDeps = task.blockedByTaskIds.filter((id) => {
    const dep = allTasks.find((t) => t.id === id);
    return dep && !dep.isComplete;
  });
  const blockingCount = task.blockingTaskIds.length;
  const dependencyScore = Math.min(100, incompleteDeps.length * 30 + blockingCount * 15);

  // Grade impact score
  const gradeImpactScore = Math.min(100, Math.round(task.gradeWeight * 200));

  // Behavioral risk score
  const behavioralRiskScore = Math.round((1 - task.historicalOnTimeRate) * 100);

  // Weighted composite
  const urgencyScore = Math.min(
    100,
    Math.round(
      dueDateScore * 0.35 +
        effortScore * 0.3 +
        dependencyScore * 0.15 +
        gradeImpactScore * 0.12 +
        behavioralRiskScore * 0.08
    )
  );

  // Recommended start date: work backwards from due date with buffer
  const bufferMultiplier = task.historicalOnTimeRate < 0.6 ? 1.5 : 1.2;
  const daysNeededWithBuffer = Math.ceil(workDaysNeeded * bufferMultiplier);
  const recommendedStartByDate = addDays(task.dueDate, -daysNeededWithBuffer);

  const warningFlags: string[] = [];
  if (daysUntilDue <= 0) warningFlags.push('DEADLINE_TODAY');
  if (daysUntilDue === 1) warningFlags.push('DEADLINE_TOMORROW');
  if (effortRatio > 1) warningFlags.push('NEGATIVE_BUFFER');
  if (incompleteDeps.length > 0) warningFlags.push('INCOMPLETE_DEPENDENCIES');
  if (task.gradeWeight >= 0.2) warningFlags.push('HIGH_GRADE_WEIGHT');
  if (blockingCount > 0) warningFlags.push('BLOCKING_OTHER_TASKS');
  if (task.historicalDailyVelocityHours < 1) warningFlags.push('LOW_VELOCITY');
  if (task.historicalOnTimeRate < 0.5) warningFlags.push('HISTORY_OF_LATE_SUBMISSION');

  return {
    urgencyScore,
    factors: { dueDateScore, effortScore, dependencyScore, gradeImpactScore, behavioralRiskScore },
    recommendedStartByDate,
    warningFlags,
  };
}
