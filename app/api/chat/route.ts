import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  MAX_CONTEXT_MESSAGES,
  MAX_MESSAGE_LENGTH,
} from "@/lib/rate-limit";
import { ChatApiRequest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_MODEL = "gemini-3.8-flash";

const SYSTEM_INSTRUCTION = `Ты — Vitro AI, интеллектуальный ассистент нового поколения в оптическом интерфейсе Liquid Glass.
Отвечай точно, структурированно и по делу. Используй аккуратный Markdown (заголовки, списки, таблицы, блоки кода с указанием языка), когда это улучшает читаемость.
Пиши на языке, на котором к тебе обратился пользователь.`;

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

function buildEndpoints(model: string, apiKey: string): string[] {
  const encodedKey = encodeURIComponent(apiKey);
  const encodedModel = encodeURIComponent(model);

  const generativeLanguageUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodedModel}:streamGenerateContent?alt=sse&key=${encodedKey}`;
  const vertexExpressUrl = `https://aiplatform.googleapis.com/v1/publishers/google/models/${encodedModel}:streamGenerateContent?alt=sse&key=${encodedKey}`;

  // Keys starting with "AQ." are often Vertex AI Express Mode keys; try Vertex first, then AI Studio
  if (apiKey.startsWith("AQ.")) {
    return [vertexExpressUrl, generativeLanguageUrl];
  }
  return [generativeLanguageUrl, vertexExpressUrl];
}

export async function GET() {
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const hasKey = Boolean(process.env.GEMINI_API_KEY?.trim());
  return NextResponse.json({
    model,
    configured: hasKey,
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(ip);

    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Превышен лимит запросов. Подождите ${rate.retryAfterSeconds} сек. перед следующим сообщением.`,
          code: "RATE_LIMITED",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfterSeconds),
          },
        }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Серверный ключ GEMINI_API_KEY не настроен. Добавьте его в .env.local или в настройки окружения Vercel.",
          code: "MISSING_API_KEY",
        },
        { status: 500 }
      );
    }

    let body: ChatApiRequest;
    try {
      body = (await req.json()) as ChatApiRequest;
    } catch {
      return NextResponse.json(
        { error: "Некорректный формат JSON в теле запроса.", code: "BAD_JSON" },
        { status: 400 }
      );
    }

    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Список сообщений пуст.", code: "EMPTY_MESSAGES" },
        { status: 400 }
      );
    }

    const trimmedContext = body.messages.slice(-MAX_CONTEXT_MESSAGES);
    const lastMessage = trimmedContext[trimmedContext.length - 1];

    if (!lastMessage || typeof lastMessage.content !== "string" || !lastMessage.content.trim()) {
      return NextResponse.json(
        { error: "Сообщение не может быть пустым.", code: "EMPTY_PROMPT" },
        { status: 400 }
      );
    }

    if (lastMessage.content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: `Сообщение слишком длинное (${lastMessage.content.length} симв.). Максимум — ${MAX_MESSAGE_LENGTH} символов.`,
          code: "MESSAGE_TOO_LONG",
        },
        { status: 400 }
      );
    }

    const contents = trimmedContext
      .filter((m) => typeof m.content === "string" && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content.slice(0, MAX_MESSAGE_LENGTH) }],
      }));

    const configuredModel = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
    const candidateModels = Array.from(
      new Set([
        configuredModel,
        "gemini-3.8-flash",
        "gemini-3.5-flash",
        "gemini-3-flash",
        "gemini-2.5-flash",
      ])
    );

    const payload = {
      systemInstruction: {
        role: "system",
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    };

    let upstreamResponse: Response | null = null;
    let lastStatus = 502;
    let lastErrorMessage = "Не удалось подключиться к Gemini API.";

    outerLoop: for (const modelName of candidateModels) {
      const endpoints = buildEndpoints(modelName, apiKey);
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: req.signal,
          });

          if (res.ok && res.body) {
            upstreamResponse = res;
            break outerLoop;
          }

          lastStatus = res.status;
          const errText = await res.text().catch(() => "");
          try {
            const parsedErr = JSON.parse(errText);
            const msg =
              parsedErr?.error?.message ||
              parsedErr?.[0]?.error?.message ||
              "";
            if (msg) {
              lastErrorMessage = msg;
            }
          } catch {
            if (errText) {
              lastErrorMessage = errText.slice(0, 240);
            }
          }

          // If rate limited (429), no need to retry other endpoints
          if (res.status === 429) {
            break outerLoop;
          }
        } catch (fetchErr) {
          if ((fetchErr as Error)?.name === "AbortError") {
            return new Response(null, { status: 499 });
          }
          lastErrorMessage = "Сеть или сервер Gemini API временно недоступны.";
        }
      }
    }

    if (!upstreamResponse || !upstreamResponse.body) {
      if (lastStatus === 429) {
        return NextResponse.json(
          {
            error:
              "Превышена квота Gemini API (429 Too Many Requests). Подождите немного и повторите попытку.",
            code: "UPSTREAM_RATE_LIMIT",
          },
          { status: 429 }
        );
      }
      if (lastStatus === 401 || lastStatus === 403) {
        return NextResponse.json(
          {
            error:
              "Ошибка авторизации Gemini API. Проверьте корректность ключа GEMINI_API_KEY в настройках сервера.",
            code: "INVALID_API_KEY",
          },
          { status: 401 }
        );
      }
      return NextResponse.json(
        {
          error: `Ошибка Gemini API (${lastStatus}): ${lastErrorMessage}`,
          code: "UPSTREAM_ERROR",
        },
        { status: lastStatus >= 400 && lastStatus < 600 ? lastStatus : 502 }
      );
    }

    const reader = upstreamResponse.body.getReader();
    const decoder = new TextDecoder("utf-8");
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let buffer = "";
        let emittedAnyText = false;

        const sendEvent = (data: Record<string, unknown>) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;

              const rawJson = trimmed.slice(5).trim();
              if (!rawJson || rawJson === "[DONE]") continue;

              try {
                const parsed = JSON.parse(rawJson);
                const candidates = parsed?.candidates;
                if (Array.isArray(candidates) && candidates.length > 0) {
                  const parts = candidates[0]?.content?.parts;
                  if (Array.isArray(parts)) {
                    for (const part of parts) {
                      if (typeof part?.text === "string" && part.text.length > 0) {
                        emittedAnyText = true;
                        sendEvent({ type: "delta", text: part.text });
                      }
                    }
                  }

                  const finishReason = candidates[0]?.finishReason;
                  if (
                    finishReason &&
                    finishReason !== "STOP" &&
                    finishReason !== "MAX_TOKENS" &&
                    !emittedAnyText
                  ) {
                    sendEvent({
                      type: "error",
                      error: `Ответ заблокирован фильтром безопасности (${finishReason}). Попробуйте переформулировать запрос.`,
                    });
                  }
                }
              } catch {
                // Ignore incomplete SSE fragment
              }
            }
          }

          if (!emittedAnyText) {
            sendEvent({
              type: "error",
              error:
                "Модель вернула пустой ответ. Попробуйте переформулировать сообщение.",
            });
          } else {
            sendEvent({ type: "done" });
          }
        } catch (streamErr) {
          if ((streamErr as Error)?.name !== "AbortError") {
            sendEvent({
              type: "error",
              error: "Соединение прервалось во время генерации ответа.",
            });
          }
        } finally {
          controller.close();
        }
      },
      cancel() {
        reader.cancel().catch(() => {});
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "Внутренняя ошибка сервера при обработке запроса.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

