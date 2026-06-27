// Draft scoring simulation. Drives the real engine with greedy auto-play to measure how often
// teams "win" under the current mean-only rule, and how candidate balance-aware metrics treat
// top-heavy (a-few-superstars) squads vs deep, balanced ones.
const { createDraft, byId, validSlotsFor, emergencyPlayers } = await import('../src/modes/draft/engine.ts')
const { WC_TIERS, CL_TIERS, scoreTeam } = await import('../src/modes/draft/scoring.ts')
const { eligibilityStrict } = await import('../src/lib/positions.ts')
const { PLAYERS } = await import('../src/data/players.ts')
const { FORMATIONS } = await import('../src/data/formations.ts')

const byNat = {}
for (const p of PLAYERS) byNat[p.nationality] = (byNat[p.nationality] ?? 0) + 1
const NATION_POOL = Object.keys(byNat).filter((n) => byNat[n] >= 3)
const CLUB_POOL = ['Bayern','Arsenal','Real Madrid','PSG','Man City','Barcelona','Liverpool','Inter','Dortmund','Leverkusen','Man United','Atlético','Juventus','RB Leipzig','Chelsea','AC Milan','Benfica','Porto','Roma','Atalanta','Newcastle','Tottenham','Bournemouth','Brighton','Nottm Forest','Crystal Palace','Aston Villa','Brentford','Sporting']

function makeDraft(kind) {
  return kind === 'nation'
    ? createDraft({ id: 'wc', kind: 'nation', noun: 'nation', groupOf: (p) => p.nationality, pool: NATION_POOL, tiers: WC_TIERS })
    : createDraft({ id: 'cl', kind: 'club', noun: 'club', groupOf: (p) => p.club, pool: CLUB_POOL, tiers: CL_TIERS })
}

// Pick a green slot if available, else any valid (amber) slot.
function bestSlot(p, lineup, fn) {
  const slots = validSlotsFor(p, lineup, fn)
  if (!slots.length) return null
  const fSlots = FORMATIONS.find((f) => f.name === fn).slots
  const green = slots.find((id) => eligibilityStrict(p, fSlots.find((s) => s.id === id).type) === 'green')
  return green ?? slots[0]
}

function autoPlay(draft, { hunter = false } = {}) {
  const S = draft.useStore
  S.getState().start()
  const choices = S.getState().formationChoices
  S.getState().chooseFormation(choices[Math.floor(Math.random() * choices.length)])
  let guard = 0
  while (S.getState().phase === 'draft' && guard++ < 300) {
    const { group, emergency, lineup, formationName, pickedIds, rerollsLeft } = S.getState()
    const cands = emergency ? emergencyPlayers(lineup, pickedIds, formationName) : draft.availableForGroup(group, pickedIds)
    let best = null, slot = null, bestR = -1
    for (const p of cands) {
      const sl = bestSlot(p, lineup, formationName)
      if (sl && p.rating > bestR) { bestR = p.rating; best = p; slot = sl }
    }
    // Star-hunter: spend rerolls to chase elite groups when the current draw's best is mediocre.
    if (hunter && !emergency && rerollsLeft > 0 && bestR < 85) { S.getState().reroll(); continue }
    if (!best) break
    S.getState().place(best.id, slot)
  }
  return Object.values(S.getState().lineup).map((id) => byId.get(id).rating)
}

function autoPlayIds(draft, opts) {
  const S = draft.useStore
  // reuse autoPlay's driving by replaying it, then read ids
  autoPlay(draft, opts)
  return Object.values(S.getState().lineup)
}

// ---- metrics ----
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }
const sd = (a) => { const m = mean(a); return Math.sqrt(mean(a.map((x) => (x - m) ** 2))) }
const bottomN = (a, n) => { const s = [...a].sort((x, y) => x - y); return mean(s.slice(0, n)) }
const pct = (arr, p) => { const s = [...arr].sort((x, y) => x - y); return s[Math.floor(p * (s.length - 1))] }

const METRICS = {
  'mean (current)': (r) => mean(r),
  'mean+median 50/50': (r) => 0.5 * mean(r) + 0.5 * median(r),
  'mean-0.7·SD': (r) => mean(r) - 0.7 * sd(r),
  'mean-1.0·SD': (r) => mean(r) - 1.0 * sd(r),
  '0.6·mean+0.4·bot5': (r) => 0.6 * mean(r) + 0.4 * bottomN(r, 5),
}

const N = 4000
for (const kind of ['nation', 'club']) {
  const draft = makeDraft(kind)
  const teams = []
  for (let i = 0; i < N; i++) teams.push(autoPlay(draft, { hunter: i % 2 === 0 }))
  console.log(`\n===== ${kind === 'nation' ? 'WORLD CUP' : 'CHAMPIONS LEAGUE'} (${N} greedy sims) =====`)
  for (const [name, fn] of Object.entries(METRICS)) {
    const vals = teams.map(fn)
    const m = mean(vals), s = sd(vals)
    console.log(`  ${name.padEnd(20)} avg=${m.toFixed(2)}  sd=${s.toFixed(2)}  p50=${pct(vals,0.5).toFixed(1)}  p90=${pct(vals,0.9).toFixed(1)}  p99=${pct(vals,0.99).toFixed(1)}  max=${Math.max(...vals).toFixed(1)}`)
  }
}

// ---- win-rate analysis: current live rule vs recalibrated candidates ----
function normalCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp(-z * z / 2)
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  if (z > 0) p = 1 - p
  return p
}
const TIER_CUTS = [['Winner', 0.991], ['Final', 0.95], ['Semi', 0.85], ['Quarter', 0.62], ['R16', 0.38], ['lower', 0]]
const tierOf = (perc) => TIER_CUTS.find(([, c]) => perc >= c)[0]

function winAnalysis(kind) {
  const draft = makeDraft(kind)
  const teams = []
  for (let i = 0; i < N; i++) teams.push(autoPlay(draft, { hunter: i % 2 === 0 }))
  console.log(`\n===== ${kind === 'nation' ? 'WORLD CUP' : 'CL'} — tier distribution of ${N} skilled (greedy) drafts =====`)

  // 1) CURRENT LIVE rule: mean, MEAN=77, TEAM_SD=2.8
  const liveVals = teams.map(mean)
  const liveDist = {}
  for (const v of liveVals) { const t = tierOf(normalCdf((v - 77) / 2.8)); liveDist[t] = (liveDist[t] ?? 0) + 1 }
  console.log(`  CURRENT (mean, cal 77/2.8):  Winner ${((liveDist.Winner ?? 0) / N * 100).toFixed(1)}%  Final ${((liveDist.Final ?? 0) / N * 100).toFixed(1)}%  Semi ${((liveDist.Semi ?? 0) / N * 100).toFixed(1)}%  → too easy`)

  // 2) candidates, each recalibrated so MEAN/SD match the skilled-play distribution of THAT metric
  const th = [92,92,92,79,79,79,79,79,79,79,79] // top-heavy reference
  const bal = Array(11).fill(84)                 // strong balanced reference
  for (const [name, fn] of Object.entries(METRICS)) {
    if (name === 'mean (current)') continue
    const vals = teams.map(fn)
    const M = mean(vals), S = sd(vals)
    const dist = {}
    for (const v of vals) { const t = tierOf(normalCdf((v - M) / S)); dist[t] = (dist[t] ?? 0) + 1 }
    const thTier = tierOf(normalCdf((fn(th) - M) / S))
    const balTier = tierOf(normalCdf((fn(bal) - M) / S))
    const win = (dist.Winner ?? 0) / N * 100
    const top3 = win + (dist.Final ?? 0) / N * 100 + (dist.Semi ?? 0) / N * 100
    console.log(`  ${name.padEnd(20)} cal=${M.toFixed(1)}/${S.toFixed(2)}  Winner ${win.toFixed(2)}%  Final+Semi+ ${top3.toFixed(1)}%  | top-heavy→${thTier}  balanced84→${balTier}`)
  }
}
winAnalysis('nation')
winAnalysis('club')

// ---- LIVE QA: run the REAL scoreTeam over fresh skilled drafts, confirm winning is possible ----
console.log('\n===== LIVE scoreTeam() QA (real shipped function) =====')
for (const [kind, tiers, id] of [['nation', WC_TIERS, 'wc'], ['club', CL_TIERS, 'cl']]) {
  const draft = makeDraft(kind)
  const dist = {}
  let bestScore = -1, bestTeam = null
  for (let i = 0; i < N; i++) {
    const ids = autoPlayIds(draft, { hunter: i % 2 === 0 })
    if (ids.length < 11) continue
    const { avg, tier } = scoreTeam(ids, tiers, id)
    dist[tier.key] = (dist[tier.key] ?? 0) + 1
    if (avg > bestScore) { bestScore = avg; bestTeam = ids.map((x) => byId.get(x).rating).sort((a, b) => b - a) }
  }
  const total = Object.values(dist).reduce((a, b) => a + b, 0)
  const order = tiers.map((t) => t.key)
  console.log(`  ${id.toUpperCase()}:`, order.map((k) => `${k} ${((dist[k] ?? 0) / total * 100).toFixed(1)}%`).join('  '))
  console.log(`    winnable? ${(dist[order[0]] ?? 0) > 0 ? 'YES' : 'NO'} (${dist[order[0]] ?? 0}/${total} won). Best squad ratings:`, bestTeam?.join(','))
  // top-heavy abuse check via real function
  const th = ['3×92+8×79', [92,92,92,79,79,79,79,79,79,79,79]], bal = ['11×84', Array(11).fill(84)]
  for (const [lbl, ratings] of [th, bal]) {
    // fabricate ids by matching ratings to real players (approx) — just compute via squadScore path
    const fakeIds = ratings.map((r) => PLAYERS.find((p) => p.rating === r)?.id).filter(Boolean)
    if (fakeIds.length === ratings.length) {
      const { tier } = scoreTeam(fakeIds, tiers, id)
      console.log(`    ${lbl.padEnd(10)} → ${tier.label}`)
    }
  }
}

// ---- top-heavy vs balanced: how each metric ranks them ----
console.log('\n===== TOP-HEAVY vs BALANCED (illustrative 11-man rating sets) =====')
const cases = {
  'balanced strong (all 84)': Array(11).fill(84),
  'top-heavy (3×92 + 8×79)': [92,92,92,79,79,79,79,79,79,79,79],
  'top-heavy (2×93 + 9×80)': [93,93,80,80,80,80,80,80,80,80,80],
  'deep good (all 82)': Array(11).fill(82),
}
const head = Object.keys(METRICS)
console.log('  case'.padEnd(30) + head.map((h) => h.slice(0, 16).padStart(17)).join(''))
for (const [label, r] of Object.entries(cases)) {
  console.log('  ' + label.padEnd(28) + head.map((h) => METRICS[h](r).toFixed(2).padStart(17)).join(''))
}
