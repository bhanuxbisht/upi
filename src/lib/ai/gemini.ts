/**
 * PayWise AI Client — Groq (MVP) / Gemini (Production)
 * 
 * Current: GROQ API (free tier, fast inference with Llama 3.3)
 * Future:  Google Gemini (when billing is enabled)
 * 
 * Switch guide: See /docs/AI_PROVIDER_SWITCH.md
 * 
 * Features:
 *   - Automatic retry on rate limits
 *   - Clean plain-text responses (no raw markdown)
 *   - Graceful error handling — never crashes the app
 */

import { PAYWISE_SYSTEM_PROMPT } from "./prompts";
import "server-only";

// ============================================================
// CURRENT PROVIDER: GROQ (Free MVP)
// To switch to Gemini later, see AI_PROVIDER_SWITCH.md
// ============================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ============================================================
// GEMINI CONFIG (Commented out — enable when billing is active)
// ============================================================
// const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY || "";
// const GEMINI_MODEL = "gemini-2.0-flash";

export interface ChatMessage {
    role: "user" | "model";
    content: string;
    timestamp: string;
}

export interface AIChatResponse {
    response: string;
    tokensUsed: number;
    conversationId?: string;
    model?: string;
}

/**
 * Strip markdown formatting to return plain readable text
 */
function stripMarkdown(text: string): string {
    return text
        // Remove bold **text** and __text__
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        // Remove italic *text* and _text_ (but not inside words)
        .replace(/(?<!\w)\*(.*?)\*(?!\w)/g, "$1")
        .replace(/(?<!\w)_(.*?)_(?!\w)/g, "$1")
        // Remove inline code `text`
        .replace(/`(.*?)`/g, "$1")
        // Remove headers # ## ### etc
        .replace(/^#{1,6}\s+/gm, "")
        // Clean up any double spaces
        .replace(/  +/g, " ")
        .trim();
}

/**
 * Helper — wait for ms
 */
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// GROQ IMPLEMENTATION (Active)
// ============================================================

async function chatWithGroq(
    userMessage: string,
    conversationHistory: ChatMessage[],
    userContext: string
): Promise<AIChatResponse> {
    // Convert our chat history to OpenAI format
    const messages: Array<{ role: string; content: string }> = [
        { role: "system", content: PAYWISE_SYSTEM_PROMPT },
    ];

    // Add conversation history
    for (const msg of conversationHistory) {
        messages.push({
            role: msg.role === "model" ? "assistant" : "user",
            content: msg.content,
        });
    }

    // Add current message with context
    const enrichedMessage = userContext
        ? `[User Context: ${userContext}]\n\nUser Question: ${userMessage}`
        : userMessage;

    messages.push({ role: "user", content: enrichedMessage });

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages,
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 0.9,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.error?.message || response.statusText;
        throw new Error(`Groq API error (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";
    const tokensUsed = data.usage?.total_tokens || Math.ceil((enrichedMessage.length + rawText.length) / 4);

    return {
        response: rawText,
        tokensUsed,
        model: GROQ_MODEL,
    };
}

// ============================================================
// GEMINI IMPLEMENTATION (Commented out for future use)
// ============================================================

/*
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _geminiModel: any = null;

async function getGeminiModel() {
    if (_geminiModel) return _geminiModel;
    if (!GEMINI_API_KEY) return null;

    try {
        const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        _geminiModel = genAI.getGenerativeModel({
            model: GEMINI_MODEL,
            systemInstruction: PAYWISE_SYSTEM_PROMPT,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 1024,
            },
        });

        return _geminiModel;
    } catch (error) {
        console.error("[PayWise AI] Failed to initialize Gemini:", error);
        return null;
    }
}

async function chatWithGemini(
    userMessage: string,
    conversationHistory: ChatMessage[],
    userContext: string
): Promise<AIChatResponse> {
    const model = await getGeminiModel();
    if (!model) throw new Error("Gemini not configured");

    const history = conversationHistory.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const enrichedMessage = userContext
        ? `[User Context: ${userContext}]\n\nUser Question: ${userMessage}`
        : userMessage;

    const result = await chat.sendMessage(enrichedMessage);
    const text = result.response.text();
    const estimatedTokens = Math.ceil((enrichedMessage.length + text.length) / 4);

    return {
        response: stripMarkdown(text),
        tokensUsed: estimatedTokens,
        model: GEMINI_MODEL,
    };
}
*/

// ============================================================
// PUBLIC API — Used by the rest of the app
// ============================================================

/**
 * Send a message to the AI with conversation history and user context.
 * Currently uses Groq. Switch to Gemini by uncommenting above and changing below.
 */
export async function chatWithPayWise(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    userContext: string = ""
): Promise<AIChatResponse> {
    const apiKey = GROQ_API_KEY;
    // For Gemini: const apiKey = GEMINI_API_KEY;

    if (!apiKey) {
        return {
            response: "AI features are not configured yet. Please set your GROQ_API_KEY in .env.local",
            tokensUsed: 0,
        };
    }

    // Try with retry on rate limit
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            // CURRENT: Groq
            const result = await chatWithGroq(userMessage, conversationHistory, userContext);
            // FUTURE: const result = await chatWithGemini(userMessage, conversationHistory, userContext);

            console.log(`[PayWise AI] Response from ${result.model} (${result.tokensUsed} tokens)`);
            return result;
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            const isRateLimit = errorMsg.includes("429") || errorMsg.toLowerCase().includes("rate") || errorMsg.toLowerCase().includes("quota");

            if (isRateLimit && attempt === 0) {
                console.warn("[PayWise AI] Rate limited, retrying in 3s...");
                await sleep(3000);
                continue;
            }

            console.error(`[PayWise AI] Error (attempt ${attempt + 1}):`, error);
        }
    }

    // All attempts failed
    return {
        response:
            "I'm currently experiencing high demand and can't process your request right now. " +
            "Please try again in a minute. You can still browse live offers on the Offers page!",
        tokensUsed: 0,
    };
}

/**
 * Quick single-turn query (no history)
 */
export async function quickAsk(
    question: string,
    context: string = ""
): Promise<string> {
    const result = await chatWithPayWise(question, [], context);
    return result.response;
}

/**
 * Check if AI is configured and available
 */
export function isAIConfigured(): boolean {
    // CURRENT: Groq
    return GROQ_API_KEY.length > 0;
    // FUTURE: return GEMINI_API_KEY.length > 0;
}
