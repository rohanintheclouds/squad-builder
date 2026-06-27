import { useState } from 'react'
import Landing from './components/Landing'
import ModeSelect from './components/ModeSelect'
import RulesModal from './components/RulesModal'
import { MODES } from './modes'

type Screen = 'landing' | 'modes' | string

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [showRules, setShowRules] = useState(false)

  if (screen === 'landing') return <Landing onEnter={() => setScreen('modes')} />
  if (screen === 'modes') return <ModeSelect onSelect={setScreen} />

  const mode = MODES.find((m) => m.id === screen)
  if (!mode) return <ModeSelect onSelect={setScreen} />
  const Mode = mode.Component

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-white/10 bg-[#0b1118] px-3">
        <button
          onClick={() => setScreen('modes')}
          className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/80 hover:bg-white/10"
        >
          ← Modes
        </button>
        <span className="text-sm font-bold text-white/80">{mode.emoji} {mode.name}</span>
        <button
          onClick={() => setShowRules(true)}
          title="How to play"
          className="ml-auto flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-bold text-white/70 hover:bg-white/10"
        >
          ⓘ
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <Mode onExit={() => setScreen('modes')} />
      </div>
      {showRules && <RulesModal title={mode.name} accent={mode.accent} rules={mode.rules} onClose={() => setShowRules(false)} />}
    </div>
  )
}
