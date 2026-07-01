import { useState } from 'react'
import { Plus, Tag, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { LabelBadge } from './LabelBadge'
import { LABEL_COLORS } from '../../lib/types'
import type { Label } from '../../lib/types'

interface LabelsPanelProps {
  labels: Label[]
  onAdd: (name: string, color: string) => Promise<Label | null>
  onRemove: (id: string) => Promise<boolean>
}

export function LabelsPanel({ labels, onAdd, onRemove }: LabelsPanelProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(LABEL_COLORS[0])
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) return
    setSaving(true)
    const result = await onAdd(name.trim(), color)
    setSaving(false)
    if (result) {
      setName('')
      setColor(LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)])
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} className="rounded-full">
        <Tag size={16} />
        Labels
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Manage Labels">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              id="label-name"
              placeholder="Label name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LABEL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-ring ring-offset-2 ring-offset-surface-raised' : ''}`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
          <Button onClick={handleAdd} disabled={!name.trim() || saving} className="w-full">
            <Plus size={16} />
            Add Label
          </Button>

          {labels.length > 0 && (
            <ul className="max-h-48 space-y-2 overflow-y-auto">
              {labels.map((label) => (
                <li
                  key={label.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-overlay px-3 py-2"
                >
                  <LabelBadge label={label} size="md" />
                  <button
                    onClick={() => onRemove(label.id)}
                    className="rounded p-1 text-text-muted hover:bg-danger/10 hover:text-danger"
                    aria-label={`Remove ${label.name}`}
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

interface LabelFilterProps {
  labels: Label[]
  selectedLabelId: string | null
  onSelect: (id: string | null) => void
}

export function LabelFilter({ labels, selectedLabelId, onSelect }: LabelFilterProps) {
  if (labels.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-text-muted">Filter:</span>
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
          selectedLabelId === null
            ? 'bg-accent/20 text-accent'
            : 'text-text-muted hover:text-text-secondary'
        }`}
      >
        All
      </button>
      {labels.map((label) => (
        <LabelBadge
          key={label.id}
          label={label}
          size="md"
          active={selectedLabelId === label.id}
          onClick={() => onSelect(selectedLabelId === label.id ? null : label.id)}
        />
      ))}
    </div>
  )
}

interface LabelPickerProps {
  labels: Label[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function LabelPicker({ labels, selectedIds, onChange }: LabelPickerProps) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  if (labels.length === 0) {
    return <p className="text-xs text-text-muted">Create labels to tag tasks.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <LabelBadge
          key={label.id}
          label={label}
          size="md"
          active={selectedIds.includes(label.id)}
          onClick={() => toggle(label.id)}
        />
      ))}
    </div>
  )
}
