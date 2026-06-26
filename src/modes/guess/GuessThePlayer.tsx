import { useMemo, useState } from 'react'
import { PLAYERS } from '../../data/players'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { getStreak, getBestStreak, recordGuessWin, recordGuessLoss, setLastGuessMode, type GuessDiff } from '../../lib/progress'
import { compare, MAX_GUESSES, type Cell, type Color } from './compare'
import type { Player } from '../../types'

// Desktop: fractional columns that fill the width (no scroll). Mobile: fixed widths that scroll.
const DESKTOP_COLS = 'minmax(120px,1.7fr) repeat(7, minmax(0,1fr))'
const MOBILE_COLS = '128px 98px 126px 116px 66px 56px 74px 84px'
const HEADERS = ['Name', 'Club', 'Nation', 'Position', 'Foot', 'Age', 'Height', 'Value']
const CASUAL_SIZE = 150

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
// Casual pool = the 150 most valuable (most recognisable) players. Fanatic = everyone.
const TOP_150 = [...PLAYERS].sort((a, b) => (b.value ?? 0) - (a.value ?? 0)).slice(0, CASUAL_SIZE)
const poolFor = (d: GuessDiff) => (d === 'casual' ? TOP_150 : PLAYERS)
const randomFrom = (pool: Player[]) => pool[Math.floor(Math.random() * pool.length)]

const CELL_BG: Record<Color, string> = {
  green: 'bg-emerald-500/30 border-emerald-400/50 text-emerald-50',
  yellow: 'bg-amber-500/30 border-amber-400/50 text-amber-50',
  red: 'bg-red-500/25 border-red-400/40 text-red-100',
  plain: 'bg-white/5 border-white/10 text-white',
}

function Row({ cells, cols }: { cells: Cell[]; cols: string }) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: cols }}>
      {cells.map((c, i) => (
        <div
          key={i}
          className={`flex min-w-0 items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-center text-[13px] font-semibold ${i === 0 ? `sticky left-0 z-10 justify-start !text-left ${c.color === 'green' ? CELL_BG.green : 'border-white/10 bg-[#0e1626]'}` : CELL_BG[c.color]}`}
        >
          <span className="truncate">{c.value}</span>
          {c.dir && <span className="shrink-0 text-base leading-none">{c.dir === 'up' ? '↑' : '↓'}</span>}
        </div>
      ))}
    </div>
  )
}

export default function GuessThePlayer({ onExit }: { onExit: () => void }) {
  const [difficulty, setDifficulty] = useState<GuessDiff | null>(null)
  const [target, setTarget] = useState<Player | null>(null)
  const [guesses, setGuesses] = useState<Player[]>([])
  const [query, setQuery] = useState('')
  const [streak, setStreak] = useState(0)
  const isMobile = useMediaQuery('(max-width: 640px)')
  const cols = isMobile ? MOBILE_COLS : DESKTOP_COLS
  const pool = difficulty ? poolFor(difficulty) : PLAYERS

  const won = !!target && guesses.some((g) => g.id === target.id)
  const lost = !!target && !won && guesses.length >= MAX_GUESSES
  const done = won || lost

  const matches = useMemo(() => {
    const q = norm(query.trim())
    if (!q) return []
    const guessed = new Set(guesses.map((g) => g.id))
    return pool.filter((p) => !guessed.has(p.id) && norm(p.name).includes(q)).slice(0, 6)
  }, [query, guesses, pool])

  function start(d: GuessDiff) {
    setDifficulty(d); setLastGuessMode(d)
    setTarget(randomFrom(poolFor(d))); setGuesses([]); setQuery(''); setStreak(getStreak(d))
  }

  function guess(p: Player) {
    if (done || !target || !difficulty) return
    const next = [...guesses, p]
    setGuesses(next)
    setQuery('')
    if (p.id === target.id) setStreak(recordGuessWin(difficulty))
    else if (next.length >= MAX_GUESSES) { recordGuessLoss(difficulty); setStreak(0) }
  }

  function newGame() {
    setTarget(randomFrom(pool)); setGuesses([]); setQuery('')
    if (difficulty) setStreak(getStreak(difficulty))
  }

  // difficulty picker
  if (!difficulty || !target) {
    const Card = ({ d, emoji, title, blurb }: { d: GuessDiff; emoji: string; title: string; blurb: string }) => (
      <button onClick={() => start(d)}
        className="glass group flex-1 rounded-2xl border border-white/10 p-5 text-left transition hover:-translate-y-1 hover:border-blue-400">
        <div className="text-3xl">{emoji}</div>
        <div className="mt-2 text-lg font-black text-white">{title}</div>
        <div className="mt-1 text-sm leading-snug text-white/55">{blurb}</div>
        <div className="mt-3 text-xs font-semibold text-blue-200/80">Best streak: {getBestStreak(d)}</div>
      </button>
    )
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-4 py-6">
        <div className="mb-1 text-center text-2xl font-black text-white sm:text-3xl">Do You Know Ball?</div>
        <div className="mb-6 text-center text-sm text-white/55">Pick a difficulty.</div>
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          <Card d="hard" emoji="🧠" title="Futbol Fanatic" blurb={`Hard mode — the mystery player can be ANY of the ${PLAYERS.length} players in the database.`} />
          <Card d="casual" emoji="🌥️" title="Casual Play" blurb={`Easier — only the top ${CASUAL_SIZE} players (by value) are in play.`} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col px-3 py-4">
      {/* header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-lg font-black text-blue-300">?</span>
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && matches[0]) guess(matches[0]) }}
            disabled={done}
            placeholder="Guess a player…"
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-blue-400 disabled:opacity-50"
          />
          {matches.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-white/15 bg-[#0d1320] shadow-2xl">
              {matches.map((p) => (
                <button key={p.id} onClick={() => guess(p)} className="block w-full px-3 py-2 text-left text-sm text-white hover:bg-blue-500/20">
                  {p.name} <span className="text-white/40">· {p.club}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-xs">
          <div className="text-[10px] uppercase tracking-wide text-white/40">{difficulty === 'hard' ? 'Fanatic' : 'Casual'} streak</div>
          <div className="font-bold text-white">{streak}{streak >= 3 ? ' 🔥' : ''}</div>
        </div>
      </div>

      {/* board: fills the screen on desktop, scrolls horizontally on mobile */}
      <div className="relative min-h-0 flex-1">
        <div className="h-full overflow-x-auto overflow-y-auto scroll-smooth pb-1">
          <div style={{ width: isMobile ? 'max-content' : '100%' }}>
            <div className="mb-1.5 grid gap-1.5 px-0.5" style={{ gridTemplateColumns: cols }}>
              {HEADERS.map((h, i) => (
                <div key={h} className={`truncate text-center text-[11px] font-bold uppercase tracking-wide text-white/50 ${i === 0 ? 'sticky left-0 z-10 bg-[#070b10] text-left' : ''}`}>{h}</div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              {guesses.map((g, i) => <Row key={i} cells={compare(g, target)} cols={cols} />)}
              {!done && Array.from({ length: MAX_GUESSES - guesses.length }, (_, i) => (
                <div key={i} className="grid gap-1.5" style={{ gridTemplateColumns: cols }}>
                  <div className="col-span-full rounded-lg border border-dashed border-white/10 py-2.5 text-center text-xs text-white/30">
                    {guesses.length + i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {isMobile && <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-[#070b10] to-transparent" />}
      </div>

      {/* finish overlay */}
      {done && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <div className="glass w-full max-w-sm rounded-2xl border border-white/10 p-6 text-center">
            <div className="text-3xl font-black" style={{ color: won ? '#34d399' : '#ef4444' }}>{won ? 'Correct!' : 'Out of guesses'}</div>
            <div className="mt-2 text-sm text-white/70">
              The player was <b className="text-white">{target.name}</b> ({target.club}).
            </div>
            {won ? (
              <div className="mt-3 text-sm font-semibold text-amber-300">
                Streak: {streak}{streak >= 3 ? ' 🔥 You’re on fire!' : ''} · solved in {guesses.length}/{MAX_GUESSES}
              </div>
            ) : (
              <div className="mt-3 text-sm font-semibold text-white/60">Streak reset to 0.</div>
            )}
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <button onClick={newGame} className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-blue-400">Play again</button>
              <button onClick={() => setDifficulty(null)} className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10">Switch mode</button>
              <button onClick={onExit} className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10">Back to modes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
