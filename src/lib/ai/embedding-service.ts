/**
 * PayWise Embedding Service — Free Semantic Search
 * 
 * Generates vector embeddings using Hugging Face's free Inference API.
 * Model: sentence-transformers/all-MiniLM-L6-v2 (384 dimensions)
 * 
 * This is NOT training a model. We use a pre-trained model to convert
 * text into numbers (vectors). Similar text → similar vectors → semantic search.
 * 
 * Free tier: 1000 requests/day, no credit card needed.
 * Get your token at: https://huggingface.co/settings/tokens
 * 
 * Env var: HUGGINGFACE_API_KEY (optional — works without it but rate-limited)
 */

const HF_API_URL = "https://router.huggingface.co/hf-inference/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || "";
const EMBEDDING_DIMENSION = 384;

/**
 * Generate embedding for a single text string.
 * Returns a 384-dimension float array.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const cleanText = text.trim().slice(0, 512); // Model max is 512 tokens
    
    if (!cleanText) {
        return new Array(EMBEDDING_DIMENSION).fill(0);
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (HF_API_KEY) {
        headers["Authorization"] = `Bearer ${HF_API_KEY}`;
    } else {
        throw new Error("Missing HUGGINGFACE_API_KEY in .env.local - vector search requires authentication.");
    }

    const response = await fetch(HF_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
            inputs: cleanText,
            options: { wait_for_model: true },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`HuggingFace API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    // HF returns the embedding directly as a flat array of numbers
    // For sentence-transformers, it's a 1D array of 384 floats
    if (Array.isArray(result) && result.length === EMBEDDING_DIMENSION && typeof result[0] === "number") {
        return result;
    }
    
    // Sometimes HF wraps it in an extra array
    if (Array.isArray(result) && Array.isArray(result[0])) {
        const embedding = result[0];
        if (embedding.length === EMBEDDING_DIMENSION) {
            return embedding;
        }
    }

    throw new Error(`Unexpected embedding shape: ${JSON.stringify(result).slice(0, 200)}`);
}

/**
 * Generate embeddings for multiple texts in a single API call.
 * More efficient than calling generateEmbedding() in a loop.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    
    const cleanTexts = texts.map(t => t.trim().slice(0, 512));

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (HF_API_KEY) {
        headers["Authorization"] = `Bearer ${HF_API_KEY}`;
    } else {
        throw new Error("Missing HUGGINGFACE_API_KEY in .env.local - vector embedding requires authentication.");
    }

    const response = await fetch(HF_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
            inputs: cleanTexts,
            options: { wait_for_model: true },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`HuggingFace API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    // For multiple inputs, HF returns array of arrays
    if (Array.isArray(result) && result.length === texts.length) {
        return result.map((item: number[] | number[][]) => {
            if (Array.isArray(item) && item.length === EMBEDDING_DIMENSION && typeof item[0] === "number") {
                return item as number[];
            }
            // Nested array case
            if (Array.isArray(item) && Array.isArray(item[0])) {
                return (item as number[][])[0];
            }
            throw new Error(`Unexpected embedding item shape`);
        });
    }

    throw new Error(`Unexpected batch embedding shape: ${JSON.stringify(result).slice(0, 200)}`);
}

/**
 * Build a searchable text representation of a credit card for embedding.
 * Combines all relevant fields into a single descriptive string.
 */
export function buildCreditCardText(card: {
    bank: string;
    name: string;
    tier: string;
    network: string;
    bestFor: string[];
    rewards: Array<{ category: string; rewardRate: number; rewardType: string }>;
    pros: string[];
    annualFee: number;
}): string {
    const rewardSummary = card.rewards
        .map(r => `${r.category} ${r.rewardRate}% ${r.rewardType}`)
        .join(", ");
    return `${card.bank} ${card.name} ${card.tier} credit card. ${card.network} network. Best for ${card.bestFor.join(", ")}. Rewards: ${rewardSummary}. ${card.pros.join(". ")}. Annual fee ₹${card.annualFee}.`;
}

/**
 * Build a searchable text representation of a UPI app for embedding.
 */
export function buildUPIAppText(app: {
    name: string;
    strengthCategories: string[];
    weakCategories: string[];
    strategies: string[];
    creditCardLinkSupport: boolean;
    splitBillSupport: boolean;
}): string {
    return `${app.name} UPI app. Strong in ${app.strengthCategories.join(", ")}. Weak in ${app.weakCategories.join(", ")}. ${app.creditCardLinkSupport ? "Supports credit card linking." : ""} ${app.splitBillSupport ? "Supports split bills." : ""} Strategies: ${app.strategies.slice(0, 3).join(". ")}.`;
}

/**
 * Build a searchable text representation of a strategy for embedding.
 */
export function buildStrategyText(strategy: {
    title: string;
    category: string;
    difficulty: string;
    steps: string[];
    applicableTo: string[];
}): string {
    return `${strategy.title}. Category: ${strategy.category}. Difficulty: ${strategy.difficulty}. Applicable to ${strategy.applicableTo.join(", ")}. Steps: ${strategy.steps.slice(0, 3).join(". ")}.`;
}

/**
 * Check if the embedding service is configured and available.
 */
export function isEmbeddingConfigured(): boolean {
    return HF_API_KEY.length > 0;
}

export { EMBEDDING_DIMENSION };
