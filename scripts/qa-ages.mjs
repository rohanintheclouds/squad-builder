// QA: re-fetch a spread of player profiles and compare profile age to our stored age.
//   node scripts/qa-ages.mjs
import { readFileSync } from 'node:fs'
const UA = { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' } }
const TM = 'https://www.transfermarkt.us'
const LIST = TM + '/spieler-statistik/wertvollstespieler/marktwertetop?land_id=0&ausrichtung=alle&spielerposition_id=alle&altersklasse=alle&jahrgang=0&kontinent_id=0&jahr=&plus=1&page='
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&amp;/g, '&').toLowerCase().trim()
const players = JSON.parse(readFileSync(new URL('../src/data/players.json', import.meta.url), 'utf8'))

const path = {}
for (let pg = 1; pg <= 20; pg++) {
  const html = await (await fetch(LIST + pg, UA)).text()
  for (const row of html.split(/<tr class="(?:odd|even)">/).slice(1)) {
    const m = row.match(/<a title="([^"]+)" href="(\/[^"]*\/profil\/spieler\/\d+)">/)
    if (m) path[norm(m[1].replace(/&amp;/g, '&'))] = m[2]
  }
}

const sample = players.filter((p) => path[norm(p.name)])
const step = Math.floor(sample.length / 30)
const pick = sample.filter((_, i) => i % step === 0).slice(0, 30)

let mism = 0
for (const p of pick) {
  const html = await (await fetch(TM + path[norm(p.name)], UA)).text()
  const m = html.match(/Date of birth\/Age:[\s\S]{0,140}?\((\d{1,2})\)/i)
  const tmAge = m ? +m[1] : null
  if (tmAge && tmAge !== p.age) { console.log(`✗ ${p.name}: ours=${p.age} tm=${tmAge}`); mism++ }
  else console.log(`✓ ${p.name}  ${p.age}`)
  await sleep(180)
}
console.log(`\n${pick.length} checked, ${mism} age mismatches`)
