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
      className="group flex h-full w-full flex-col items-center justify-center px-6 text-center"
    >
      <div className="mb-3 text-6xl">⚽</div>
      <h1 className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-7xl">
        Squad Lab
      </h1>
      <p className="mt-3 max-w-md text-sm text-white/55 sm:text-base">
        Build teams with real-life transfer values. Multiple game modes, real players, real prices.
      </p>
      <span className="mt-10 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-8 py-3 text-sm font-bold text-cyan-200 transition group-hover:bg-cyan-400/20">
        Press Enter to start
      </span>
    </button>
  )
}
