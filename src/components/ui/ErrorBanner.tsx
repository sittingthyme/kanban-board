import { AlertCircle, X } from 'lucide-react'

interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-center gap-3 border-b border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 rounded p-0.5 hover:bg-danger/20">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
