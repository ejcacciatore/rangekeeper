/**
 * RangeKeeper — Task Decomposer Prompt
 *
 * Purpose: Takes an assignment and breaks it into sequenced, specific micro-steps
 * that an ASD/ADHD student can actually execute without paralysis.
 *
 * Design principles:
 * - Each step must begin with a concrete, observable action (not "think about...")
 * - Steps sized for 15-45 minute blocks (match student's max deep work setting)
 * - Include "start instruction" — the exact first move to remove initiation barrier
 * - Output is structured JSON for direct DB insertion
 */

import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface TaskDecomposerInput {
  assignmentId: string;
  title: string;
  description: string | null;
  type: string; // ESSAY | READING | PROBLEM_SET | PROJECT | EXAM | etc.
  dueDate: string; // ISO string
  courseCode: string; // e.g., "PSYCH 201"
  courseName: string;
  pointsPossible: number | null;
  weight: number | null; // % of final grade
  lmsUrl: string | null;
  // Student context
  studentTimezone: string;
  maxDeepWorkMinutes: number; // student's preference (default 45)
  // Today's date for context
  currentDate: string; // ISO string
}

export interface DecomposedMicroTask {
  sequence: number;
  title: string;
  description: string;
  startInstruction: string; // The exact first action (open this, click here, type this)
  estimatedMinutes: number;
  taskType: "DEEP_WORK" | "LIGHT_WORK" | "ADMIN" | "REVIEW";
  requiresInternet: boolean;
  requiresPhysicalSpace: string | null; // "library quiet room", "lab", null
  prerequisiteSequence: number | null; // must complete task #N first
  aiNotes: string; // reasoning for this decomposition
}

export interface TaskDecomposerOutput {
  microTasks: DecomposedMicroTask[];
  totalEstimatedMinutes: number;
  difficulty: number; // 1-10
  aiSummary: string; // Short description for student: "This essay = 5 chunks, ~4 hours total"
}

export function buildTaskDecomposerMessages(
  input: TaskDecomposerInput
): ChatCompletionMessageParam[] {
  const daysUntilDue = Math.ceil(
    (new Date(input.dueDate).getTime() - new Date(input.currentDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const systemPrompt = `You are RangeKeeper's task decomposition engine. Your job is to break college assignments into specific, actionable micro-steps for students with ASD and ADHD.

CORE PRINCIPLES:
1. Task initiation is the hardest part for ASD/ADHD students. Every step MUST begin with a concrete physical action.
2. No step should be "think about X" or "plan Y" — always a concrete verb: Open, Write, Search, Read, Copy, Click, Download, List.
3. Steps should be completable in ${input.maxDeepWorkMinutes} minutes or less. If it takes longer, split it.
4. The "startInstruction" is the single first physical action — specific enough that the student can do it in 5 seconds. Example: "Open Chrome → go to lib.umich.edu → click JSTOR → search 'cognitive bias 2020'"
5. Never ask the student to "research" broadly — give them a specific starting point.
6. Include a review/submission step at the end — students with ADHD often forget to submit.
7. Consider task TYPE when sizing: Reading tasks = minutes per page (avg 3 min/page college text). Essay tasks = sequential (gather → outline → draft section by section → edit). Problem sets = one problem at a time.

OUTPUT FORMAT: Return valid JSON matching the schema exactly. No markdown, no explanation outside the JSON.`;

  const userPrompt = `Break down this assignment into micro-steps.

ASSIGNMENT DETAILS:
Title: ${input.title}
Course: ${input.courseCode} — ${input.courseName}
Type: ${input.type}
Due: ${input.dueDate} (${daysUntilDue} days from now)
Points: ${input.pointsPossible ?? "not specified"}
Grade weight: ${input.weight ? `${input.weight}% of final grade` : "not specified"}
${input.lmsUrl ? `LMS URL: ${input.lmsUrl}` : ""}

Assignment description:
${input.description ?? "No description provided. Use assignment title and course context to infer requirements."}

STUDENT CONTEXT:
- Max preferred focus block: ${input.maxDeepWorkMinutes} minutes
- Days until due: ${daysUntilDue}

REQUIREMENTS:
- Each step: 10-${input.maxDeepWorkMinutes} minutes maximum
- startInstruction: specific enough to execute in 5 seconds (include URLs, navigation paths)
- sequence: starts at 1, strictly ordered
- prerequisiteSequence: null unless this step truly cannot start until another is done
- taskType: DEEP_WORK (high focus), LIGHT_WORK (low focus ok), ADMIN (logistics), REVIEW (checking work)

Return this JSON structure:
{
  "microTasks": [
    {
      "sequence": 1,
      "title": "Short action title (max 60 chars)",
      "description": "What to do and why it matters for the assignment",
      "startInstruction": "The exact first physical action. Include URLs, app names, file paths.",
      "estimatedMinutes": 20,
      "taskType": "DEEP_WORK",
      "requiresInternet": true,
      "requiresPhysicalSpace": null,
      "prerequisiteSequence": null,
      "aiNotes": "Why this step and this size"
    }
  ],
  "totalEstimatedMinutes": 120,
  "difficulty": 6,
  "aiSummary": "This essay breaks into 6 steps totaling about 2 hours. Heaviest work is the draft — I split that into intro + 3 body sections so you can tackle one at a time."
}`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}

export const taskDecomposerConfig = {
  model: "gpt-4o" as const,
  temperature: 0.3, // Low temp — consistent, structured decomposition
  response_format: { type: "json_object" as const },
  max_tokens: 2000,
};

// ============================================================
// EXAMPLE DECOMPOSITION (for testing / reference)
// ============================================================

export const exampleInput: TaskDecomposerInput = {
  assignmentId: "assign_example",
  title: "Midterm Essay: Cognitive Bias Analysis",
  description:
    "Write a 1500-word essay analyzing three cognitive biases of your choice. " +
    "You must cite at least 3 peer-reviewed sources published after 2015. " +
    "APA format required. Submit as PDF via Canvas.",
  type: "ESSAY",
  dueDate: "2026-03-25T23:59:00Z",
  courseCode: "PSYCH 201",
  courseName: "Introduction to Psychology",
  pointsPossible: 100,
  weight: 20,
  lmsUrl: "https://umich.instructure.com/courses/123/assignments/456",
  studentTimezone: "America/Detroit",
  maxDeepWorkMinutes: 45,
  currentDate: "2026-03-18T10:00:00Z",
};

export const exampleOutput: TaskDecomposerOutput = {
  microTasks: [
    {
      sequence: 1,
      title: "Pick 3 cognitive biases to write about",
      description:
        "Choose 3 biases from the course — pick ones from the lecture slides you found most interesting. Don't overthink this; any 3 work.",
      startInstruction:
        "Open your PSYCH 201 notes folder → find Week 3-4 lecture slides → skim the bias names → write down any 3 that you remember or found interesting",
      estimatedMinutes: 15,
      taskType: "LIGHT_WORK",
      requiresInternet: false,
      requiresPhysicalSpace: null,
      prerequisiteSequence: null,
      aiNotes:
        "Decision paralysis is real for ASD/ADHD. This step is scoped to course material only, reducing search space.",
    },
    {
      sequence: 2,
      title: "Find 3 academic sources (JSTOR)",
      description:
        "Find one journal article per bias. You need author, year, title, and a quote or stat you can use.",
      startInstruction:
        "Open Chrome → go to lib.umich.edu → click Databases → click JSTOR → search '[bias name] cognitive psychology 2016-2026' → open first relevant result",
      estimatedMinutes: 40,
      taskType: "DEEP_WORK",
      requiresInternet: true,
      requiresPhysicalSpace: null,
      prerequisiteSequence: 1,
      aiNotes:
        "Scoped to JSTOR specifically to avoid analysis paralysis of the open internet. One source per bias = 3 total.",
    },
    {
      sequence: 3,
      title: "Write outline (thesis + 3 sections)",
      description:
        "Create a one-page outline: thesis statement + 3 body section headers + 2-3 bullet points per section",
      startInstruction:
        "Open Google Docs → create new doc titled 'PSYCH 201 Midterm Essay' → type 'THESIS:' on line 1 → write one sentence: 'This essay examines [bias1], [bias2], and [bias3] to show that...'",
      estimatedMinutes: 25,
      taskType: "DEEP_WORK",
      requiresInternet: false,
      requiresPhysicalSpace: null,
      prerequisiteSequence: 2,
      aiNotes: "Outline before drafting prevents blank-page paralysis.",
    },
    {
      sequence: 4,
      title: "Draft intro + first body section (~400 words)",
      description:
        "Write the introduction (150 words) and the first bias section (250 words) only. Stop there.",
      startInstruction:
        "Open your Google Doc → go to 'THESIS:' section → write 1 sentence about why cognitive biases matter → write 1 sentence per bias as a roadmap → then move to Section 1 header",
      estimatedMinutes: 45,
      taskType: "DEEP_WORK",
      requiresInternet: false,
      requiresPhysicalSpace: null,
      prerequisiteSequence: 3,
      aiNotes:
        "Chunked to ~400 words. Stopping at section 1 prevents marathon sessions that exhaust ASD students.",
    },
    {
      sequence: 5,
      title: "Draft body sections 2 and 3 (~700 words)",
      description:
        "Write the remaining two bias sections. Each: define the bias, explain the research, give a real-world example.",
      startInstruction:
        "Open your Google Doc → scroll to Section 2 header → write the first sentence: '[Bias name] is defined as...' → follow your outline bullets",
      estimatedMinutes: 45,
      taskType: "DEEP_WORK",
      requiresInternet: false,
      requiresPhysicalSpace: null,
      prerequisiteSequence: 4,
      aiNotes: "Second focused session. Resume where left off — no restarting.",
    },
    {
      sequence: 6,
      title: "Write conclusion + APA references",
      description:
        "Write a 200-word conclusion summarizing your 3 points. Then format your 3 sources in APA.",
      startInstruction:
        "Open your Google Doc → scroll to end → write 'Conclusion:' → write 2 sentences summarizing what you argued → then go to Scribbr APA generator (scribbr.com/apa-citation-generator/) to format each source",
      estimatedMinutes: 30,
      taskType: "LIGHT_WORK",
      requiresInternet: true,
      requiresPhysicalSpace: null,
      prerequisiteSequence: 5,
      aiNotes: "Scribbr link avoids manual APA formatting stress.",
    },
    {
      sequence: 7,
      title: "Proofread + submit via Canvas",
      description:
        "Read through once for obvious errors. Check word count (needs 1500+). Export PDF and submit.",
      startInstruction:
        "Open your Google Doc → press Ctrl+A → look at word count in bottom bar → if 1500+, go to File → Download → PDF → then open Canvas link → click Submit Assignment → upload the PDF",
      estimatedMinutes: 20,
      taskType: "ADMIN",
      requiresInternet: true,
      requiresPhysicalSpace: null,
      prerequisiteSequence: 6,
      aiNotes:
        "Explicit submit step prevents the classic ADHD 'finished but forgot to submit'.",
    },
  ],
  totalEstimatedMinutes: 220,
  difficulty: 6,
  aiSummary:
    "This essay breaks into 7 steps totaling about 3.5 hours. The heaviest work (drafting) is split into two 45-min sessions. You don't have to do it all at once — steps 1-3 one day, steps 4-5 the next, steps 6-7 the day before due works perfectly.",
};
