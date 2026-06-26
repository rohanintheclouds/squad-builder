# Player data & ratings

All player data lives in **`src/data/players.json`** (the single source of truth). The app
loads it via `src/data/players.ts`, which also attaches the hidden rating and splits the pool:

- `PLAYERS` — everyone (used by **Road to the World Cup**)
- `MANAGER_PLAYERS` — only players with a market value (used by **Squad Builder**, which needs a price)

A player record:
```json
{ "name": "Kylian Mbappé", "nationality": "France", "club": "Real Madrid",
  "league": "La Liga", "value": 180, "positions": ["ST","LW","CF"], "age": 27 }
```
- `value: null` → no transfer fee → appears in World Cup mode only.
- `positions[0]` is the primary; the rest are secondary (drive green/amber eligibility).
- `age` drives **potential** and the Squad Builder team-rating age penalty. Curated for notable
  players; defaults to 25 if missing (real ages fill in on the next scrape).

## Ratings (`src/data/ratings.ts`)

The hidden rating (World Cup scoring only, never shown) is **curated + formula**:
- `OVERRIDES` — hand-set FC-style ratings for players we can rate confidently. Edit freely
  (`'Lamine Yamal': 92`). Keys must match `name` exactly.
- `formulaRating(value, league)` — fallback for everyone else (market value + league tier).

To tune skill, edit `OVERRIDES`. To re-balance the World Cup tier curve, adjust `MEAN` / `TEAM_SD`
in `src/modes/roadwc/scoring.ts` (calibrated by Monte-Carlo; see the comment there).

## Monthly refresh (one prompt)

Ask: **"update the player data"**. The flow:

1. Scrape Transfermarkt's most-valuable list (20 pages = top 500):
   `transfermarkt.us/spieler-statistik/wertvollstespieler/marktwertetop?...&page=N`,
   capturing `rank | name | age | nationality | position | club | value` per row into `scripts/scrape.txt`.
   (Capturing age refreshes everyone's real age, replacing the curated/default values.)
2. `node scripts/merge-tm.mjs scripts/scrape.txt`
   - refreshes `value` for existing players, adds newcomers, **keeps legends untouched**, never duplicates.
3. `node scripts/qa.mjs` — **must pass** (fails on duplicate names, bad positions/values, etc.).
   Fix any warnings (missing flag → add to `src/lib/flags.ts`; missing league → it's a new club).
4. `npm run build` then commit + push.

QA (`scripts/qa.mjs`) is the safety net: it blocks duplicate players and malformed rows so a
refresh can't silently corrupt the dataset.
