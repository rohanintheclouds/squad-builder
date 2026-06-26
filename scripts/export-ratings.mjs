// Export every player + rating to player-ratings.csv (opens in Excel/Sheets) for manual review.
//   node scripts/export-ratings.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { OVERRIDES, ratingFor } from '../src/data/ratings.ts'

const ROOT = new URL('../', import.meta.url)
const players = JSON.parse(readFileSync(new URL('src/data/players.json', ROOT), 'utf8'))
const form = JSON.parse(readFileSync(new URL('src/data/form.json', ROOT), 'utf8'))

const tier = (r) => (r >= 88 ? 'purple' : r >= 75 ? 'gold' : r >= 65 ? 'silver' : 'bronze')
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`

const rows = players
  .map((p) => {
    const rating = ratingFor(p.name, p.value, p.league)
    return { ...p, rating, curated: OVERRIDES[p.name] ?? '', form: form[p.name]?.r ?? '', tier: tier(rating) }
  })
  .sort((a, b) => b.rating - a.rating)

const header = ['Rank', 'Name', 'Rating', 'Tier', 'Curated', 'Form24/25', 'Pos', 'Age', 'Value€M', 'Club', 'League', 'Nation']
const lines = [header.join(',')]
rows.forEach((p, i) =>
  lines.push([i + 1, p.name, p.rating, p.tier, p.curated, p.form, p.positions.join('/'), p.age, p.value ?? '', p.club, p.league, p.nationality].map(q).join(',')),
)
writeFileSync(new URL('player-ratings.csv', ROOT), lines.join('\n') + '\n')
console.log(`wrote player-ratings.csv (${rows.length} players)`)
