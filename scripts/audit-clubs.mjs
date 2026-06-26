// Scrape Transfermarkt's current clubs and report where players.json disagrees (transfers).
//   node scripts/audit-clubs.mjs
import { readFileSync } from 'node:fs'
const UA = { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' } }
const BASE = 'https://www.transfermarkt.us/spieler-statistik/wertvollstespieler/marktwertetop?land_id=0&ausrichtung=alle&spielerposition_id=alle&altersklasse=alle&jahrgang=0&kontinent_id=0&jahr=&plus=1&page='

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
// our short club -> keyword expected inside the TM club name
const KW = {
  'Man City': 'manchester city', 'Man United': 'manchester united', 'Atlético': 'atletico', 'PSG': 'paris',
  'Nottm Forest': 'nottingham', 'RB Leipzig': 'leipzig', 'AC Milan': 'ac milan', 'Inter': 'inter milan',
  'Union SG': 'union saint', 'Red Star': 'red star', Hamburg: 'hamburger', Köln: 'koln', Werder: 'werder',
  Rennes: 'rennais', 'Athletic Club': 'athletic', Wolves: 'wolverhampton', Betis: 'betis',
}
const kw = (club) => norm(KW[club] || club)

const tmClub = {}
for (let pg = 1; pg <= 20; pg++) {
  const html = await (await fetch(BASE + pg, UA)).text()
  // parse each player row together so name + club stay paired
  const rows = html.split(/<tr class="(?:odd|even)">/).slice(1)
  for (const row of rows) {
    const nm = row.match(/<a title="([^"]+)" href="\/[^"]*\/profil\/spieler\/\d+">/)
    const cl = row.match(/<a title="([^"]+)" href="\/[^"]*\/startseite\/verein\/\d+"/)
    if (nm && cl) tmClub[nm[1].replace(/&amp;/g, '&')] = cl[1].replace(/&amp;/g, '&')
  }
  process.stdout.write('.')
}
console.log(`\nscraped ${Object.keys(tmClub).length} TM player->club entries`)

const players = JSON.parse(readFileSync(new URL('../src/data/players.json', import.meta.url), 'utf8'))
const tmByNorm = {}
for (const [n, c] of Object.entries(tmClub)) tmByNorm[norm(n)] = c

let mismatches = 0, notfound = 0
for (const p of players) {
  const tm = tmClub[p.name] || tmByNorm[norm(p.name)]
  if (!tm) { notfound++; continue }
  if (!norm(tm).includes(kw(p.club))) {
    console.log(`  ${p.name}: ours="${p.club}"  TM="${tm}"`)
    mismatches++
  }
}
console.log(`\n${mismatches} club mismatches, ${notfound} of our players not on the TM list (legends/loans/older)`)
