# 🏦 HDFC Bank — Credit Card SQL Seeds

## Execution Order (Supabase SQL Editor)
Run these files in **exactly this order** from a clean database:

| Step | File | Cards | Purpose |
|------|------|-------|---------|
| 1 | `seed_hdfc_knowledge.sql` | 23 | Master Base — all core HDFC credit cards |
| 2 | `patch_hdfc_remaining.sql` | 6 | Remaining cards (Diners Privilege, Bharat, 6E, Paytm etc.) |

**Total: 29 HDFC credit cards**

## Sources
- `hdfcbank.com` (Official MITC PDFs)
- `paisabazaar.com`

## Notes
- Both files are idempotent — `seed` uses `DELETE WHERE bank = 'HDFC Bank'` at the top
- `patch` uses targeted `DELETE WHERE id IN (...)` to prevent duplicates
- Re-running is always safe
