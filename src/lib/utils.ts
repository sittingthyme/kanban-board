import clsx, { type ClassValue } from 'clsx'
import { MEMBER_COLORS } from './types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function getMemberAvatarColor(memberId: string): string {
  let hash = 0
  for (let i = 0; i < memberId.length; i++) {
    hash = memberId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length]
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  const due = new Date(dueDate + 'T23:59:59')
  return due < new Date()
}

export function isDueSoon(dueDate: string | null): boolean {
  if (!dueDate) return false
  const due = new Date(dueDate + 'T23:59:59')
  const now = new Date()
  const threeDays = 3 * 24 * 60 * 60 * 1000
  return due >= now && due.getTime() - now.getTime() <= threeDays
}

export function formatDueDate(dueDate: string): string {
  return new Date(dueDate + 'T12:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}
