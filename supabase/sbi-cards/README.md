# 🏦 SBI Card — Credit Card SQL Seeds

## Execution Order (Supabase SQL Editor)
Run these files in **exactly this order** from a clean database:

| Step | File | Cards | Purpose |
|------|------|-------|---------|
| 1 | `seed_sbi_knowledge.sql` | 27 | Master Base — all core SBI credit cards |
| 2 | `patch_sbi_remaining.sql` | 9 | Remaining niche/co-branded cards (Ola, Paytm, Air India etc.) |

**Total: 36 SBI credit cards**

## Sources
- `sbicard.com` (Official MITC PDFs)
- `paisabazaar.com`

## Notes
- Both files are idempotent — `seed` uses `DELETE WHERE bank = 'SBI Card'` at the top
- `patch` uses targeted `DELETE WHERE id IN (...)` to prevent duplicates
- Re-running is always safe
