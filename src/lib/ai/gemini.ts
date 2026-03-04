/**
 * Google Gemini AI Client
 * Handles all AI interactions for "Ask PayWise" chat
 * 
 * IMPORTANT: This module lazily initializes the Gemini client
 * so the app doesn't crash if @google/generative-ai isn't installed yet.
 */

import { PAYWISE_SYSTEM_PROMPT } from "./prompts";

const API_KEY = process.env.GOOGLE_AI_API_KEY || "";

export interface ChatMessage {
    role: "user" | "model";
    content: string;
    timestamp: string;
}

export interface AIChatResponse {
    response: string;
    tokensUsed: number;
    conversationId?: string;
}

// Lazy-loaded model instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _model: any = null;

async function getModel() {
    if (_model) return _model;

    if (!API_KEY) {
        return null;
    }

    try {
        const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = await import("@google/generative-ai");

        const genAI = new GoogleGenerativeAI(API_KEY);

        _model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: PAYWISE_SYSTEM_PROMPT,
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
            ],
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 1024,
            },
        });

        return _model;
    } catch (error) {
        console.error("[PayWise AI] Failed to initialize Gemini:", error);
        return null;
    }
}

/**
 * Send a message to Gemini with conversation history and user context
 */
export async function chatWithPayWise(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    userContext: string = ""
): Promise<AIChatResponse> {
    if (!API_KEY) {
        return {
            response: "AI features are not configured yet. Please set your GOOGLE_AI_API_KEY in .env.local",
            tokensUsed: 0,
        };
    }

    const model = await getModel();
    if (!model) {
        return {
            response: "AI service is temporarily unavailable. Please try again later.",
            tokensUsed: 0,
        };
    }

    try {
        // Build the conversation history for Gemini
        const history = conversationHistory.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history,
        });

        // Inject user context into the message
        const enrichedMessage = userContext
            ? `[User Context: ${userContext}]\n\nUser Question: ${userMessage}`
            : userMessage;

        const result = await chat.sendMessage(enrichedMessage);
        const response = result.response;
        const text = response.text();

        // Estimate token usage
        const estimatedTokens = Math.ceil((enrichedMessage.length + text.length) / 4);

        return {
            response: text,
            tokensUsed: estimatedTokens,
        };
    } catch (error) {
        console.error("[PayWise AI] Chat error:", error);
        return {
            response: "I encountered an error processing your request. Please try again.",
            tokensUsed: 0,
        };
    }
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
    return API_KEY.length > 0;
}
