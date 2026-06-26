// Pull last-season (2024/25) form from API-Football and write src/data/form.json.
// This is a LIGHT secondary signal (~15%) — FC26 + SofaScore + news stay primary (see ratings.ts).
//
//   node scripts/update-ratings.mjs            # uses cache if present, no API calls
//   node scripts/update-ratings.mjs --refresh  # hits the API (costs calls; budget below)
//
// Free plan = 100 calls/day and covers up to season 2024 (2024/25). Stats are static, so you
// only need --refresh once per season. Key is read from .env (API_FOOTBALL_KEY), never committed.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const ROOT = new URL('../', import.meta.url)
const KEY = (readFileSync(new URL('.env', ROOT), 'utf8').match(/API_FOOTBALL_KEY=(\S+)/) || [])[1]
const SEASON = 2024
const MAX_CALLS = 46
const refresh = process.argv.includes('--refresh')

// our club -> keyword to find its API-Football team, grouped by league id
const LEAGUES = {
  39: { 'Man City': 'manchester city', Arsenal: 'arsenal', Liverpool: 'liverpool', Chelsea: 'chelsea', 'Man United': 'manchester united', Tottenham: 'tottenham', Newcastle: 'newcastle', 'Aston Villa': 'aston villa', Bournemouth: 'bournemouth', Brighton: 'brighton', 'Nottm Forest': 'nottingham', 'Crystal Palace': 'crystal palace', Brentford: 'brentford' },
  140: { 'Real Madrid': 'real madrid', Barcelona: 'barcelona', 'Atlético': 'atletico madrid' },
  78: { Bayern: 'bayern', Dortmund: 'dortmund', Leverkusen: 'leverkusen', 'RB Leipzig': 'leipzig' },
  61: { PSG: 'paris saint' },
  135: { Inter: 'inter', Juventus: 'juventus', 'AC Milan': 'ac milan', Roma: 'roma', Atalanta: 'atalanta' },
  94: { Porto: 'porto', Benfica: 'benfica', Sporting: 'sporting' },
}

let calls = 0
async function api(path) {
  calls++
  const r = await fetch('https://v3.football.api-sports.io' + path, { headers: { 'x-apisports-key': KEY } })
  return r.json()
}

// Match API-Football's abbreviated names ("E. Haaland") to our dataset names by last-name + initial.
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&apos;/g, "'").replace(/&amp;/g, '&').toLowerCase().replace(/[^a-z'\- ]/g, '').trim()
function li(name) {
  const n = norm(name)
  const m = n.match(/^([a-z])\.\s+(.+)$/)
  if (m) return { init: m[1], last: m[2] }
  const p = n.split(' ')
  return { init: p[0][0], last: p.length > 1 ? p.slice(1).join(' ') : p[0] }
}
const OURS = JSON.parse(readFileSync(new URL('src/data/players.json', ROOT), 'utf8')).map((p) => ({ name: p.name, ...li(p.name) }))
const matchName = (apiName) => {
  const a = li(apiName)
  return (OURS.find((o) => o.last === a.last && o.init === a.init) || OURS.find((o) => o.last === a.last))?.name
}

const out = refresh ? {} : (existsSync(new URL('src/data/form.json', ROOT)) ? JSON.parse(readFileSync(new URL('src/data/form.json', ROOT), 'utf8')) : {})

if (refresh) {
  if (!KEY) { console.error('No API_FOOTBALL_KEY in .env'); process.exit(1) }
  outer: for (const [lid, clubs] of Object.entries(LEAGUES)) {
    if (calls >= MAX_CALLS) break
    const teams = await api(`/teams?league=${lid}&season=${SEASON}`)
    const ids = {}
    for (const [our, kw] of Object.entries(clubs)) {
      const t = (teams.response || []).find((x) => x.team.name.toLowerCase().includes(kw))
      if (t) ids[our] = t.team.id
    }
    for (const [our, tid] of Object.entries(ids)) {
      if (calls >= MAX_CALLS) break outer
      let page = 1, pages = 1
      do {
        const j = await api(`/players?team=${tid}&season=${SEASON}&page=${page}`)
        pages = j.paging?.total || 1
        for (const p of j.response || []) {
          const s = (p.statistics || []).filter((x) => x.games?.minutes).sort((a, b) => b.games.minutes - a.games.minutes)[0]
          if (!s || !s.games?.rating) continue
          const ourName = matchName(p.player.name)
          if (!ourName) continue // skip players not in our dataset
          out[ourName] = {
            r: +(+s.games.rating).toFixed(2), m: s.games.minutes || 0,
            g: s.goals.total || 0, a: s.goals.assists || 0, kp: s.passes.key || 0,
            pa: s.passes.accuracy || 0, tk: s.tackles.total || 0, sv: s.goals.saves || 0,
            club: our,
          }
        }
        page++
      } while (page <= pages && calls < MAX_CALLS)
    }
  }
  writeFileSync(new URL('src/data/form.json', ROOT), JSON.stringify(out, null, 0).replace(/,"/g, ',\n"') + '\n')
}

console.log(`form.json: ${Object.keys(out).length} players with 2024/25 stats. API calls used this run: ${calls}.`)
