/** Format a € millions value: 110 -> "€110.0M", 4.5 -> "€4.5M". */
export function fmtValue(m: number): string {
  if (m >= 1000) return `€${(m / 1000).toFixed(2)}B`
  return `€${m.toFixed(m % 1 === 0 ? 0 : 1)}M`
}
