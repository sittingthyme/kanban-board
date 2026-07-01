import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-subtle py-12 text-center">
      <Inbox size={20} className="text-text-muted" />
      <p className="text-xs text-text-muted">{message}</p>
    </div>
  )
}
