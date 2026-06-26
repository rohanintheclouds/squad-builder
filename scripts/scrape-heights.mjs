// Scrape player heights (cm) from Transfermarkt profile pages, cache to scripts/heights.json,
// and merge into src/data/players.json as `heightCm`. Heights are static — run once, and again
// only when new players are added (it skips players already cached).
//   node scripts/scrape-heights.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const UA = { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' } }
const TM = 'https://www.transfermarkt.us'
const LIST = TM + '/spieler-statistik/wertvollstespieler/marktwertetop?land_id=0&ausrichtung=alle&spielerposition_id=alle&altersklasse=alle&jahrgang=0&kontinent_id=0&jahr=&plus=1&page='
const ROOT = new URL('../', import.meta.url)
const HEIGHTS = new URL('scripts/heights.json', ROOT)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const heights = existsSync(HEIGHTS) ? JSON.parse(readFileSync(HEIGHTS, 'utf8')) : {}

// 1. gather name -> profile path from the value list
const profiles = []
for (let pg = 1; pg <= 20; pg++) {
  const html = await (await fetch(LIST + pg, UA)).text()
  for (const row of html.split(/<tr class="(?:odd|even)">/).slice(1)) {
    const m = row.match(/<a title="([^"]+)" href="(\/[^"]*\/profil\/spieler\/\d+)">/)
    if (m) profiles.push({ name: m[1].replace(/&amp;/g, '&'), path: m[2] })
  }
  process.stdout.write('L')
}
console.log(`\n${profiles.length} profiles found`)

// 2. fetch each player page, parse "1,85 m" -> 185 cm (skip cached)
let done = 0, fail = 0
for (const { name, path } of profiles) {
  if (heights[name]) continue
  try {
    const html = await (await fetch(TM + path, UA)).text()
    const m = html.match(/itemprop="height"[^>]*>\s*([12]),(\d{2})\s*(?:&nbsp;)?\s*m/i) || html.match(/([12]),(\d{2})\s*(?:&nbsp;)?\s*m/)
    if (m) { heights[name] = parseInt(m[1] + m[2], 10); done++ } else fail++
  } catch { fail++ }
  if ((done + fail) % 25 === 0) { writeFileSync(HEIGHTS, JSON.stringify(heights, null, 0)); process.stdout.write('.') }
  await sleep(250)
}
writeFileSync(HEIGHTS, JSON.stringify(heights, null, 0))
console.log(`\nscraped ${done} new heights, ${fail} failed. total cached: ${Object.keys(heights).length}`)

// 3. merge into players.json
const path = new URL('src/data/players.json', ROOT)
const players = JSON.parse(readFileSync(path, 'utf8'))
let merged = 0, missing = []
for (const p of players) {
  if (heights[p.name]) { p.heightCm = heights[p.name]; merged++ } else if (!p.heightCm) missing.push(p.name)
}
writeFileSync(path, JSON.stringify(players, null, 0).replace(/},/g, '},\n') + '\n')
console.log(`merged ${merged} heights into players.json. MISSING (${missing.length}):`)
console.log(missing.join(', '))
