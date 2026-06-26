// Card tier from rating. Single source of truth (cards + selection lists use this).
//   88+ purple · 75-87 gold · 65-74 silver · else bronze
export type TierName = 'purple' | 'gold' | 'silver' | 'bronze'

export function tierOf(rating: number): TierName {
  if (rating >= 88) return 'purple'
  if (rating >= 75) return 'gold'
  if (rating >= 65) return 'silver'
  return 'bronze'
}

export const TIER: Record<TierName, { from: string; via: string; to: string; ink: string }> = {
  purple: { from: '#efe1ff', via: '#a855f7', to: '#6d28d9', ink: '#2a0a4f' },
  gold: { from: '#fbf0c4', via: '#e7c65a', to: '#b8922f', ink: '#3a2c05' },
  silver: { from: '#eef1f6', via: '#c6ccd8', to: '#9aa3b2', ink: '#23272f' },
  bronze: { from: '#f0d6b8', via: '#d09e6f', to: '#a9703f', ink: '#3a2410' },
}

/** CSS gradient for a small tier badge (used in player selection rows). */
export function tierBadge(rating: number): { background: string; color: string } {
  const t = TIER[tierOf(rating)]
  return { background: `linear-gradient(160deg, ${t.from}, ${t.via} 55%, ${t.to})`, color: t.ink }
}
