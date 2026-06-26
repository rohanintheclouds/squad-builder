// Data QA for src/data/players.json. Run after any edit or refresh:
//   node scripts/qa.mjs
// Exits non-zero on hard errors (duplicates, bad fields) so a bad dataset can't ship.
import { readFileSync } from 'node:fs'

const ROOT = new URL('../', import.meta.url)
const players = JSON.parse(readFileSync(new URL('src/data/players.json', ROOT), 'utf8'))
const flagsSrc = readFileSync(new URL('src/lib/flags.ts', ROOT), 'utf8')
const ratingsSrc = readFileSync(new URL('src/data/ratings.ts', ROOT), 'utf8')

const POSITIONS = new Set(['GK', 'RB', 'RWB', 'CB', 'LB', 'LWB', 'CDM', 'CM', 'CAM', 'RM', 'LM', 'RW', 'LW', 'CF', 'ST'])

// keys present in the FLAGS map
const flagKeys = new Set(
  [...flagsSrc.matchAll(/(?:'([^']+)'|([A-Za-z]+))\s*:\s*'/g)].map((m) => m[1] ?? m[2]).filter(Boolean),
)
// scope to the OVERRIDES object so we don't pick up the LEAGUE_ADJ table below it
const overridesBlock = ratingsSrc.slice(
  ratingsSrc.indexOf('OVERRIDES'),
  ratingsSrc.indexOf('const LEAGUE_ADJ'),
)
const overrideKeys = [...overridesBlock.matchAll(/'([^']+)':\s*\d+/g)].map((m) => m[1])

const errors = []
const warnings = []

// 1. duplicate names
const byName = new Map()
for (const p of players) byName.set(p.name, (byName.get(p.name) ?? 0) + 1)
for (const [name, n] of byName) if (n > 1) errors.push(`duplicate name x${n}: ${name}`)

// 2. duplicate (name+club) sanity already covered by name; check field validity
for (const p of players) {
  const tag = p.name ?? '(no name)'
  if (!p.name || typeof p.name !== 'string') errors.push(`missing name: ${JSON.stringify(p)}`)
  if (!p.nationality) errors.push(`${tag}: missing nationality`)
  if (!p.club) warnings.push(`${tag}: missing club`)
  if (!p.league) warnings.push(`${tag}: missing league`)
  if (!Array.isArray(p.positions) || p.positions.length === 0) errors.push(`${tag}: no positions`)
  else for (const pos of p.positions) if (!POSITIONS.has(pos)) errors.push(`${tag}: bad position "${pos}"`)
  if (!(p.value === null || (typeof p.value === 'number' && p.value > 0))) errors.push(`${tag}: bad value ${p.value}`)
  if (p.age != null && (typeof p.age !== 'number' || p.age < 15 || p.age > 45)) errors.push(`${tag}: bad age ${p.age}`)
  if (p.age == null) warnings.push(`${tag}: missing age (will default to 25)`)
  if (p.nationality && !flagKeys.has(p.nationality)) warnings.push(`${tag}: no flag for "${p.nationality}"`)
}

// 3. orphan rating overrides (override name not in dataset -> stale / typo)
const names = new Set(players.map((p) => p.name))
for (const k of overrideKeys) if (!names.has(k)) warnings.push(`rating override has no matching player: "${k}"`)

console.log(`QA: ${players.length} players, ${byName.size} unique names`)
if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} warning(s):`)
  warnings.forEach((w) => console.log('  - ' + w))
}
if (errors.length) {
  console.log(`\n✖ ${errors.length} error(s):`)
  errors.forEach((e) => console.log('  - ' + e))
  process.exit(1)
}
console.log('\n✓ no hard errors')
