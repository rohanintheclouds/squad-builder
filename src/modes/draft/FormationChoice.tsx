import { FORMATIONS } from '../../data/formations'
import type { Position } from '../../types'
import type { Draft } from './engine'

const GROUP_COLOR = (pos: Position) => {
  if (pos === 'GK') return '#cbd5e1'
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return '#60a5fa'
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos)) return '#34d399'
  return '#f87171'
}

function FormationMini({ name }: { name: string }) {
  const f = FORMATIONS.find((x) => x.name === name)!
  return (
    <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '68 / 92', background: 'linear-gradient(180deg,#1a6e3f,#0c3f23)' }}>
      {f.slots.map((s) => (
        <span key={s.id} className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-black/30"
          style={{ left: `${s.x}%`, top: `${s.y}%`, background: GROUP_COLOR(s.type) }} />
      ))}
    </div>
  )
}

export default function FormationChoice({ draft }: { draft: Draft }) {
  const { formationChoices, chooseFormation } = draft.useStore()
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col px-4 py-5">
      <div className="shrink-0 text-center">
        <div className="text-2xl font-black text-white sm:text-3xl">Pick your formation</div>
        <div className="mt-1 text-sm text-white/55">5 random shapes — tap one to start the draft.</div>
      </div>
      {/* mobile: horizontal swipe carousel · desktop: 5-across grid */}
      <div className="flex min-h-0 flex-1 items-center">
        <div className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3 sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible">
          {formationChoices.map((name) => (
            <button key={name} onClick={() => chooseFormation(name)}
              className="glass group w-[42vw] max-w-[200px] shrink-0 snap-center rounded-xl border border-white/10 p-3 transition hover:border-blue-400 hover:-translate-y-1 sm:w-auto sm:max-w-none">
              <FormationMini name={name} />
              <div className="mt-2 text-center text-sm font-bold text-white">{name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
