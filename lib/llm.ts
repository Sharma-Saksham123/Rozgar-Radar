import { serverEnv } from "./env";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
}

export class LlmUnavailableError extends Error {
  constructor(message = "LLM_API_KEY is not configured") {
    super(message);
    this.name = "LlmUnavailableError";
  }
}

export function isLlmConfigured(): boolean {
  return Boolean(serverEnv.llmApiKey());
}

/**
 * Calls an OpenAI-compatible chat completions endpoint and returns the raw
 * assistant message. Throws on network or API errors.
 */
export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  const {
    temperature = 0.2,
    maxTokens = 700,
    jsonMode = false,
    timeoutMs = 25_000,
  } = options;

  const apiKey = serverEnv.llmApiKey();
  if (!apiKey) throw new LlmUnavailableError();

  const baseUrl = serverEnv.llmBaseUrl().replace(/\/+$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: serverEnv.llmModel(),
        messages,
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `LLM request failed (${response.status}): ${detail.slice(0, 300)}`,
      );
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    return payload.choices?.[0]?.message?.content ?? "";
  } finally {
    clearTimeout(timer);
  }
}

/** Strips markdown fences and returns parsed JSON, or null when unparseable. */
export function parseJson<T>(raw: string): T | null {
  if (!raw) return null;

  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Fall back to the first balanced JSON object in the text.
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
  }
}

/**
 * Chat call that guarantees a JSON object back. Returns null when the model
 * output cannot be parsed, so callers can fall back to rule-only behaviour.
 */
export async function chatJson<T>(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<T | null> {
  const raw = await chat(messages, { ...options, jsonMode: true });
  return parseJson<T>(raw);
}
