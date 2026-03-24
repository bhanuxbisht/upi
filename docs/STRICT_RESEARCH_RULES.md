# 🛑 STRICT CARD RESEARCH & AUDIT RULES
**Purpose:** This file enforces mandatory, non-negotiable rules for the AI when gathering, formatting, and inserting credit card data into the finance database.

If the user requests research on a NEW bank's credit cards, the AI MUST strictly follow these rules:

## Rule 1: Two Authorized Sources ONLY
When finding the fees, reward structures, mathematical vectors, and penalties for ANY credit card, the AI is legally restricted to using ONLY:
1. **The Official Bank Website / MITC PDFs** (e.g., `hdfcbank.com`, `sbicard.com`, `icicibank.com`)
2. **PaisaBazaar** (`paisabazaar.com`)

Random blogs, third-party unverified sites, and SEO-spam websites are **STRICTLY PROHIBITED**. If using web search, the AI must append `site:paisabazaar.com` or `site:[officialbank].com` to queries.

## Rule 2: Obsessive Focus on "Newest Date"
If conflicting data exists between 2021 and 2026, the AI MUST prioritize the latest available year (e.g., 2026). Old caps, old reward rates, and defunct partnerships must be aggressively filtered out.

## Rule 3: Zero Mathematical Assumptions
The `reward_math` and `penalties` JSON structures power the application's core calculators. 
- Missing data (like an APR rate or a cashback cap) leads to a broken calculator.
- The AI must explicitly search for "Late payment fee slabs", "Forex markup", and "Monthly reward point caps".
- If data cannot be confirmed via the two authorized sources, the AI must mark it as `VERIFY` rather than hallucinating an estimate. 

## Rule 4: The "Again and Again" Audit Report
Before or immediately after injecting new cards into the database, the AI MUST generate a formal Audit Report (similar to `FINANCE_DB_STRICT_AUDIT_REPORT.md`). 
- The AI must double-check its own generated JSON.
- It must explicitly test the highest reward tier against the merchant exclusions list.
- If it discovers an error, it must forcefully DELETE and RE-INSERT the corrected row. This self-auditing loop must run *"again and again"* until no inappropriate or missing data remains.
