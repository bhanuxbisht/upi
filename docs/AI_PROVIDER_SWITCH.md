# AI Provider Switch Guide — PayWise

> This document tracks which AI provider PayWise uses and how to switch between them.

## Current Setup (MVP)

| Setting | Value |
|---------|-------|
| **Provider** | Groq |
| **Model** | `llama-3.3-70b-versatile` |
| **Cost** | Free tier (rate limited) |
| **API Key Env Var** | `GROQ_API_KEY` |
| **File** | `src/lib/ai/gemini.ts` |

### Why Groq for MVP?
- Completely free (no billing needed)
- Very fast inference (LPU hardware)
- Llama 3.3 70B is extremely capable
- OpenAI-compatible API (easy to integrate)
- No npm package needed — uses plain `fetch`

### Groq Free Tier Limits
- 30 requests per minute
- 14,400 requests per day
- 6,000 tokens per minute
- Good enough for MVP and early users

---

## Future Setup (Production)

| Setting | Value |
|---------|-------|
| **Provider** | Google Gemini |
| **Model** | `gemini-2.0-flash` |
| **Cost** | Pay-as-you-go |
| **API Key Env Var** | `GOOGLE_AI_API_KEY` |

### When to Switch?
Switch to Gemini when:
1. You have revenue and can enable Google Cloud billing
2. You need higher rate limits than Groq's free tier
3. You want to use Gemini-specific features (multimodal, etc.)

---

## How to Get API Keys

### Groq API Key (Current)
1. Go to https://console.groq.com
2. Sign up / Log in
3. Go to API Keys section
4. Click "Create API Key"
5. Copy the key
6. Add to `.env.local`: `GROQ_API_KEY=gsk_your_key_here`

### Google Gemini API Key (Future)
1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Enable billing on the linked Google Cloud project
4. Copy the key
5. Add to `.env.local`: `GOOGLE_AI_API_KEY=your_key_here`

---

## How to Switch from Groq to Gemini

### Step 1: Update `.env.local`
Make sure `GOOGLE_AI_API_KEY` is set in your `.env.local` file.

### Step 2: Edit `src/lib/ai/gemini.ts`

The file has clearly marked sections. You need to:

1. UNCOMMENT the Gemini implementation block (currently wrapped in /* */ comments)
2. In the `chatWithPayWise()` function, change:
   - `const apiKey = GROQ_API_KEY;` to `const apiKey = GEMINI_API_KEY;`
   - `const result = await chatWithGroq(...)` to `const result = await chatWithGemini(...)`
3. In the `isAIConfigured()` function, change:
   - `return GROQ_API_KEY.length > 0;` to `return GEMINI_API_KEY.length > 0;`
4. Also UNCOMMENT the two config lines at the top:
   - `const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY || "";`
   - `const GEMINI_MODEL = "gemini-2.0-flash";`

### Step 3: Restart the dev server
```bash
npm run dev
```

---

## History

| Date | Change | Reason |
|------|--------|--------|
| 2026-03-05 | Switched from Gemini to Groq | Gemini free tier quota exhausted (429 errors). Groq offers free Llama 3.3 70B with higher limits. |

---

## Notes
- Both providers use the same system prompt (`src/lib/ai/prompts.ts`)
- Both providers use the same chat route (`src/app/api/ai/chat/route.ts`)
- The `@google/generative-ai` npm package is still installed — no need to remove it
- Groq uses plain `fetch` — no extra npm package needed
