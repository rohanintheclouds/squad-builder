import type { Player, Eligibility, Position } from '../types'
import { ELIGIBILITY_COLOR } from '../lib/positions'
import { flag } from '../lib/flags'

// Card tier is driven by the player's (hidden) rating, FUT-style:
//   90+  glossy purple (special)   80+  gold   70+  silver   else bronze
function tier(rating: number) {
  if (rating >= 90) return { from: '#efe1ff', via: '#a855f7', to: '#6d28d9', ink: '#2a0a4f', purple: true }
  if (rating >= 80) return { from: '#fbf0c4', via: '#e7c65a', to: '#b8922f', ink: '#3a2c05', purple: false }
  if (rating >= 70) return { from: '#eef1f6', via: '#c6ccd8', to: '#9aa3b2', ink: '#23272f', purple: false }
  return { from: '#f0d6b8', via: '#d09e6f', to: '#a9703f', ink: '#3a2410', purple: false }
}

export default function PlayerCard({
  player,
  slotType,
  eligibility,
  role,
  focus,
  dimmed,
  showValue,
}: {
  player: Player
  slotType: Position
  eligibility: Eligibility
  role?: string
  focus?: string
  dimmed?: boolean
  /** Lead with market value (Squad Builder). Otherwise lead with position. Rating is never shown. */
  showValue?: boolean
}) {
  const t = tier(player.rating)
  const last = player.name.split(' ').slice(-1)[0]
  return (
    <div
      className={`relative w-[84px] select-none rounded-[14px] p-[2px] transition ${dimmed ? 'opacity-40' : ''}`}
      style={{
        background: ELIGIBILITY_COLOR[eligibility],
        boxShadow: t.purple ? '0 0 16px rgba(168,85,247,0.6), 0 8px 20px rgba(0,0,0,0.45)' : '0 8px 20px rgba(0,0,0,0.45)',
      }}
    >
      <div
        className="relative overflow-hidden rounded-[12px] px-1.5 pb-1 pt-1.5"
        style={{ background: `linear-gradient(160deg, ${t.from} 0%, ${t.via} 55%, ${t.to} 100%)`, color: t.ink }}
      >
        {/* sheen */}
        <div className="pointer-events-none absolute -left-6 -top-8 h-16 w-24 rotate-12 bg-white/30 blur-md" />
        {t.purple && <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30" />}

        <div className="relative flex items-start justify-between">
          <div className="leading-none">
            {showValue ? (
              <>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[18px] font-black tracking-tight">{player.value != null ? Math.round(player.value) : '—'}</span>
                  {player.value != null && <span className="text-[8px] font-bold opacity-70">€M</span>}
                </div>
                <div className="text-[10px] font-bold opacity-80">{slotType}</div>
              </>
            ) : (
              <div className="text-[20px] font-black tracking-tight">{slotType}</div>
            )}
          </div>
          <div className="flex flex-col items-center gap-0.5 pt-0.5 text-[12px] leading-none">
            <span>{flag(player.nationality)}</span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-black text-white" style={{ background: t.ink }} title={player.club}>
              {player.club[0]}
            </span>
          </div>
        </div>

        <div className="relative mt-1 truncate border-t border-black/15 pt-0.5 text-center text-[11px] font-bold uppercase tracking-tight">
          {last}
        </div>

        <div className="relative mt-0.5 flex items-center justify-center">
          <span className="max-w-full truncate rounded bg-black/75 px-1.5 py-[1px] text-[9px] font-bold text-white/90">
            {player.club}
          </span>
        </div>

        {role && (
          <div className="relative mt-0.5 truncate rounded bg-black/80 px-1 py-[1px] text-center text-[8px] font-semibold text-sky-200" title={`${role}${focus ? ' · ' + focus : ''}`}>
            {role}{focus ? ` · ${focus}` : ''}
          </div>
        )}
      </div>
    </div>
  )
}
