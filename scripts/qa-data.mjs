// QA: re-fetch a spread of players from Transfermarkt and diff height/foot/identity vs our data.
//   node scripts/qa-data.mjs
import { readFileSync } from 'node:fs'
const UA = { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' } }
const TM = 'https://www.transfermarkt.us'
const LIST = TM + '/spieler-statistik/wertvollstespieler/marktwertetop?land_id=0&ausrichtung=alle&spielerposition_id=alle&altersklasse=alle&jahrgang=0&kontinent_id=0&jahr=&plus=1&page='
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const players = JSON.parse(readFileSync(new URL('../src/data/players.json', import.meta.url), 'utf8'))
const byNorm = new Map(players.map((p) => [norm(p.name), p]))

// name -> profile path
const path = {}
for (let pg = 1; pg <= 20; pg++) {
  const html = await (await fetch(LIST + pg, UA)).text()
  for (const row of html.split(/<tr class="(?:odd|even)">/).slice(1)) {
    const m = row.match(/<a title="([^"]+)" href="(\/[^"]*\/profil\/spieler\/\d+)">/)
    if (m) path[norm(m[1].replace(/&amp;/g, '&'))] = m[2]
  }
}

// sample ~40 evenly across players that have a TM path
const sample = players.filter((p) => path[norm(p.name)])
const step = Math.floor(sample.length / 40)
const pick = sample.filter((_, i) => i % step === 0).slice(0, 40)

let mism = 0
for (const p of pick) {
  const html = await (await fetch(TM + path[norm(p.name)], UA)).text()
  const hm = html.match(/itemprop="height"[^>]*>\s*([12]),(\d{2})\s*(?:&nbsp;)?\s*m/i)
  const fm = html.match(/Foot:<\/span>\s*<span[^>]*>([^<]+)<\/span>/i)
  const tname = (html.match(/<title>([^<]+?)\s*[-|]/) || [])[1] || ''
  const tmH = hm ? parseInt(hm[1] + hm[2], 10) : null
  const tmF = fm ? fm[1].trim().replace(/^./, (c) => c.toUpperCase()) : null
  const issues = []
  if (tname && norm(tname).slice(0, 6) !== norm(p.name).slice(0, 6) && !norm(tname).includes(norm(p.name).split(' ').pop())) issues.push(`NAME page="${tname}"`)
  if (tmH && tmH !== p.heightCm) issues.push(`HEIGHT ours=${p.heightCm} tm=${tmH}`)
  if (tmF && tmF !== p.foot) issues.push(`FOOT ours=${p.foot} tm=${tmF}`)
  if (issues.length) { console.log(`✗ ${p.name}: ${issues.join(' | ')}`); mism++ }
  else console.log(`✓ ${p.name}  ${p.heightCm}cm ${p.foot}`)
  await sleep(200)
}
console.log(`\n${pick.length} checked, ${mism} mismatches`)
