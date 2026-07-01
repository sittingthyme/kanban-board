import { useEffect, useState } from 'react'
import { X, Trash2, MessageSquare } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Spinner } from '../ui/Spinner'
import { AssigneePicker } from '../team/TeamPanel'
import { LabelPicker } from '../labels/LabelsPanel'
import { useComments } from '../../hooks/useComments'
import { formatRelativeTime, cn } from '../../lib/utils'
import { COLUMNS, PRIORITY_OPTIONS } from '../../lib/types'
import type { Label, TaskWithRelations, TeamMember } from '../../lib/types'

interface TaskDetailPanelProps {
  task: TaskWithRelations | null
  userId: string | undefined
  members: TeamMember[]
  labels: Label[]
  onClose: () => void
  onUpdate: (
    id: string,
    input: {
      title?: string
      description?: string | null
      priority?: TaskWithRelations['priority']
      due_date?: string | null
      status?: TaskWithRelations['status']
    },
  ) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
  onSetAssignees: (taskId: string, memberIds: string[]) => Promise<boolean>
  onSetLabels: (taskId: string, labelIds: string[]) => Promise<boolean>
}

export function TaskDetailPanel({
  task,
  userId,
  members,
  labels,
  onClose,
  onUpdate,
  onDelete,
  onSetAssignees,
  onSetLabels,
}: TaskDetailPanelProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskWithRelations['priority']>('normal')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<TaskWithRelations['status']>('todo')
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])
  const [labelIds, setLabelIds] = useState<string[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentSaving, setCommentSaving] = useState(false)

  const { comments, loading: commentsLoading, addComment } = useComments(
    task?.id ?? null,
    userId,
  )

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setPriority(task.priority)
      setDueDate(task.due_date ?? '')
      setStatus(task.status)
      setAssigneeIds(task.assignees.map((a) => a.id))
      setLabelIds(task.labels.map((l) => l.id))
    }
  }, [task])

  if (!task) return null

  const handleSave = async () => {
    await onUpdate(task.id, {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate || null,
      status,
    })
    await onSetAssignees(task.id, assigneeIds)
    await onSetLabels(task.id, labelIds)
  }

  const handleDelete = async () => {
    if (confirm('Delete this task?')) {
      await onDelete(task.id)
      onClose()
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    setCommentSaving(true)
    const result = await addComment(commentText.trim())
    setCommentSaving(false)
    if (result) setCommentText('')
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-border bg-surface-raised shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-text-secondary">Task Details</h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-text-muted hover:bg-surface-overlay hover:text-text-primary"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <Input
          id="detail-title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
        />

        <Textarea
          id="detail-description"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleSave}
          placeholder="Add a description..."
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Status</label>
            <select
              value={status}
              onChange={(e) => {
                const val = e.target.value as TaskWithRelations['status']
                setStatus(val)
                onUpdate(task.id, { status: val })
              }}
              className="rounded-lg border border-border bg-surface-overlay px-3 py-2 text-sm"
            >
              {COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Priority</label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setPriority(p.value)
                    onUpdate(task.id, { priority: p.value })
                  }}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                    priority === p.value
                      ? 'border-transparent text-white'
                      : 'border-border bg-surface-overlay text-text-secondary hover:border-border-subtle',
                  )}
                  style={
                    priority === p.value
                      ? { backgroundColor: p.color }
                      : undefined
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Input
          id="detail-due-date"
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          onBlur={handleSave}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-text-secondary">Assignees</p>
          <AssigneePicker
            members={members}
            selectedIds={assigneeIds}
            onChange={(ids) => {
              setAssigneeIds(ids)
              onSetAssignees(task.id, ids)
            }}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-text-secondary">Labels</p>
          <LabelPicker
            labels={labels}
            selectedIds={labelIds}
            onChange={(ids) => {
              setLabelIds(ids)
              onSetLabels(task.id, ids)
            }}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare size={16} className="text-text-muted" />
            <p className="text-sm font-medium text-text-secondary">
              Comments ({comments.length})
            </p>
          </div>

          {commentsLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-text-muted">No comments yet.</p>
          ) : (
            <ul className="mb-4 space-y-3">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-lg border border-border bg-surface-overlay px-3 py-2"
                >
                  <p className="text-sm text-text-primary">{comment.body}</p>
                  <p className="mt-1 text-[10px] text-text-muted">
                    {formatRelativeTime(comment.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              className="flex-1 rounded-lg border border-border bg-surface-overlay px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
            <Button
              size="sm"
              onClick={handleAddComment}
              disabled={!commentText.trim() || commentSaving}
            >
              Send
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <Button variant="danger" size="sm" onClick={handleDelete} className="w-full">
          <Trash2 size={14} />
          Delete Task
        </Button>
      </div>
    </div>
  )
}
