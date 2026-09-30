import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL = "claude-sonnet-4-5";

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

function client(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function model(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
}

function textFrom(message: Anthropic.Message): string | null {
  const block = message.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text.trim() : null;
}

/** Strip fences / prose and keep the outermost JSON object or array. */
export function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : trimmed).trim();
  const objStart = candidate.indexOf("{");
  const arrStart = candidate.indexOf("[");
  let start = -1;
  if (objStart >= 0 && (arrStart < 0 || objStart < arrStart)) start = objStart;
  else if (arrStart >= 0) start = arrStart;
  if (start < 0) return candidate;
  const open = candidate[start];
  const close = open === "{" ? "}" : "]";
  const end = candidate.lastIndexOf(close);
  if (end > start) return candidate.slice(start, end + 1);
  return candidate.slice(start);
}

export type ClaudeTextResult = {
  text: string | null;
  stopReason: string | null;
};

export async function claudeText(opts: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<ClaudeTextResult> {
  const message = await client().messages.create({
    model: model(),
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.6,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });
  return {
    text: textFrom(message),
    stopReason: message.stop_reason,
  };
}

export async function claudeJson(opts: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const system = `${opts.system}

Respond with a single valid JSON object only — no markdown fences, no commentary.`;
  const { text, stopReason } = await claudeText({ ...opts, system });
  if (!text) {
    throw new Error("Claude returned an empty response. Try again.");
  }
  if (stopReason === "max_tokens") {
    throw new Error(
      "Claude ran out of output tokens mid-plan. Try again — if it keeps failing, set ANTHROPIC_MODEL to a higher-context model.",
    );
  }
  return extractJson(text);
}
