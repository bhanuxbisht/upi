# 🏦 Axis Bank — Credit Card SQL Seeds

## Execution Order (Supabase SQL Editor)
Run these files in **exactly this order** from a clean database:

| Step | File | Cards | Purpose |
|------|------|-------|---------|
| 1 | `seed_axis_knowledge.sql` | 14 | Master Base — all core Axis Bank credit cards |
| 2 | `patch_axis_remaining.sql` | 3 | Remaining cards (Reserve, Aura, Vistara) |

**Total: 17 Axis Bank credit cards**

## Sources
- `axisbank.com` (Official MITC PDFs)
- `paisabazaar.com`

## Notes
- Both files are idempotent — `seed` uses `DELETE WHERE bank = 'Axis Bank'` at the top
- `patch` uses targeted `DELETE WHERE id IN (...)` to prevent duplicates
- Axis Bank Vistara is inserted with `is_active = false` (Air India merger)
- Re-running is always safe
