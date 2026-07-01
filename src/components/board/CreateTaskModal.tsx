import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Modal } from '../ui/Modal'
import { AssigneePicker } from '../team/TeamPanel'
import { LabelPicker } from '../labels/LabelsPanel'
import { PRIORITY_OPTIONS, type CreateTaskInput, type Label, type TaskStatus, type TeamMember } from '../../lib/types'

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  onCreate: (input: CreateTaskInput) => Promise<unknown>
  defaultStatus?: TaskStatus
  saving?: boolean
  members: TeamMember[]
  labels: Label[]
}

export function CreateTaskModal({
  open,
  onClose,
  onCreate,
  defaultStatus = 'todo',
  saving,
  members,
  labels,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<CreateTaskInput['priority']>('normal')
  const [dueDate, setDueDate] = useState('')
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])
  const [labelIds, setLabelIds] = useState<string[]>([])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority('normal')
    setDueDate('')
    setAssigneeIds([])
    setLabelIds([])
  }

  useEffect(() => {
    if (!open) resetForm()
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const result = await onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: dueDate || null,
      status: defaultStatus,
      assigneeIds: assigneeIds.length > 0 ? assigneeIds : undefined,
      labelIds: labelIds.length > 0 ? labelIds : undefined,
    })

    if (result) {
      resetForm()
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="task-title"
          label="Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
        <Textarea
          id="task-description"
          label="Description"
          placeholder="Add more details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-priority" className="text-sm font-medium text-text-secondary">
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as CreateTaskInput['priority'])}
            className="rounded-lg border border-border bg-surface-overlay px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          id="task-due-date"
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-secondary">Assignees</span>
          <AssigneePicker
            members={members}
            selectedIds={assigneeIds}
            onChange={setAssigneeIds}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-secondary">Labels</span>
          <LabelPicker labels={labels} selectedIds={labelIds} onChange={setLabelIds} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim() || saving}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  )
}
