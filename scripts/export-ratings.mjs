// Export every player + rating to player-ratings.csv (opens in Excel/Sheets) for manual review.
//   npx tsx scripts/export-ratings.mjs
// Reads the SAME computed PLAYERS the app uses (curated OVERRIDES + form blend, uncurated rank-based
// bell curve), so the CSV always matches in-game ratings exactly.
import { readFileSync, writeFileSync } from 'node:fs'
import { PLAYERS } from '../src/data/players.ts'
import { OVERRIDES } from '../src/data/ratings.ts'

const ROOT = new URL('../', import.meta.url)
const form = JSON.parse(readFileSync(new URL('src/data/form.json', ROOT), 'utf8'))

const tier = (r) => (r >= 88 ? 'purple' : r >= 75 ? 'gold' : r >= 65 ? 'silver' : 'bronze')
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`

const rows = [...PLAYERS].sort((a, b) => b.rating - a.rating)

const header = ['Rank', 'Name', 'Rating', 'Tier', 'Curated', 'Form24/25', 'Pos', 'Age', 'Value€M', 'Club', 'League', 'Nation']
const lines = [header.join(',')]
rows.forEach((p, i) =>
  lines.push([i + 1, p.name, p.rating, tier(p.rating), OVERRIDES[p.name] ?? '', form[p.name]?.r ?? '', p.eligiblePos.join('/'), p.age, p.value ?? '', p.club, p.league, p.nationality].map(q).join(',')),
)
writeFileSync(new URL('player-ratings.csv', ROOT), lines.join('\n') + '\n')
console.log(`wrote player-ratings.csv (${rows.length} players)`)
