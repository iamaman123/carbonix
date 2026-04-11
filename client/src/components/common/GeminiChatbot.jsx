import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "carbonix-me-1.vercel.app/api";
const CHAT_URL = `${API_BASE}/chatbot/chat`;

// ─── Module-level context cache ───────────────────────────────────────────────
let _cachedContext = null;
let _contextFetchPromise = null;

const fetchPlatformContext = () => {
  if (_cachedContext) return Promise.resolve(_cachedContext);
  if (_contextFetchPromise) return _contextFetchPromise;

  _contextFetchPromise = fetch(`${API_BASE}/chatbot/context`)
    .then((res) => res.json())
    .then((data) => {
      if (data.success) _cachedContext = data.context;
      _contextFetchPromise = null;
      return _cachedContext;
    })
    .catch((err) => {
      console.error("Failed to fetch chatbot context:", err);
      _contextFetchPromise = null;
      return null;
    });

  return _contextFetchPromise;
};

import ReactMarkdown from "react-markdown";

// ─── Component ────────────────────────────────────────────────────────────────
export default function GeminiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm the Carbonix assistant. Ask me anything about carbon credits, our platform, or available listings.",
      id: "welcome",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contextReady, setContextReady] = useState(!!_cachedContext);
  const [contextLoading, setContextLoading] = useState(false);

  const messagesEndRef = useRef(null);
  // Stores clean completed exchanges for multi-turn history (role: "user"/"model")
  const conversationRef = useRef([]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Prefetch context cache on mount
  useEffect(() => {
    if (!_cachedContext) {
      setContextLoading(true);
      fetchPlatformContext().then((ctx) => {
        if (ctx) setContextReady(true);
        setContextLoading(false);
      });
    } else {
      setContextReady(true);
    }
  }, []);

  // Typewriter effect using rAF
  const typewrite = useCallback((msgId, fullText) => {
    return new Promise((resolve) => {
      let i = 0;
      const CHUNK = 8;
      const tick = () => {
        i = Math.min(i + CHUNK, fullText.length);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? { ...m, text: fullText.slice(0, i), streaming: i < fullText.length }
              : m
          )
        );
        if (i < fullText.length) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }, []);

  const handleToggle = useCallback(() => setIsOpen((v) => !v), []);

  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;

      const assistantMsgId = `a-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        { role: "user", text: trimmed, id: Date.now().toString() },
        { role: "assistant", text: "", id: assistantMsgId, streaming: true },
      ]);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        // Send to backend proxy — API key never leaves the server
        const res = await fetch(CHAT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            // Send last 5 exchanges as history (role: "user"/"model" for Gemini)
            history: conversationRef.current.slice(-10),
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          const errMsg =
            res.status === 429
              ? "⏳ Too many requests — please wait a moment and try again."
              : data.message || "Something went wrong. Please try again.";
          setError(errMsg);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, text: "Sorry, I couldn't respond right now. Please try again.", streaming: false }
                : m
            )
          );
          return;
        }

        const reply = data.reply;

        // Store completed exchange in conversation history
        conversationRef.current = [
          ...conversationRef.current,
          { role: "user", parts: [{ text: trimmed }] },
          { role: "model", parts: [{ text: reply }] },
        ].slice(-12);

        await typewrite(assistantMsgId, reply);
      } catch (err) {
        console.error("Chat error:", err);
        setError("Network error — please check your connection and try again.");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, text: "Sorry, I couldn't respond right now. Please try again.", streaming: false }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, typewrite]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-3 flex w-[420px] flex-col rounded-2xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl border-b border-border/60 bg-primary/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Carbonix Assistant</p>
                <div className="flex items-center gap-1">
                  {contextLoading ? (
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      Loading platform data…
                    </span>
                  ) : contextReady ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-500">
                      <Zap className="h-2.5 w-2.5 fill-emerald-500" />
                      Live data ready
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Powered by Gemini</span>
                  )}
                </div>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={handleToggle}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close chat</span>
            </Button>
          </div>

          {/* Messages */}
          <div className="h-96 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    message.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground"
                  }`}
                >
                  {message.text ? (
                    <div className="text-sm leading-relaxed">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold text-foreground/90" {...props} />,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  ) : message.streaming ? (
                    <span className="flex items-center gap-1 py-0.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </span>
                  ) : null}
                </div>
              </div>
            ))}

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-border/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={contextLoading ? "Loading platform data…" : "Ask something…"}
                className="flex-1 rounded-xl"
                disabled={isLoading}
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="shrink-0 rounded-xl"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
              Powered by Gemini. Responses may be inaccurate — verify key details.
            </p>
          </form>
        </div>
      )}

      <Button
        size="lg"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={handleToggle}
        aria-label="Open Carbonix chat assistant"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    </div>
  );
}
