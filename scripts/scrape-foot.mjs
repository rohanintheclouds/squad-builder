// Scrape preferred foot from Transfermarkt profile pages -> scripts/foot.json, merge into
// players.json as `foot` ('Right'|'Left'|'Both'). Static — run once, and again for new players.
//   node scripts/scrape-foot.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const UA = { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' } }
const TM = 'https://www.transfermarkt.us'
const LIST = TM + '/spieler-statistik/wertvollstespieler/marktwertetop?land_id=0&ausrichtung=alle&spielerposition_id=alle&altersklasse=alle&jahrgang=0&kontinent_id=0&jahr=&plus=1&page='
const ROOT = new URL('../', import.meta.url)
const FOOT = new URL('scripts/foot.json', ROOT)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

const foot = existsSync(FOOT) ? JSON.parse(readFileSync(FOOT, 'utf8')) : {}

const profiles = []
for (let pg = 1; pg <= 20; pg++) {
  const html = await (await fetch(LIST + pg, UA)).text()
  for (const row of html.split(/<tr class="(?:odd|even)">/).slice(1)) {
    const m = row.match(/<a title="([^"]+)" href="(\/[^"]*\/profil\/spieler\/\d+)">/)
    if (m) profiles.push({ name: m[1].replace(/&amp;/g, '&'), path: m[2] })
  }
}
console.log(`${profiles.length} profiles`)

let done = 0, fail = 0
for (const { name, path } of profiles) {
  if (foot[name]) continue
  try {
    const html = await (await fetch(TM + path, UA)).text()
    const m = html.match(/Foot:<\/span>\s*<span[^>]*>([^<]+)<\/span>/i)
    if (m) { foot[name] = cap(m[1].trim()); done++ } else fail++
  } catch { fail++ }
  if ((done + fail) % 25 === 0) { writeFileSync(FOOT, JSON.stringify(foot, null, 0)); process.stdout.write('.') }
  await sleep(250)
}
writeFileSync(FOOT, JSON.stringify(foot, null, 0))
console.log(`\nscraped ${done} feet, ${fail} failed. cached ${Object.keys(foot).length}`)

const path = new URL('src/data/players.json', ROOT)
const players = JSON.parse(readFileSync(path, 'utf8'))
let merged = 0, missing = []
for (const p of players) { if (foot[p.name]) { p.foot = foot[p.name]; merged++ } else if (!p.foot) missing.push(p.name) }
writeFileSync(path, JSON.stringify(players, null, 0).replace(/},/g, '},\n') + '\n')
console.log(`merged ${merged}. MISSING (${missing.length}): ${missing.join(', ')}`)
