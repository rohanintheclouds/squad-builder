// Session-persistent progress (localStorage): best draft placement per mode + Guess streaks.

function lsGet(k: string): string | null { try { return localStorage.getItem(k) } catch { return null } }
function lsSet(k: string, v: string) { try { localStorage.setItem(k, v) } catch { /* ignore */ } }

export type BestTier = { label: string; color: string; rank: number }

/** Best placement for a draft mode ('wc' | 'cl'). Lower rank = better tier. */
export function getBestTier(id: string): BestTier | null {
  const raw = lsGet(`squadlab-best-${id}`)
  try { return raw ? (JSON.parse(raw) as BestTier) : null } catch { return null }
}
export function recordBestTier(id: string, tier: { label: string; color: string }, rank: number) {
  const cur = getBestTier(id)
  if (!cur || rank < cur.rank) lsSet(`squadlab-best-${id}`, JSON.stringify({ label: tier.label, color: tier.color, rank }))
}

// Do You Know Ball streaks — tracked separately per difficulty.
export type GuessDiff = 'hard' | 'casual'
const sKey = (d: GuessDiff) => `squadlab-gtp-${d}-streak`
const bKey = (d: GuessDiff) => `squadlab-gtp-${d}-best`

export const getStreak = (d: GuessDiff) => Number(lsGet(sKey(d)) || 0)
export const getBestStreak = (d: GuessDiff) => Number(lsGet(bKey(d)) || 0)
export function recordGuessWin(d: GuessDiff): number {
  const s = getStreak(d) + 1
  lsSet(sKey(d), String(s))
  if (s > getBestStreak(d)) lsSet(bKey(d), String(s))
  return s
}
export function recordGuessLoss(d: GuessDiff) { lsSet(sKey(d), '0') }
export const getLastGuessMode = (): GuessDiff | null => (lsGet('squadlab-gtp-last') as GuessDiff | null) || null
export const setLastGuessMode = (d: GuessDiff) => lsSet('squadlab-gtp-last', d)
