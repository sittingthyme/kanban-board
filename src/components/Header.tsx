import { useEffect, useRef, useState } from 'react'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { TeamPanel } from './team/TeamPanel'
import { LabelsPanel, LabelFilter } from './labels/LabelsPanel'
import { ThemeToggle } from './ThemeToggle'
import { MemberAvatar } from './team/MemberAvatar'
import { cn } from '../lib/utils'
import type { Label, TeamMember } from '../lib/types'
import type { Theme } from '../hooks/useTheme'

interface HeaderProps {
  search: string
  onSearchChange: (value: string) => void
  onNewTask: () => void
  members: TeamMember[]
  labels: Label[]
  onAddMember: (name: string) => Promise<TeamMember | null>
  onRemoveMember: (id: string) => Promise<boolean>
  onAddLabel: (name: string, color: string) => Promise<Label | null>
  onRemoveLabel: (id: string) => Promise<boolean>
  selectedLabelId: string | null
  onLabelFilter: (id: string | null) => void
  theme: Theme
  onToggleTheme: () => void
}

export function Header({
  search,
  onSearchChange,
  onNewTask,
  members,
  labels,
  onAddMember,
  onRemoveMember,
  onAddLabel,
  onRemoveLabel,
  selectedLabelId,
  onLabelFilter,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const hasActiveFilter = selectedLabelId !== null

  useEffect(() => {
    if (!filtersOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFiltersOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFiltersOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [filtersOpen])

  return (
    <div className="border-b border-border bg-surface-raised px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold tracking-wide text-text-primary">
            KANBAN TASK BOARD
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {members.length > 0 && (
            <div className="flex -space-x-2">
              {members.slice(0, 5).map((member) => (
                <MemberAvatar key={member.id} member={member} size="md" />
              ))}
              {members.length > 5 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-overlay text-xs font-medium text-text-secondary ring-2 ring-surface-raised">
                  +{members.length - 5}
                </div>
              )}
            </div>
          )}

          <div className="relative min-w-[200px] flex-1 sm:flex-none sm:w-56">
            <Search
              size={15}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-text-muted"
            />
            <Input
              id="search"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="rounded-full border-border-subtle bg-surface-overlay py-1.5 pl-9"
            />
          </div>

          <TeamPanel members={members} onAdd={onAddMember} onRemove={onRemoveMember} />
          <LabelsPanel labels={labels} onAdd={onAddLabel} onRemove={onRemoveLabel} />

          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border transition-colors',
                filtersOpen || hasActiveFilter
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-text-secondary hover:bg-surface-overlay hover:text-text-primary',
              )}
              aria-label="Filter tasks"
              aria-expanded={filtersOpen}
              aria-haspopup="true"
            >
              <SlidersHorizontal size={16} />
            </button>

            {filtersOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-surface-raised p-4 shadow-xl"
                role="menu"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Filter by label
                </p>
                {labels.length > 0 ? (
                  <LabelFilter
                    labels={labels}
                    selectedLabelId={selectedLabelId}
                    onSelect={(id) => {
                      onLabelFilter(id)
                      if (id !== null) setFiltersOpen(false)
                    }}
                  />
                ) : (
                  <p className="text-sm text-text-muted">
                    No labels yet. Create labels to filter tasks.
                  </p>
                )}
                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      onLabelFilter(null)
                      setFiltersOpen(false)
                    }}
                    className="mt-3 w-full rounded-lg border border-border py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-overlay hover:text-text-primary"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </div>

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <Button
            onClick={onNewTask}
            className="rounded-full bg-success px-5 hover:bg-success/90"
          >
            <Plus size={16} />
            Add Task
          </Button>
        </div>
      </div>
    </div>
  )
}
