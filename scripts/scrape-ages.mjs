// Scrape real current ages from the Transfermarkt value list (the age column) and merge into
// players.json. Fixes the bug where uncurated players defaulted to 25. Age IS dynamic, so this
// also runs as part of the normal monthly refresh.
//   node scripts/scrape-ages.mjs
import { readFileSync, writeFileSync } from 'node:fs'
const UA = { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' } }
const LIST = 'https://www.transfermarkt.us/spieler-statistik/wertvollstespieler/marktwertetop?land_id=0&ausrichtung=alle&spielerposition_id=alle&altersklasse=alle&jahrgang=0&kontinent_id=0&jahr=&plus=1&page='
const ROOT = new URL('../', import.meta.url)
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&amp;/g, '&').toLowerCase().trim()

// 1. scrape name -> age from the list (age = last numeric "zentriert" cell before the €value)
const ages = {}
for (let pg = 1; pg <= 20; pg++) {
  const html = await (await fetch(LIST + pg, UA)).text()
  for (const row of html.split(/<tr class="(?:odd|even)">/).slice(1)) {
    const nm = row.match(/<a title="([^"]+)" href="\/[^"]*\/profil\/spieler\/\d+">/)
    if (!nm) continue
    const vi = row.search(/€[\d.,]+(?:m|bn|k)/i)
    const before = vi >= 0 ? row.slice(0, vi) : row
    const nums = [...before.matchAll(/<td class="zentriert">(\d{1,2})<\/td>/g)].map((m) => +m[1])
    const age = nums.length ? nums[nums.length - 1] : null
    if (age && age >= 15 && age <= 45) ages[nm[1].replace(/&amp;/g, '&')] = age
  }
}
const byNorm = {}
for (const [n, a] of Object.entries(ages)) byNorm[norm(n)] = a
console.log(`scraped ${Object.keys(ages).length} ages from list`)

// 2. manual ages for players not on the list (legends/extras), June 2026
const MANUAL = {
  'Lionel Messi': 38, 'Cristiano Ronaldo': 41, 'Neymar': 34, 'Luka Modrić': 40, 'Karim Benzema': 38,
  'Robert Lewandowski': 37, 'Manuel Neuer': 40, 'Thomas Müller': 36, 'Mohamed Salah': 33,
  'Kevin De Bruyne': 34, 'Virgil van Dijk': 34, 'Antoine Griezmann': 35, 'Sadio Mané': 34,
  'Sergio Ramos': 40, 'Riyad Mahrez': 35, 'Marco Reus': 37, 'Ederson': 32, 'Antonio Rüdiger': 33,
  'Éder Militão': 28, 'Darwin Núñez': 26, 'Casemiro': 34, 'Leroy Sané': 30, 'Raheem Sterling': 31,
  'Romelu Lukaku': 33, 'Thiago Silva': 41, 'Harry Maguire': 33, 'Dani Carvajal': 34, 'Aaron Wan-Bissaka': 28,
  // in the list but the name didn't match (accent/short-name): set explicitly
  'Mike Maignan': 30, 'Guglielmo Vicario': 29, 'Emiliano Martínez': 33, 'André Onana': 30,
  'Unai Simón': 29, 'Alisson': 33, 'Thibaut Courtois': 34, 'Gabriel Magalhães': 28, "Nico O'Reilly": 20,
}

// 3. merge
const path = new URL('src/data/players.json', ROOT)
const players = JSON.parse(readFileSync(path, 'utf8'))
let updated = 0
const missing = []
for (const p of players) {
  const a = byNorm[norm(p.name)] ?? MANUAL[p.name]
  if (a) { if (p.age !== a) updated++; p.age = a } else missing.push(p.name)
}
writeFileSync(path, JSON.stringify(players, null, 0).replace(/},/g, '},\n') + '\n')
const stillDefault = players.filter((p) => !byNorm[norm(p.name)] && !MANUAL[p.name])
console.log(`updated ${updated} ages. coverage: ${players.length - missing.length}/${players.length}`)
console.log(missing.length ? `NO SOURCE (kept existing): ${missing.join(', ')}` : 'every player matched a real age')
console.log(`age distribution check — still ==25: ${players.filter((p) => p.age === 25).length}`)
