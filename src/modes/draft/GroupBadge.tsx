import { flag } from '../../lib/flags'

// initials for a club crest, e.g. "Real Madrid" -> "RM", "PSG" -> "PSG", "Bayern" -> "BAY"
function initials(name: string): string {
  const words = name.split(/\s+/)
  if (words.length === 1) return name.slice(0, 3).toUpperCase()
  return words.map((w) => w[0]).join('').slice(0, 3).toUpperCase()
}

// deterministic color from the club name
function hueFor(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return h
}

export default function GroupBadge({ kind, name, size = 'md' }: {
  kind: 'nation' | 'club'
  name: string
  size?: 'md' | 'lg'
}) {
  const dim = size === 'lg' ? 'h-12 w-12 text-sm' : 'h-9 w-9 text-[11px]'
  if (kind === 'nation') {
    return <span className={size === 'lg' ? 'text-4xl' : 'text-3xl'}>{flag(name)}</span>
  }
  const hue = hueFor(name)
  return (
    <span
      className={`flex ${dim} shrink-0 items-center justify-center rounded-lg font-black text-white shadow`}
      style={{ background: `linear-gradient(160deg, hsl(${hue} 65% 42%), hsl(${(hue + 40) % 360} 65% 28%))` }}
    >
      {initials(name)}
    </span>
  )
}
