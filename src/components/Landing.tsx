import { useEffect } from 'react'

export default function Landing({ onEnter }: { onEnter: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Enter') onEnter() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onEnter])

  return (
    <button
      onClick={onEnter}
      className="group relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      {/* electric streaks */}
      <div className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: 'conic-gradient(from 210deg at 50% 40%, transparent 0deg, rgba(59,130,246,0.18) 60deg, transparent 130deg, rgba(56,189,248,0.16) 220deg, transparent 300deg)' }} />

      <div className="relative">
        <div className="mb-3 text-6xl drop-shadow-[0_0_18px_rgba(59,130,246,0.7)]">⚽</div>
        <h1
          className="bg-gradient-to-b from-white via-blue-200 to-blue-500 bg-clip-text text-5xl font-black uppercase tracking-tight text-transparent sm:text-7xl"
          style={{ filter: 'drop-shadow(0 0 28px rgba(59,130,246,0.55))' }}
        >
          Squad Lab
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-blue-100/60 sm:text-base">
          Real players. Real transfer values. Build, draft, and dominate across three game modes.
        </p>
        <span className="mt-10 inline-block rounded-full border border-blue-400/50 bg-blue-500/10 px-8 py-3 text-sm font-bold uppercase tracking-wide text-blue-200 shadow-[0_0_30px_rgba(59,130,246,0.35)] transition group-hover:bg-blue-500/25 group-hover:shadow-[0_0_45px_rgba(59,130,246,0.6)]">
          Enter Blue Lock
        </span>
      </div>
    </button>
  )
}
