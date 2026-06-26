// Fill remaining `foot`: accent-insensitive match against foot.json, then a manual map for
// players not on the value list. QA: every player must have a valid foot.
//   node scripts/fill-foot.mjs
import { readFileSync, writeFileSync } from 'node:fs'
const ROOT = new URL('../', import.meta.url)
const foot = JSON.parse(readFileSync(new URL('scripts/foot.json', ROOT), 'utf8'))
const players = JSON.parse(readFileSync(new URL('src/data/players.json', ROOT), 'utf8'))
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const byNorm = {}
for (const [n, f] of Object.entries(foot)) byNorm[norm(n)] = f

const MANUAL = {
  'Mike Maignan': 'Right', 'Guglielmo Vicario': 'Right', 'Emiliano Martínez': 'Right', 'André Onana': 'Right',
  'Unai Simón': 'Right', 'Alisson': 'Right', 'Thibaut Courtois': 'Left', 'Vinícius Júnior': 'Right',
  'Julián Álvarez': 'Right', 'Aleksandar Pavlović': 'Right', 'Benjamin Šeško': 'Right', 'Gabriel Magalhães': 'Left',
  "Nico O'Reilly": 'Left', 'Joško Gvardiol': 'Left', 'Luka Vušković': 'Right', 'Josip Stanišić': 'Right',
  'Lionel Messi': 'Left', 'Cristiano Ronaldo': 'Right', 'Neymar': 'Right', 'Luka Modrić': 'Right',
  'Karim Benzema': 'Right', 'Robert Lewandowski': 'Right', 'Manuel Neuer': 'Right', 'Thomas Müller': 'Right',
  'Mohamed Salah': 'Left', 'Kevin De Bruyne': 'Right', 'Virgil van Dijk': 'Right', 'Antoine Griezmann': 'Left',
  'Sadio Mané': 'Right', 'Sergio Ramos': 'Right', 'Riyad Mahrez': 'Left', 'Marco Reus': 'Right', 'Ederson': 'Left',
  'Antonio Rüdiger': 'Right', 'Éder Militão': 'Right', 'Darwin Núñez': 'Right', 'Casemiro': 'Right',
  'Leroy Sané': 'Left', 'Raheem Sterling': 'Right', 'Romelu Lukaku': 'Right', 'Thiago Silva': 'Right',
  'Harry Maguire': 'Right', 'Dani Carvajal': 'Right', 'Aaron Wan-Bissaka': 'Right',
}

let filled = 0
const missing = []
for (const p of players) {
  if (p.foot) continue
  const f = byNorm[norm(p.name)] ?? MANUAL[p.name]
  if (f) { p.foot = f; filled++ } else missing.push(p.name)
}
writeFileSync(new URL('src/data/players.json', ROOT), JSON.stringify(players, null, 0).replace(/},/g, '},\n') + '\n')
const bad = players.filter((p) => !['Left', 'Right', 'Both'].includes(p.foot))
console.log(`filled ${filled} more. coverage: ${players.filter((p) => p.foot).length}/${players.length}`)
console.log(missing.length ? 'STILL MISSING: ' + missing.join(', ') : 'every player has a foot')
console.log(bad.length ? 'INVALID: ' + bad.map((p) => p.name + '=' + p.foot).join(', ') : 'all feet valid')
