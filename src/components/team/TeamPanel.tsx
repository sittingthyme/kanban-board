import { useState } from 'react'
import { Plus, Trash2, Users } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { MemberAvatar } from './MemberAvatar'
import type { TeamMember } from '../../lib/types'

interface TeamPanelProps {
  members: TeamMember[]
  onAdd: (name: string) => Promise<TeamMember | null>
  onRemove: (id: string) => Promise<boolean>
}

export function TeamPanel({ members, onAdd, onRemove }: TeamPanelProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) return
    setSaving(true)
    const result = await onAdd(name.trim())
    setSaving(false)
    if (result) {
      setName('')
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} className="rounded-full">
        <Users size={16} />
        Team
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Team Members">
        <div className="space-y-4">
          <Input
            id="member-name"
            placeholder="Member name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={!name.trim() || saving} className="w-full">
            <Plus size={16} />
            Add Member
          </Button>

          {members.length > 0 && (
            <ul className="max-h-48 space-y-2 overflow-y-auto">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-overlay px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <MemberAvatar member={member} size="md" />
                    <span className="text-sm">{member.name}</span>
                  </div>
                  <button
                    onClick={() => onRemove(member.id)}
                    className="rounded p-1 text-text-muted hover:bg-danger/10 hover:text-danger"
                    aria-label={`Remove ${member.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </>
  )
}

interface AssigneePickerProps {
  members: TeamMember[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function AssigneePicker({ members, selectedIds, onChange }: AssigneePickerProps) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  if (members.length === 0) {
    return <p className="text-xs text-text-muted">Add team members to assign tasks.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {members.map((member) => {
        const selected = selectedIds.includes(member.id)
        return (
          <button
            key={member.id}
            type="button"
            onClick={() => toggle(member.id)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              selected
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-surface-overlay text-text-secondary hover:border-border-subtle'
            }`}
          >
            <MemberAvatar member={member} />
            {member.name}
          </button>
        )
      })}
    </div>
  )
}
