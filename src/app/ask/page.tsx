"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, Loader2, MessageCircle, Zap, CreditCard, PiggyBank, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

interface UsageInfo {
    used: number;
    limit: number;
    remaining: number;
}

const QUICK_ACTIONS = [
    {
        icon: Zap,
        label: "Best way to pay at Swiggy?",
        message: "What's the best way to pay ₹500 at Swiggy right now?",
    },
    {
        icon: CreditCard,
        label: "Best credit card for food",
        message: "Which credit card gives the best cashback for food delivery?",
    },
    {
        icon: PiggyBank,
        label: "How much did I save?",
        message: "How much have I saved this month using PayWise?",
    },
    {
        icon: MessageCircle,
        label: "Analyze my spending",
        message: "Analyze my spending patterns and suggest ways to save more.",
    },
];

export default function AskPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [usage, setUsage] = useState<UsageInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        setError(null);
        const userMessage: Message = {
            role: "user",
            content: messageText.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: messageText.trim(),
                    conversationId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.upgrade) {
                    setError(data.message);
                } else {
                    setError(data.error || "Something went wrong");
                }
                return;
            }

            const assistantMessage: Message = {
                role: "assistant",
                content: data.response,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setConversationId(data.conversationId);
            setUsage(data.usage);
        } catch {
            setError("Failed to connect. Please try again.");
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setConversationId(null);
        setError(null);
        setInput("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
            {/* Header */}
            <div className="sticky top-16 z-30 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Ask PayWise AI</h1>
                            <p className="text-xs text-zinc-400">
                                Your personal payment assistant
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {usage && (
                            <span className="text-xs text-zinc-500">
                                {usage.remaining} queries left today
                            </span>
                        )}
                        {messages.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={startNewChat}
                                className="text-zinc-400 hover:text-white"
                            >
                                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                                New Chat
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="mx-auto max-w-3xl px-4 pb-40 pt-6">
                {messages.length === 0 ? (
                    /* Empty State — Quick Actions */
                    <div className="flex min-h-[60vh] flex-col items-center justify-center">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-2xl shadow-emerald-500/30">
                            <Bot className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-white">
                            Hi! I&apos;m PayWise AI 👋
                        </h2>
                        <p className="mb-8 text-center text-zinc-400">
                            I help you save money on every digital payment.
                            <br />
                            Ask me anything about offers, payments, or savings!
                        </p>

                        <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
                            {QUICK_ACTIONS.map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => sendMessage(action.message)}
                                    className="group flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-left transition-all hover:border-emerald-500/50 hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-emerald-500/5"
                                >
                                    <action.icon className="h-5 w-5 shrink-0 text-emerald-500 transition-transform group-hover:scale-110" />
                                    <span className="text-sm text-zinc-300 group-hover:text-white">
                                        {action.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Messages */
                    <div className="space-y-6">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user"
                                            ? "bg-emerald-600 text-white"
                                            : "border border-zinc-800 bg-zinc-900 text-zinc-200"
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {msg.content}
                                    </div>
                                    <div
                                        className={`mt-1 text-[10px] ${msg.role === "user" ? "text-emerald-200" : "text-zinc-600"
                                            }`}
                                    >
                                        {new Date(msg.timestamp).toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                                {msg.role === "user" && (
                                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-700">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Thinking...
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <Card className="border-red-900/50 bg-red-950/20 p-4">
                                <p className="text-sm text-red-400">{error}</p>
                                {error.includes("upgrade") && (
                                    <Button
                                        size="sm"
                                        className="mt-2 bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        Upgrade to Pro — ₹99/mo
                                    </Button>
                                )}
                            </Card>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area — Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800/50 bg-zinc-950/90 backdrop-blur-xl">
                <div className="mx-auto max-w-3xl px-4 py-4">
                    <div className="flex items-end gap-3">
                        <div className="relative flex-1">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about offers, payments, or savings..."
                                rows={1}
                                className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 pr-12 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                                style={{
                                    maxHeight: "120px",
                                    minHeight: "44px",
                                }}
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="h-11 w-11 shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="mt-2 text-center text-[10px] text-zinc-600">
                        PayWise AI may make mistakes. Always verify offers before transacting.
                    </p>
                </div>
            </div>
        </div>
    );
}
