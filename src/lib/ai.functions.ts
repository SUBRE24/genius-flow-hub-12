import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function callAI(system: string, user: string): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limit exceeded. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please upgrade your plan.");
    throw new Error(`AI request failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

const EmailInput = z.object({
  recipient: z.string().min(1),
  purpose: z.string().min(1),
  tone: z.enum(["Professional", "Friendly", "Formal", "Casual", "Persuasive"]),
  keyPoints: z.string().optional().default(""),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => EmailInput.parse(v))
  .handler(async ({ data }) => {
    const system =
      "You are an expert email writer. Write a complete, ready-to-send email. Return ONLY the email itself with a Subject: line, then blank line, then body. No preamble or commentary.";
    const user = `Recipient: ${data.recipient}
Purpose: ${data.purpose}
Tone: ${data.tone}
Key points: ${data.keyPoints || "(none)"}\n\nWrite the email now.`;
    const content = await callAI(system, user);
    return { content };
  });

const NotesInput = z.object({
  notes: z.string().min(10),
});

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => NotesInput.parse(v))
  .handler(async ({ data }) => {
    const system = `You summarize meeting notes into clean markdown with EXACTLY these sections:
## Summary
A 2-3 sentence overview.
## Key Points
Bullet list of the most important discussion points.
## Decisions
Bullet list of decisions made (or "None recorded").
## Action Items
Bullet list. Each item formatted as: **Owner** — Task (due: date if any).
Return only the markdown.`;
    const content = await callAI(system, data.notes);
    return { content };
  });

const TasksInput = z.object({
  goal: z.string().min(1),
  timeframe: z.string().min(1),
  hoursPerDay: z.number().min(0.5).max(24),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => TasksInput.parse(v))
  .handler(async ({ data }) => {
    const system = `You are an AI task planner. Given a goal, timeframe, and daily availability, produce a realistic day-by-day plan. Return ONLY valid JSON matching this shape (no markdown fence):
{"overview": string, "days": [{"day": string, "focus": string, "tasks": [{"title": string, "durationMinutes": number, "priority": "high"|"medium"|"low"}]}]}`;
    const user = `Goal: ${data.goal}\nTimeframe: ${data.timeframe}\nDaily availability: ${data.hoursPerDay} hours`;
    const raw = await callAI(system, user);
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    try {
      return { plan: JSON.parse(cleaned) };
    } catch {
      return { plan: { overview: raw, days: [] } };
    }
  });
