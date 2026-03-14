# PayWise Model Training & Dataset Blueprint

> **Goal:** Transition from Retrieval-Augmented Generation (RAG) with Llama 3.3 to a fully fine-tuned proprietary Indian finance model (PayWise-7B or 8B).
> **Status:** Phase 4 Planning

---

## 1. Why Fine-Tune When We Have RAG?

RAG gives us accuracy by fetching data from the database. But fine-tuning gives us **financial reasoning intuition**. By training the model, it achieves:
- **Faster inference:** We don't have to load long instruction prompts with how to structure an answer snippet.
- **Tone & Expertise:** Inherently understanding Indian financial terms (SBI, HDFC, Rupay, UPI, RTGS, etc.) without having to explain them in the system prompt.
- **Lower Cost:** We can swap a huge 70B model for a fine-tuned 7B model locally or on a cheaper GPU, reducing token cost by 10x.

---

## 2. Model Selection

The target models suited for our specific fine-tuning task:
1. **Llama 3 (8B Instruct):** The best open-weights model for reasoning right now. Highly capable, runs very fast on low-cost hardware.
2. **Mistral (7B or 8x7B):** Excellent for JSON output and precise logic instructions.
3. **Qwen (7B/14B):** Has historically done very well with multilingual syntax (including hinglish or Indian entity recognition).

**Recommendation:** Fine-tune **Llama 3 8B Instruct** using LoRA/QLoRA (Parameter-Efficient Fine-Tuning).

---

## 3. Dataset Segments to Collect (The "Fuel")

An LLM is only as good as the raw data you feed it. We need ~2,000 to 5,000 highly curated Question-Answer pairs to fine-tune effectively.

### Segment A: Credit Card Rewards Data
We must train the model on the logic of *how to compare* cards.
- **What to collect:** 
  - Every major card's reward grid in JSON (e.g. `{"bank":"HDFC", "name":"Millennia", "online": "5%", "offline":"1%"}`)
- **Training Examples:**
  - *User:* "Is SBI Cashback better than HDFC Millennia for Amazon?"
  - *Assistant:* "Yes. SBI Cashback offers 5% direct cashback on Amazon without upper caps hindering standard purchases, whereas HDFC Millennia provides 5% as CashPoints..."

### Segment B: Offer Structuring & Freshness
The model must learn what features make an offer *stale* or *highly restrictive*.
- **Training Examples:**
  - *User:* "I got a 50% Swiggy coupon."
  - *Assistant:* "While it says 50% off, be cautious: most 50% coupons are capped at ₹100 max. Check the fine print inside the Swiggy app before finalizing the order."

### Segment C: Spending Anonymization & Feedback
The AI needs to act like an actionable financial advisor based on user transactions.
- **Data prep:** Transform real transactions into anonymous user personas.
- **Training Examples:**
  - *Context:* User spent ₹20,000 on flights but used a generic debit card.
  - *User:* "How did I do this month?"
  - *Assistant:* "You spent ₹20K on flights, but used a debit card. If you had used an SBI Cashback or HDFC Swiggy card, you would have earned ₹1,000 in cashback instantly."

### Segment D: UPI App Strategies
- **Training Examples:**
  - *User:* "I'm paying ₹30,000 in rent"
  - *Assistant:* "Don't use CRED to pay your rent if the convenience fee is 1.5% and your card only gives 1% back. Pay directly via bank transfer unless you are hitting an annual fee waiver target on your card."

---

## 4. How to Gain Info of Credit Cards

Instead of just manual entry, we will build an ingestion pipeline:
1. **Scraping Framework:** Build a `puppeteer` or `playwright` script strictly for banking sites (HDFC, SBI, ICICI) to monitor the Most Important Terms and Conditions (MITC) PDFs.
2. **Community Sourcing:** Use Reddit (`r/IndianCreditCards`) and forums (`CardExpert.in`, `Technofino`) to look for "devaluation" keywords so we update the DB immediately.
3. **Admin Verification Dashboard:** The scraped info is placed under "Pending Review" in our `admin/knowledge` panel. A human (CEO) clicks "Approve", which updates the RAG DB.
4. **Export to JSONL:** Every month, we export the approved DB items combined with our user Q&A logs into a `.jsonl` file to fine-tune the next iteration of the model.

---

## 5. End-to-End Fine-tuning Pipeline
1. **Data Formatting:** Synthesize data into ChatGPT format (`{"messages": [{"role": "system", "content": "You are PayWise..."}, {"role":"user",...}]}`).
2. **Evaluation Set:** Hold out 200 questions the model has never seen.
3. **Training Platform:** Run the fine-tuning on **Unsloth** (free/cheap on Google Colab or RunPod) to train 2x-5x faster using QLoRA.
4. **Deploying the Model:** Host the new weights on **Together AI**, **Anyscale**, or run locally on **vLLM** to cut API costs to near zero, while maintaining 10x faster speeds.

### Conclusion for CEO
Focus completely on getting 2,000 diverse Q&A pairs (the raw intelligence). The infrastructure is already designed to automatically format these pairs for fine-tuning as soon as you have them.
