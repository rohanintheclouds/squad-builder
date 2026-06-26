# Squad Builder

A FIFA-style squad builder with **real-life market values**, a **budget cap**, **position
eligibility rules**, and **formation + tactic presets**. Built with Vite + React + TS +
Tailwind + Zustand. Runs fully local, nothing to host, no paid APIs.

## Run

```bash
npm install
npm run dev
```

Open the printed `localhost` URL.

## How it works

- **Pitch (left):** the selected formation's slots. Click an empty slot to select it, then
  click a player in the search panel to drop them in. The ring around a card shows position
  fit: green = natural, amber = out of position but plausible, red = blocked (a CB can never
  go up front). Click the red × to remove.
- **Search (right):** filter by name/club, position, league, max price. When a slot is
  selected the list becomes **suggestions** ranked by position fit, the active tactic, rating,
  and what you can still afford.
- **Toolbar:** formation, tactic, budget cap, live spend/remaining (turns red when over).

## Position rules

`src/lib/positions.ts` holds the `ADJACENCY` map (which roles can flex one tier) and the
`eligibility()` function. Each player carries `eligiblePos` (natural positions). Tune the map
to make the builder stricter or looser.

## Refreshing values (free)

The current dataset in `src/data/players.ts` is the **Transfermarkt "most valuable players"
top 125** (June 2026) plus a goalkeeper set, with real € market values. The UI only ever reads
that `Player[]`, so refreshing = regenerating that file. All options below are free:

1. **Re-pull from Transfermarkt** (what this dataset uses). The list page is
   `transfermarkt.us/spieler-statistik/wertvollstespieler/marktwertetop?...&page=N` (25 rows per
   page). Scrape pages into rows of `[name, club, nationality, value€M, position]` and write
   `players.ts`. Respect their rate limits / ToS.
2. **Self-hosted `transfermarkt-api`** (felipeall/transfermarkt-api on GitHub) — a free FastAPI
   scraper you run locally for live-ish values on demand. Best for "real-time."
3. **`dcaribou/transfermarkt-datasets`** — a clean, weekly-refreshed CSV dump (37k+ players,
   includes `player_valuations`). Best for a big static set; map columns via `scripts/import-csv.mjs`.

Notes on derived fields: `rating` is a heuristic from market value (Transfermarkt has no
FIFA-style rating); `eligiblePos` defaults to the primary position, with wingers/fullbacks/CF
auto-extended one slot (see `POS_EXT`). Out-of-position flexibility is handled by the amber
adjacency rules in `src/lib/positions.ts`, not by widening every player's natural positions.

## Next ideas

- Drag-and-drop assignment (currently click-to-assign, which is more reliable).
- Save/load squads to localStorage.
- Bench/substitutes and a 23-man squad view.
