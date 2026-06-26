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

// Guess the Player streaks
export const getStreak = () => Number(lsGet('squadlab-gtp-streak') || 0)
export const getBestStreak = () => Number(lsGet('squadlab-gtp-best') || 0)
export function recordGuessWin(): number {
  const s = getStreak() + 1
  lsSet('squadlab-gtp-streak', String(s))
  if (s > getBestStreak()) lsSet('squadlab-gtp-best', String(s))
  return s
}
export function recordGuessLoss() { lsSet('squadlab-gtp-streak', '0') }
