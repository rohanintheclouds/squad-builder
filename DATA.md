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

The hidden rating (draft scoring only, never shown during play) reflects **current form + ability**,
NOT market value. Methodology (follow this whenever ratings are refreshed):

1. **SofaScore season rating = primary signal** (form/consistency this season). Pull from
   sofascore.com — their `/news/` rating round-ups are fetchable (e.g. "Team of the Season",
   "top-rated players", "rating race by league"). ~6.8 = solid starter, ~7.5 = excellent, ~7.9+ = elite.
2. **EA FC26 overall = ability anchor.** Blend ~55% SofaScore form / 45% FC26 so one hot season
   doesn't overrate a limited player, and a quiet season pulls a great player down.
3. **Market value is de-emphasised** — only `formulaRating` (the fallback) uses it, capped at 83.

Edit `OVERRIDES` in `ratings.ts` (keys = `name` exactly). Card tiers (90+ purple, 80+ gold, 70+
silver) and draft scoring both read this rating.

**To "update the ratings" (monthly):** re-pull SofaScore rating round-ups + cross-check FC26,
revise `OVERRIDES` per the blend above, then **recalibrate** the bell curve: run a Monte-Carlo of
drafts to get the casual/expert average-rating, and set `MEAN` / `TEAM_SD` in
`src/modes/draft/scoring.ts` (MEAN ≈ casual mean; SD so expert lands Quarter/Semi). Then build + QA + push.

## Last-season form (API-Football)

`scripts/update-ratings.mjs` pulls **2024/25** per-player season ratings + stats from API-Football
(key in `.env` as `API_FOOTBALL_KEY`, gitignored) into `src/data/form.json`. `ratings.ts` blends
this in as a **light secondary nudge** (~15% for curated players, ~35% for uncurated), so recent
form tilts a rating without overriding the FC26/SofaScore base.

- `node scripts/update-ratings.mjs --refresh` — hit the API (caps at ~46 calls; matches API's
  abbreviated names like "E. Haaland" to our names by last-name + initial).
- Free plan = **100 calls/day**, covers up to season 2024 (2024/25). A full top-club sweep is
  ~25–45 calls, so one refresh fits in a day. 2024/25 is static, so you only refresh once per season
  (live-season form would need a paid plan).
- After refresh: `npm run build` + QA + (recalibrate `MEAN`/`TEAM_SD` if the average shifts).

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
