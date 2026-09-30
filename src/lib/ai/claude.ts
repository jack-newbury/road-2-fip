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

/** Strip accidental markdown fences around JSON. */
export function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

export async function claudeText(opts: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string | null> {
  const message = await client().messages.create({
    model: model(),
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.6,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });
  return textFrom(message);
}

export async function claudeJson(opts: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string | null> {
  const system = `${opts.system}

Respond with a single valid JSON object only — no markdown fences, no commentary.`;
  const raw = await claudeText({ ...opts, system });
  return raw ? extractJson(raw) : null;
}
