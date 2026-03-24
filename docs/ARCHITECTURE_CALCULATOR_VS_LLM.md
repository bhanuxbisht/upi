# Deterministic Calculators vs. LLM Math (The PayWise Core Architecture)

**Why this matters:** LLMs are terrible at math. They guess numbers based on text patterns. If an AI hallucinates a mathematically proven savings number, investors and users lose trust immediately. 

## The Core Problem
Right now, our codebase is in a "Phase 1" transition state. We pass the rules (e.g., *10X points, max 10,000 CAP per month*) directly into the LLM prompt and ask it to calculate. While smart models (like Claude 3.5 or Llama 3) get this right 90% of the time, they will hallucinate on complex queries (e.g., predicting spending spread across 3 months with dynamic caps). 

## The "Relief" Solution: The Math Engine
To make our MVP mathematically invincible, we will build a **Deterministic Calculator** in TypeScript. This separates the "Reasoning Engine" (the AI) from the "Math Engine" (hard-coded TS limits).

Here is the 3-step architecture we are working toward:

### 1. The AI becomes the "Extractor" (Reasoning Engine)
When the user asks: *"I want to spend ₹10,000 on flight tickets on IndiGo."*
Instead of asking the AI to calculate the reward, we prompt the AI to simply extract the data into pure, structured JSON:
```json
{
  "spend_amount": 10000,
  "merchant": "IndiGo",
  "category": "travel"
}
```

### 2. TypeScript becomes the "Calculator" (Math Engine)
We write strict TypeScript functions (e.g., logically mapping in `src/lib/calculator.ts`) that take the AI's JSON output and the Card's JSON metadata from the database (e.g. `{"calculation_type": "points", "point_value": 0.25, "caps": {"5X": {"points": 10000}}}`).

TypeScript then runs standard, unbreakable code:
```typescript
if (merchant === "IndiGo" && card === "IndiGo SBI ELITE") {
    let base_points = (spend_amount / 100) * 7;  // 700 points
    return base_points * metadata.point_value;   // 700 * ₹1 = ₹700
}
```

### 3. The AI becomes the "Presenter"
Our TypeScript code hands the final, mathematically proven number (₹700) back to the LLM. 
The LLM then generates the friendly chat response: *"The best card for you is the IndiGo SBI ELITE! You will earn exactly 700 BluChips, which equals ₹700 in savings."*

---

## Why this is the ultimate CTO move:
By taking the math out of the LLM's hands, we achieve three vital things:
1. **Zero Hallucinations:** You can confidently show this to an investor and know the math will never be off by a single rupee. It is deterministic.
2. **Cheaper AI Costs:** We can use smaller, faster, cheaper AI models (like Llama 8B) because they don't have to be smart enough to solve complex algebra; they just need to extract text into JSON.
3. **Easy Rule Updates:** If SBI suddenly changes the BPCL cap from 2,500 points to 1,500 points, you just change one number in the Supabase database metadata. You don't have to "retrain" the AI at all! The Typescript calculator automatically reads the new real-time rule.

## Summary
* **LLM** = Understands what the user wants and translates it cleanly.
* **TypeScript** = Does the cold, hard, un-hallucinate-able math.
* **Database (Supabase)** = Holds the single source of truth for the active rules. 

*This is the exact architecture that billion-dollar fintech companies use to ensure their AI doesn't cost them money or trust!*
