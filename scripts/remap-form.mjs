// One-off: remap form.json keys (API-Football abbreviated names) to our dataset names
// by last-name + first-initial. No API calls.
import { readFileSync, writeFileSync } from 'node:fs'
const ROOT = new URL('../', import.meta.url)
const form = JSON.parse(readFileSync(new URL('src/data/form.json', ROOT), 'utf8'))
const players = JSON.parse(readFileSync(new URL('src/data/players.json', ROOT), 'utf8')).map((p) => p.name)

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&apos;/g, "'").replace(/&amp;/g, '&').toLowerCase().replace(/[^a-z'\- ]/g, '').trim()
function li(name) {
  const n = norm(name)
  const m = n.match(/^([a-z])\.\s+(.+)$/)
  if (m) return { init: m[1], last: m[2] }
  const p = n.split(' ')
  return { init: p[0][0], last: p.length > 1 ? p.slice(1).join(' ') : p[0] }
}
const ours = players.map((name) => ({ name, ...li(name) }))
const remapped = {}
let matched = 0
for (const [apiName, stats] of Object.entries(form)) {
  const a = li(apiName)
  const hit = ours.find((o) => o.last === a.last && o.init === a.init) || ours.find((o) => o.last === a.last)
  if (hit) { remapped[hit.name] = stats; matched++ }
}
writeFileSync(new URL('src/data/form.json', ROOT), JSON.stringify(remapped, null, 0).replace(/,"/g, ',\n"') + '\n')
console.log(`remapped: ${matched} of ${Object.keys(form).length} matched to dataset`)
for (const n of ['Erling Haaland', 'Phil Foden', 'Kevin De Bruyne', 'Virgil van Dijk', 'Declan Rice', "Nico O'Reilly"]) {
  const p = remapped[n]
  console.log('  ' + n + ': ' + (p ? `rating ${p.r}, G${p.g} A${p.a} KP${p.kp} tk${p.tk}` : 'no data'))
}
