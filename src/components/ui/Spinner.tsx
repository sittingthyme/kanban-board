import { Loader2 } from 'lucide-react'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={`animate-spin text-accent ${className ?? 'h-5 w-5'}`} />
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-text-secondary">Loading project board...</p>
    </div>
  )
}

export function SkeletonBoard() {
  return (
    <div className="flex gap-5 overflow-x-auto">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="min-w-[280px] flex-1 animate-pulse">
          <div className="mb-3 h-10 rounded-lg bg-surface-overlay" />
          <div className="h-[420px] rounded-xl bg-surface-overlay/50" />
        </div>
      ))}
    </div>
  )
}
