"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, RotateCcw, Zap, CreditCard, PiggyBank, MessageCircle, TrendingDown, Receipt, ShieldCheck, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

interface Insight {
    id: string;
    type: string;
    title: string;
    description: string;
    savingsAmount: number;
    action: string;
    actionLink?: string;
    urgency: string;
    icon: string;
}

const QUICK_ACTIONS = [
    {
        icon: Zap,
        label: "Best way to pay at Swiggy?",
        message: "What's the best way to pay ₹500 at Swiggy right now? Show me exact savings with each option.",
        color: "text-orange-400",
    },
    {
        icon: CreditCard,
        label: "Best credit card for me",
        message: "Based on my spending patterns, which credit card would save me the most money? Compare the top 3 options with exact annual savings.",
        color: "text-blue-400",
    },
    {
        icon: PiggyBank,
        label: "How to save ₹5000/month",
        message: "Give me a specific weekly routine to save ₹5000/month on my digital payments. Include exact apps and cards to use.",
        color: "text-green-400",
    },
    {
        icon: TrendingDown,
        label: "Analyze my spending",
        message: "Analyze my spending patterns. How much am I leaving on the table? What are my biggest missed savings? Give me exact ₹ amounts.",
        color: "text-red-400",
    },
    {
        icon: Receipt,
        label: "Stack offers for Amazon",
        message: "How do I stack multiple discounts for an Amazon purchase? Show me the exact step-by-step with card + coupon + cashback combo.",
        color: "text-yellow-400",
    },
    {
        icon: ShieldCheck,
        label: "Optimize my bills",
        message: "Which app should I use for each monthly bill (electricity, mobile, broadband, credit card) to maximize cashback? Give me a bill-by-bill plan.",
        color: "text-purple-400",
    },
    {
        icon: Target,
        label: "Rent via credit card",
        message: "Is it profitable to pay rent via CRED using a credit card? Show me the math — which cards make it net positive after the 1.5% fee?",
        color: "text-teal-400",
    },
    {
        icon: MessageCircle,
        label: "Subscription audit",
        message: "Help me audit my subscriptions. Which OTT platforms are already included in mobile plans? Where am I wasting money?",
        color: "text-pink-400",
    },
];

export default function AskPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [usage, setUsage] = useState<UsageInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [insights, setInsights] = useState<Insight[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Fetch proactive insights on mount
    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await fetch("/api/ai/insights");
                if (res.ok) {
                    const data = await res.json();
                    setInsights(data.insights?.slice(0, 3) || []);
                }
            } catch {
                // Silently fail — insights are supplementary
            }
        };
        fetchInsights();
    }, []);

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
                    // Send undefined (omitted) instead of null to avoid Zod issues
                    ...(conversationId ? { conversationId } : {}),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    setError("Please log in to use the AI assistant.");
                } else if (data.upgrade) {
                    setError(data.message);
                } else if (res.status === 429) {
                    setError(data.error || "You've reached the rate limit. Please wait a moment and try again.");
                } else {
                    setError(data.error || "Something went wrong. Please try again.");
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
            setError("Failed to connect to PayWise AI. Please check your connection and try again.");
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
        <div className="min-h-screen bg-background text-foreground flex flex-col pt-24 md:pt-28">
            {/* Header */}
            <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-lg font-medium text-foreground tracking-tight">PayWise AI</h1>
                            <p className="text-xs text-muted-foreground">
                                Trained on 14 credit cards, 6 UPI apps & 100+ offers
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
            <div className="mx-auto max-w-3xl px-4 pb-40 pt-8 flex-1 w-full">
                {messages.length === 0 ? (
                    /* Empty State — Quick Actions + Insights */
                    <div className="flex flex-col items-center justify-center pt-6">
                        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/20">
                            <Bot className="h-7 w-7 text-emerald-400" />
                        </div>
                        <h2 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">
                            PayWise AI
                        </h2>
                        <p className="mb-1 text-center text-sm text-muted-foreground max-w-md">
                            Your personal payment optimization expert. I know every credit card reward, UPI cashback, and offer stacking trick in India.
                        </p>
                        <p className="mb-8 text-center text-xs text-emerald-500/80">
                            Average user saves ₹2,000-5,000/month
                        </p>

                        {/* Proactive Insights Feed */}
                        {insights.length > 0 && (
                            <div className="w-full max-w-lg mb-8">
                                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Zap className="h-3 w-3 text-yellow-500" />
                                    Insights for you
                                </h3>
                                <div className="space-y-2">
                                    {insights.map((insight) => (
                                        <button
                                            key={insight.id}
                                            onClick={() => sendMessage(insight.action)}
                                            className="group w-full flex items-start gap-3 rounded-xl border border-border bg-card/50 p-3.5 text-left transition-all hover:bg-muted/50 hover:border-emerald-500/30"
                                        >
                                            <span className="text-lg mt-0.5">{insight.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-foreground truncate">
                                                        {insight.title}
                                                    </span>
                                                    {insight.savingsAmount > 0 && (
                                                        <span className="shrink-0 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                                            Save ₹{insight.savingsAmount}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                    {insight.description}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Actions Grid */}
                        <div className="w-full max-w-lg">
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                Try asking
                            </h3>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {QUICK_ACTIONS.map((action) => (
                                    <button
                                        key={action.label}
                                        onClick={() => sendMessage(action.message)}
                                        className="group flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3.5 text-left transition-all hover:bg-muted/50 hover:shadow-sm hover:border-foreground/20"
                                    >
                                        <action.icon className={`h-4.5 w-4.5 shrink-0 ${action.color} transition-transform group-hover:scale-110`} />
                                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                            {action.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Messages */
                    <div className="space-y-8">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border">
                                        <Bot className="h-4 w-4 text-foreground" />
                                    </div>
                                )}
                                {msg.role === "user" && (
                                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[85%] rounded-2xl px-5 py-4 ${msg.role === "user"
                                        ? "bg-foreground text-background"
                                        : "bg-muted/50 border border-border text-foreground"
                                        }`}
                                >
                                    {msg.role === "assistant" ? (
                                        <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-li:my-0.5">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {msg.content}
                                        </div>
                                    )}
                                    <div
                                        className={`mt-2 text-xs opacity-50 text-right`}
                                    >
                                        {new Date(msg.timestamp).toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-4">
                                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border">
                                    <Bot className="h-4 w-4 text-foreground" />
                                </div>
                                <div className="rounded-2xl border border-border bg-muted/50 px-5 py-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="mx-auto max-w-3xl px-4 py-4">
                    <div className="flex items-end gap-3">
                        <div className="relative flex-1">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything — 'Best card for Swiggy?', 'How to stack Amazon offers?'..."
                                rows={1}
                                className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-colors"
                                style={{
                                    maxHeight: "120px",
                                    minHeight: "48px",
                                }}
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            variant="secondary"
                            className="h-12 w-12 shrink-0 rounded-xl bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30 disabled:hover:bg-foreground"
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
