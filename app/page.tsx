"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ChatComposer } from "@/components/ChatComposer";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessageItem } from "@/components/ChatMessageItem";
import { ChatSidebar } from "@/components/ChatSidebar";
import { EmptyStateHero } from "@/components/EmptyStateHero";
import { GlassToastContainer } from "@/components/GlassToast";
import { MAX_MESSAGE_LENGTH } from "@/lib/rate-limit";
import {
  createInitialSession,
  deriveSessionTitle,
  loadActiveSessionId,
  loadRefractionEnabled,
  loadSavedTheme,
  loadSessions,
  saveActiveSessionId,
  saveRefractionEnabled,
  saveSessions,
  saveTheme,
} from "@/lib/storage";
import {
  ChatMessage,
  ChatSession,
  ThemeMode,
  ToastMessage,
} from "@/lib/types";

export default function LiquidGlassChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );

  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [refractionEnabled, setRefractionEnabled] = useState(true);
  const [modelName, setModelName] = useState("gemini-2.5-flash");

  const [isSidebarOpenDesktop, setIsSidebarOpenDesktop] = useState(true);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);

  const pushToast = useCallback(
    (
      type: ToastMessage["type"],
      title: string,
      description: string
    ) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, title, description }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5200);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Hydrate state from localStorage & system theme
  useEffect(() => {
    const savedTheme = loadSavedTheme();
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme: ThemeMode = savedTheme ?? (systemDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    const refract = loadRefractionEnabled();
    setRefractionEnabled(refract);

    const storedSessions = loadSessions();
    if (storedSessions.length > 0) {
      setSessions(storedSessions);
      const savedActive = loadActiveSessionId();
      const validActive = storedSessions.find((s) => s.id === savedActive);
      setActiveSessionId(
        validActive ? validActive.id : storedSessions[0].id
      );
    } else {
      const initial = createInitialSession();
      setSessions([initial]);
      setActiveSessionId(initial.id);
    }

    setHydrated(true);

    // Fetch active model metadata from server
    fetch("/api/chat")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.model) {
          setModelName(data.model);
        }
      })
      .catch(() => {});
  }, []);

  // Listen to OS prefers-color-scheme changes when user hasn't locked a manual choice
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      if (!loadSavedTheme()) {
        const next: ThemeMode = e.matches ? "dark" : "light";
        setTheme(next);
        document.documentElement.classList.toggle("dark", next === "dark");
      }
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Persist sessions & activeSessionId
  useEffect(() => {
    if (!hydrated) return;
    saveSessions(sessions);
  }, [sessions, hydrated]);

  useEffect(() => {
    if (!hydrated || !activeSessionId) return;
    saveActiveSessionId(activeSessionId);
  }, [activeSessionId, hydrated]);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ?? sessions[0];

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNearBottom = distanceFromBottom < 120;
    shouldAutoScrollRef.current = isNearBottom;
    setShowScrollBottom(!isNearBottom);
  }, []);

  // Auto-scroll when messages update
  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom(false);
    }
  }, [activeSession?.messages, scrollToBottom]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      saveTheme(next);
      return next;
    });
  }, []);

  const handleToggleRefraction = useCallback(() => {
    setRefractionEnabled((prev) => {
      const next = !prev;
      saveRefractionEnabled(next);
      return next;
    });
  }, []);

  const handleNewChat = useCallback(() => {
    if (isGenerating) {
      abortControllerRef.current?.abort();
      setIsGenerating(false);
      setStreamingMessageId(null);
    }

    // If current session is already empty, just focus it
    if (activeSession && activeSession.messages.length === 0) {
      setInput("");
      return;
    }

    const fresh = createInitialSession();
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    setInput("");
    shouldAutoScrollRef.current = true;
  }, [activeSession, isGenerating]);

  const handleDeleteSession = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (isGenerating && id === activeSessionId) {
        abortControllerRef.current?.abort();
        setIsGenerating(false);
        setStreamingMessageId(null);
      }

      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== id);
        if (remaining.length === 0) {
          const fresh = createInitialSession();
          setActiveSessionId(fresh.id);
          return [fresh];
        }
        if (id === activeSessionId) {
          setActiveSessionId(remaining[0].id);
        }
        return remaining;
      });
    },
    [activeSessionId, isGenerating]
  );

  const handleClearAll = useCallback(() => {
    if (isGenerating) {
      abortControllerRef.current?.abort();
      setIsGenerating(false);
      setStreamingMessageId(null);
    }
    const fresh = createInitialSession();
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    pushToast("info", "История очищена", "Все предыдущие диалоги были удалены.");
  }, [isGenerating, pushToast]);

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setStreamingMessageId(null);
    pushToast(
      "info",
      "Генерация остановлена",
      "Потоковый ответ был прерван по вашему запросу."
    );
  }, [pushToast]);

  const streamConversation = useCallback(
    async (
      sessionId: string,
      contextMessages: ChatMessage[],
      assistantMsgId: string
    ) => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsGenerating(true);
      setStreamingMessageId(assistantMsgId);
      shouldAutoScrollRef.current = true;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: contextMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          const errorMsg =
            errData?.error ||
            `Ошибка запроса (${response.status}). Попробуйте позже.`;

          pushToast(
            response.status === 429 ? "warning" : "error",
            response.status === 429
              ? "Превышен лимит запросов"
              : "Ошибка подключения к ИИ",
            errorMsg
          );

          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    updatedAt: Date.now(),
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: `⚠️ ${errorMsg}`,
                            isError: true,
                          }
                        : m
                    ),
                  }
                : s
            )
          );
          return;
        }

        if (!response.body) {
          throw new Error("Пустой поток ответа от сервера.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const block of lines) {
            const line = block.trim();
            if (!line.startsWith("data:")) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);
              if (event.type === "delta" && typeof event.text === "string") {
                accumulated += event.text;
                const snapshot = accumulated;
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === sessionId
                      ? {
                          ...s,
                          updatedAt: Date.now(),
                          messages: s.messages.map((m) =>
                            m.id === assistantMsgId
                              ? { ...m, content: snapshot }
                              : m
                          ),
                        }
                      : s
                  )
                );
              } else if (event.type === "error") {
                const errText =
                  event.error || "Ошибка при генерации ответа ИИ.";
                pushToast("error", "Ошибка генерации", errText);
                if (!accumulated) {
                  setSessions((prev) =>
                    prev.map((s) =>
                      s.id === sessionId
                        ? {
                            ...s,
                            messages: s.messages.map((m) =>
                              m.id === assistantMsgId
                                ? {
                                    ...m,
                                    content: `⚠️ ${errText}`,
                                    isError: true,
                                  }
                                : m
                            ),
                          }
                        : s
                    )
                  );
                }
              }
            } catch {
              // Ignore malformed chunk
            }
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          return;
        }
        const fallbackMsg =
          "Не удалось получить ответ от сервера. Проверьте соединение или ключ API.";
        pushToast("error", "Сбой соединения", fallbackMsg);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId && !m.content
                      ? { ...m, content: `⚠️ ${fallbackMsg}`, isError: true }
                      : m
                  ),
                }
              : s
          )
        );
      } finally {
        setIsGenerating(false);
        setStreamingMessageId(null);
        abortControllerRef.current = null;
      }
    },
    [pushToast]
  );

  const handleSendText = useCallback(
    async (rawText?: string) => {
      const textToSend = (rawText ?? input).trim();
      if (!textToSend || isGenerating || !activeSession) return;

      if (textToSend.length > MAX_MESSAGE_LENGTH) {
        pushToast(
          "warning",
          "Слишком длинное сообщение",
          `Максимальная длина сообщения — ${MAX_MESSAGE_LENGTH} символов.`
        );
        return;
      }

      const now = Date.now();
      const userMessage: ChatMessage = {
        id: `msg_user_${now}`,
        role: "user",
        content: textToSend,
        createdAt: now,
      };

      const assistantPlaceholder: ChatMessage = {
        id: `msg_ai_${now + 1}`,
        role: "assistant",
        content: "",
        createdAt: now + 1,
      };

      const updatedMessages = [
        ...activeSession.messages,
        userMessage,
        assistantPlaceholder,
      ];

      const nextTitle =
        activeSession.messages.length === 0
          ? deriveSessionTitle(textToSend)
          : activeSession.title;

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                title: nextTitle,
                updatedAt: now,
                messages: updatedMessages,
              }
            : s
        )
      );

      if (!rawText) {
        setInput("");
      }

      await streamConversation(
        activeSession.id,
        [...activeSession.messages, userMessage],
        assistantPlaceholder.id
      );
    },
    [activeSession, input, isGenerating, pushToast, streamConversation]
  );

  const handleRegenerate = useCallback(async () => {
    if (!activeSession || isGenerating) return;
    const msgs = activeSession.messages;
    if (msgs.length === 0) return;

    // Find last user message
    let lastUserIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "user") {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    const contextUpToUser = msgs.slice(0, lastUserIndex + 1);
    const now = Date.now();
    const newAssistantMsg: ChatMessage = {
      id: `msg_ai_regen_${now}`,
      role: "assistant",
      content: "",
      createdAt: now,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              updatedAt: now,
              messages: [...contextUpToUser, newAssistantMsg],
            }
          : s
      )
    );

    await streamConversation(
      activeSession.id,
      contextUpToUser,
      newAssistantMsg.id
    );
  }, [activeSession, isGenerating, streamConversation]);

  const handleCopyResponse = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        pushToast(
          "success",
          "Скопировано",
          "Текст ответа скопирован в буфер обмена."
        );
      } catch {
        pushToast(
          "error",
          "Ошибка копирования",
          "Не удалось получить доступ к буферу обмена."
        );
      }
    },
    [pushToast]
  );

  // Find last assistant message index for "Повторить ответ" button
  const messages = activeSession?.messages ?? [];
  let lastAssistantId: string | null = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") {
      lastAssistantId = messages[i].id;
      break;
    }
  }

  return (
    <div
      className={`relative flex h-dvh w-screen overflow-hidden ${
        refractionEnabled ? "refraction-enabled" : ""
      }`}
    >
      {/* Animated Liquid Blobs & SVG Optical Filters */}
      <AmbientBackground />

      {/* Glass Toast Notification Stack */}
      <GlassToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Sidebar (Desktop Collapsible + Mobile Glass Sheet) */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSession?.id ?? ""}
        isOpenDesktop={isSidebarOpenDesktop}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        onToggleDesktop={() => setIsSidebarOpenDesktop((v) => !v)}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAll}
      />

      {/* Main Workspace Column */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col h-full">
        {/* Top Floating Glass Header */}
        <ChatHeader
          title={activeSession?.title ?? "Новый диалог"}
          modelName={modelName}
          theme={theme}
          refractionEnabled={refractionEnabled}
          isSidebarOpenDesktop={isSidebarOpenDesktop}
          onToggleTheme={handleToggleTheme}
          onToggleRefraction={handleToggleRefraction}
          onOpenMobileSidebar={() => setIsSidebarOpenMobile(true)}
          onToggleDesktopSidebar={() => setIsSidebarOpenDesktop((v) => !v)}
          onNewChat={handleNewChat}
        />

        {/* Scrollable Message Stream */}
        <main
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="relative flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6"
          aria-label="Лента сообщений чата"
        >
          {messages.length === 0 ? (
            <EmptyStateHero
              modelName={modelName}
              onSelectPrompt={(promptText) => handleSendText(promptText)}
            />
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 pb-6">
              {messages.map((msg) => {
                // Hide empty placeholder bubble while LiquidThinkingDots is shown unless it already has tokens
                if (
                  msg.role === "assistant" &&
                  msg.content.length === 0 &&
                  streamingMessageId === msg.id
                ) {
                  return null;
                }
                return (
                  <ChatMessageItem
                    key={msg.id}
                    message={msg}
                    isStreaming={streamingMessageId === msg.id}
                    isLastAssistantMessage={msg.id === lastAssistantId}
                    onCopy={handleCopyResponse}
                    onRegenerate={handleRegenerate}
                  />
                );
              })}
            </div>
          )}
        </main>

        {/* Floating Scroll-To-Bottom Pill */}
        <AnimatePresence>
          {showScrollBottom && messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="pointer-events-none absolute bottom-28 left-1/2 z-30 -translate-x-1/2"
            >
              <button
                type="button"
                onClick={() => scrollToBottom(true)}
                className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold liquid-glass-strong text-[var(--text-primary)] shadow-lg"
                aria-label="Прокрутить вниз к последнему сообщению"
              >
                <ArrowDown className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                <span>Вниз</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Floating Glass Composer */}
        <ChatComposer
          input={input}
          onChange={setInput}
          onSend={() => handleSendText()}
          onStop={handleStopGeneration}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
}

