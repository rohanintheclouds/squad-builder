// Fill remaining heightCm: accent-insensitive match against heights.json, then a manual map
// for players not on the Transfermarkt value list (legends/extras). Then QA the range.
//   node scripts/fill-heights.mjs
import { readFileSync, writeFileSync } from 'node:fs'
const ROOT = new URL('../', import.meta.url)
const heights = JSON.parse(readFileSync(new URL('scripts/heights.json', ROOT), 'utf8'))
const players = JSON.parse(readFileSync(new URL('src/data/players.json', ROOT), 'utf8'))
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const byNorm = {}
for (const [n, cm] of Object.entries(heights)) byNorm[norm(n)] = cm

// Known heights (cm) for players not on the value list.
const MANUAL = {
  'Mike Maignan': 191, 'Guglielmo Vicario': 194, 'Emiliano Martínez': 195, 'André Onana': 190,
  'Unai Simón': 190, 'Alisson': 193, 'Thibaut Courtois': 200, 'Vinícius Júnior': 176,
  'Julián Álvarez': 170, 'Aleksandar Pavlović': 188, 'Benjamin Šeško': 195, 'Gabriel Magalhães': 190,
  "Nico O'Reilly": 185, 'Joško Gvardiol': 185, 'Luka Vušković': 197, 'Josip Stanišić': 187,
  'Lionel Messi': 170, 'Cristiano Ronaldo': 187, 'Neymar': 175, 'Luka Modrić': 172,
  'Karim Benzema': 185, 'Robert Lewandowski': 185, 'Manuel Neuer': 193, 'Thomas Müller': 185,
  'Mohamed Salah': 175, 'Kevin De Bruyne': 181, 'Virgil van Dijk': 193, 'Antoine Griezmann': 172,
  'Sadio Mané': 175, 'Sergio Ramos': 184, 'Riyad Mahrez': 179, 'Marco Reus': 180, 'Ederson': 188,
  'Antonio Rüdiger': 190, 'Éder Militão': 186, 'Darwin Núñez': 187, 'Casemiro': 185, 'Leroy Sané': 183,
  'Raheem Sterling': 170, 'Romelu Lukaku': 191, 'Thiago Silva': 183, 'Harry Maguire': 194,
  'Dani Carvajal': 173, 'Aaron Wan-Bissaka': 183,
}

let filled = 0
const missing = []
for (const p of players) {
  if (p.heightCm) continue
  const cm = byNorm[norm(p.name)] ?? MANUAL[p.name]
  if (cm) { p.heightCm = cm; filled++ } else missing.push(p.name)
}
writeFileSync(new URL('src/data/players.json', ROOT), JSON.stringify(players, null, 0).replace(/},/g, '},\n') + '\n')

// QA
const bad = players.filter((p) => !p.heightCm || p.heightCm < 150 || p.heightCm > 215)
console.log(`filled ${filled} more. coverage: ${players.filter((p) => p.heightCm).length}/${players.length}`)
console.log(missing.length ? 'STILL MISSING: ' + missing.join(', ') : 'every player has a height')
console.log(bad.length ? 'OUT OF RANGE: ' + bad.map((p) => p.name + '=' + p.heightCm).join(', ') : 'all heights in 150-215cm range')
