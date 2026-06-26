// Merge a fresh Transfermarkt scrape into src/data/players.json.
//
//   node scripts/merge-tm.mjs scripts/scrape.txt
//
// scrape.txt: one player per line, pipe-delimited, in the order the scrape returns:
//   rank | name | age | nationality | position | club | market value
//   e.g.  3 | Kylian Mbappé | 27 | France | Centre-Forward | Real Madrid | €180.00m
//
// Behaviour (safe / idempotent):
//   - existing player  -> updates market VALUE + AGE (keeps curated club/positions stable)
//   - new player       -> added with normalized club + league + positions
//   - players NOT in the scrape (legends etc.) are kept untouched
//   - never creates duplicate names
// Always run `node scripts/qa.mjs` afterwards.
import { readFileSync, writeFileSync } from 'node:fs'

const POS_MAP = {
  Goalkeeper: 'GK', 'Right-Back': 'RB', 'Left-Back': 'LB', 'Centre-Back': 'CB',
  'Defensive Midfield': 'CDM', 'Central Midfield': 'CM', 'Attacking Midfield': 'CAM',
  'Right Midfield': 'RM', 'Left Midfield': 'LM', 'Right Winger': 'RW', 'Left Winger': 'LW',
  'Second Striker': 'CF', 'Centre-Forward': 'ST',
}
const POS_EXT = { LW: ['LW', 'LM'], RW: ['RW', 'RM'], LB: ['LB', 'LWB'], RB: ['RB', 'RWB'], CF: ['CF', 'ST'] }
const NAT_NORM = {
  'United States': 'USA', Türkiye: 'Turkey', 'Korea, South': 'South Korea',
  "Côte d'Ivoire": 'Ivory Coast', "Cote d'Ivoire": 'Ivory Coast',
}
// TM full club name -> [shortName, league] for NEW players. Extend as needed; unknowns fall back.
const CLUB = {
  'Real Madrid': ['Real Madrid', 'La Liga'], 'FC Barcelona': ['Barcelona', 'La Liga'],
  'Manchester City': ['Man City', 'Premier League'], 'Arsenal FC': ['Arsenal', 'Premier League'],
  'Liverpool FC': ['Liverpool', 'Premier League'], 'Chelsea FC': ['Chelsea', 'Premier League'],
  'Paris Saint-Germain': ['PSG', 'Ligue 1'], 'Bayern Munich': ['Bayern', 'Bundesliga'],
}
const LEAGUE_BY_KEYWORD = [
  [/Saudi|Al-/, 'Saudi Pro League'], [/Eindhoven|Ajax|Feyenoord|AZ |Alkmaar/, 'Eredivisie'],
  [/Benfica|Porto|Sporting|Braga|Famalicão/, 'Liga Portugal'], [/Galatasaray|Fenerbahce|Besiktas|Trabzonspor/, 'Süper Lig'],
]

function parseValue(s) {
  const m = s.replace(/[€,\s]/g, '').toLowerCase()
  if (m.endsWith('bn')) return Math.round(parseFloat(m) * 1000)
  if (m.endsWith('m')) return Math.round(parseFloat(m) * 10) / 10
  const n = parseFloat(m)
  return isNaN(n) ? null : n
}
function shortClub(full) {
  if (CLUB[full]) return CLUB[full]
  const short = full.replace(/^(FC|AC|AS|SC|SS|SL|RC|VfB|VfL|SV|TSG|US|RB|1\.)\s+/i, '').replace(/\s+(FC|CF|SFC|KV|AFC|Calcio)$/i, '').trim()
  let league = 'Other'
  for (const [re, lg] of LEAGUE_BY_KEYWORD) if (re.test(full)) { league = lg; break }
  return [short, league]
}

const file = process.argv[2] || 'scripts/scrape.txt'
const rows = readFileSync(new URL('../' + file, import.meta.url), 'utf8')
  .split(/\r?\n/).map((l) => l.trim()).filter((l) => l.includes('|'))
  .map((l) => l.split('|').map((c) => c.trim()))
  .filter((c) => c.length >= 7 && /^\d+$/.test(c[0]))

const path = new URL('../src/data/players.json', import.meta.url)
const players = JSON.parse(readFileSync(path, 'utf8'))
const byName = new Map(players.map((p) => [p.name, p]))

let updated = 0, added = 0, skipped = 0
for (const [, name, ageRaw, natRaw, posRaw, clubRaw, valRaw] of rows) {
  const value = parseValue(valRaw)
  const pos = POS_MAP[posRaw]
  const age = parseInt(ageRaw, 10)
  if (!pos || value == null) { skipped++; continue }
  const existing = byName.get(name)
  if (existing) {
    existing.value = value // refresh price + age; curated club/positions stay
    if (age >= 15 && age <= 45) existing.age = age
    updated++
  } else {
    const nationality = NAT_NORM[natRaw] ?? natRaw
    const [club, league] = shortClub(clubRaw)
    const player = { name, nationality, club, league, value, positions: POS_EXT[pos] ?? [pos], age: age >= 15 && age <= 45 ? age : 25 }
    players.push(player)
    byName.set(name, player)
    added++
  }
}

writeFileSync(path, JSON.stringify(players, null, 0).replace(/},/g, '},\n') + '\n')
console.log(`merge: ${updated} updated, ${added} added, ${skipped} skipped (bad row). total ${players.length}.`)
console.log('Now run: node scripts/qa.mjs')
