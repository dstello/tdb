import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchIssue,
  fetchIssues,
  transitionIssue,
  addComment,
  deleteIssue,
  updateIssue,
  getSafeErrorMessage,
  type Issue,
} from '~/lib/api'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Separator } from '~/components/ui/separator'
import { statuses, types, priorities } from '~/components/tasks/data'
import {
  Pencil,
  Play,
  Eye,
  ShieldBan,
  XCircle,
  Check,
  RotateCcw,
  LockOpen,
  Mountain,
} from 'lucide-react'
import { getActivityIcon } from '~/lib/activity-icons'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/issues/$id')({
  params: z.object({
    id: z.string().regex(/^[a-zA-Z0-9_-]+$/).max(128),
  }),
  component: IssueDetailPage,
})

const typeOptions = [
  { value: 'task', label: 'Task' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'epic', label: 'Epic' },
  { value: 'chore', label: 'Chore' },
]

const priorityOptions = [
  { value: 'P0', label: 'P0' },
  { value: 'P1', label: 'P1' },
  { value: 'P2', label: 'P2' },
  { value: 'P3', label: 'P3' },
  { value: 'P4', label: 'P4' },
]

const transitionMap: Record<string, { actions: string[]; label: string; icon: React.ComponentType<{ className?: string }>; className: string }[]> = {
  open: [
    { actions: ['start'], label: 'Start', icon: Play, className: 'text-emerald-400 hover:bg-emerald-400/10' },
    { actions: ['review'], label: 'Review', icon: Eye, className: 'text-blue-400 hover:bg-blue-400/10' },
    { actions: ['block'], label: 'Block', icon: ShieldBan, className: 'text-amber-400 hover:bg-amber-400/10' },
    { actions: ['close'], label: 'Close', icon: XCircle, className: 'text-red-400 hover:bg-red-400/10' },
  ],
  in_progress: [
    { actions: ['review'], label: 'Review', icon: Eye, className: 'text-blue-400 hover:bg-blue-400/10' },
    { actions: ['close', 'reopen'], label: 'Back to Ready', icon: RotateCcw, className: 'text-muted-foreground hover:bg-muted-foreground/10' },
    { actions: ['block'], label: 'Block', icon: ShieldBan, className: 'text-amber-400 hover:bg-amber-400/10' },
    { actions: ['close'], label: 'Close', icon: XCircle, className: 'text-red-400 hover:bg-red-400/10' },
  ],
  in_review: [
    { actions: ['approve'], label: 'Approve', icon: Check, className: 'text-emerald-400 hover:bg-emerald-400/10' },
    { actions: ['reject'], label: 'Back to Ready', icon: RotateCcw, className: 'text-muted-foreground hover:bg-muted-foreground/10' },
    { actions: ['close'], label: 'Close', icon: XCircle, className: 'text-red-400 hover:bg-red-400/10' },
  ],
  blocked: [
    { actions: ['unblock'], label: 'Unblock', icon: LockOpen, className: 'text-emerald-400 hover:bg-emerald-400/10' },
    { actions: ['close'], label: 'Close', icon: XCircle, className: 'text-red-400 hover:bg-red-400/10' },
  ],
  closed: [
    { actions: ['reopen'], label: 'Reopen', icon: RotateCcw, className: 'text-blue-400 hover:bg-blue-400/10' },
  ],
}

function IssueDetailPage() {
  const { id } = Route.useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [commentText, setCommentText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<{
    title: string
    description: string
    type: string
    priority: string
  } | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => fetchIssue(id),
  })

  const issue = data?.issue

  const parentQuery = useQuery({
    queryKey: ['issue', issue?.parent_id],
    queryFn: () => fetchIssue(issue!.parent_id!),
    enabled: !!issue?.parent_id,
  })

  const childrenQuery = useQuery({
    queryKey: ['issues', 'children', id],
    queryFn: () => fetchIssues({ parent: id, limit: 500 }),
    enabled: issue?.type === 'epic',
    select: (data) => data.issues,
  })

  const transitionMut = useMutation({
    mutationFn: async ({ actions }: { actions: string[] }) => {
      let result
      for (const action of actions) {
        result = await transitionIssue(id, action as any)
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] })
      queryClient.invalidateQueries({ queryKey: ['monitor'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  const commentMut = useMutation({
    mutationFn: () => addComment(id, commentText),
    onSuccess: () => {
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: ['issue', id] })
    },
  })

  const deleteMut = useMutation({
    mutationFn: () => deleteIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      router.navigate({ to: '/' })
    },
  })

  const editMut = useMutation({
    mutationFn: (fields: { title?: string; description?: string; type?: string; priority?: string }) =>
      updateIssue(id, fields),
    onSuccess: () => {
      setIsEditing(false)
      setEditForm(null)
      queryClient.invalidateQueries({ queryKey: ['issue', id] })
      queryClient.invalidateQueries({ queryKey: ['monitor'] })
    },
  })

  const startEditing = (issue: Issue) => {
    setEditForm({
      title: issue.title,
      description: issue.description ?? '',
      type: issue.type,
      priority: issue.priority,
    })
    setIsEditing(true)
  }

  const saveEdit = () => {
    if (!editForm) return
    editMut.mutate(editForm)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditForm(null)
  }

  if (isLoading) return <div className="text-muted-foreground py-12 text-center">Loading...</div>
  if (error || !data)
    return (
      <div className="text-destructive py-12 text-center">
        Failed to load issue: {getSafeErrorMessage(error)}
      </div>
    )

  const { issue: loadedIssue, logs, comments, dependencies, blocked_by } = data
  const transitions = transitionMap[loadedIssue.status] ?? []
  const status = statuses.find((s) => s.value === loadedIssue.status)
  const issueType = types.find((t) => t.value === loadedIssue.type)
  const priority = priorities.find((p) => p.value === loadedIssue.priority)
  const parentIssue = parentQuery.data?.issue
  const children = childrenQuery.data ?? []

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block">
        ← Back to issues
      </Link>

      {/* Issue header */}
      <div className="rounded-lg border border-border/60 bg-card p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {issueType && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <issueType.icon className="size-3.5" />
                {issueType.label}
              </span>
            )}
            <span className="text-[11px] font-mono text-muted-foreground/60">{loadedIssue.id}</span>
            {status && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${(status as any).className ?? ''}`}>
                <status.icon className="size-3" />
                {status.label}
              </span>
            )}
            {priority && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${(priority as any).className ?? ''}`}>
                <priority.icon className="size-3" />
                {priority.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground gap-1"
                onClick={() => startEditing(loadedIssue)}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive/60 hover:text-destructive"
              disabled={deleteMut.isPending}
              onClick={() => {
                if (deleteMut.isPending) return
                if (confirm('Delete this issue?')) deleteMut.mutate()
              }}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Parent epic link */}
        {parentIssue && (
          <Link
            to="/epics/$id"
            params={{ id: parentIssue.id }}
            className="inline-flex items-center gap-1.5 text-xs text-purple-400/80 hover:text-purple-400 transition-colors mb-2"
          >
            <Mountain className="size-3" />
            {parentIssue.title}
          </Link>
        )}

        {/* Edit mode */}
        {isEditing && editForm ? (
          <div className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); saveEdit() }
                  if (e.key === 'Escape') cancelEdit()
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">Type</label>
                <div className="flex flex-wrap gap-1">
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, type: opt.value })}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-md transition-colors',
                        editForm.type === opt.value
                          ? 'bg-foreground/10 text-foreground font-medium'
                          : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-foreground/5'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">Priority</label>
                <div className="flex flex-wrap gap-1">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, priority: opt.value })}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-md transition-colors',
                        editForm.priority === opt.value
                          ? 'bg-foreground/10 text-foreground font-medium'
                          : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-foreground/5'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); saveEdit() }
                  if (e.key === 'Escape') cancelEdit()
                }}
              />
            </div>
            {editMut.error && (
              <p className="text-sm text-destructive">{getSafeErrorMessage(editMut.error)}</p>
            )}
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={saveEdit} disabled={!editForm.title.trim() || editMut.isPending}>
                {editMut.isPending ? 'Saving...' : 'Save'}
                <span className="ml-1 text-[10px] opacity-50">⌘↵</span>
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-2">{loadedIssue.title}</h1>
            {loadedIssue.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{loadedIssue.description}</p>
            )}
          </>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs text-muted-foreground">
          {loadedIssue.points && <span>{loadedIssue.points} pts</span>}
          {loadedIssue.sprint && <span>Sprint: {loadedIssue.sprint}</span>}
          {loadedIssue.labels?.length > 0 && (
            <span className="flex gap-1">
              {loadedIssue.labels.map((l) => (
                <Badge key={l} variant="outline" className="text-xs">
                  {l}
                </Badge>
              ))}
            </span>
          )}
          <span>Created: {new Date(loadedIssue.created_at).toLocaleDateString()}</span>
        </div>

        {/* Epic children link */}
        {loadedIssue.type === 'epic' && children.length > 0 && (
          <Link
            to="/epics/$id"
            params={{ id: loadedIssue.id }}
            className="inline-flex items-center gap-1.5 text-xs text-purple-400/80 hover:text-purple-400 transition-colors mt-3"
          >
            <Mountain className="size-3" />
            {children.length} subtask{children.length !== 1 ? 's' : ''} — View epic board →
          </Link>
        )}

        {/* Transitions */}
        {transitions.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="flex gap-1 flex-wrap">
              {transitions.map((t) => (
                <Button
                  key={t.actions.join('-')}
                  variant="ghost"
                  size="sm"
                  className={cn('gap-1.5', t.className)}
                  onClick={() => transitionMut.mutate({ actions: t.actions })}
                  disabled={transitionMut.isPending}
                >
                  <t.icon className="size-3.5" />
                  {t.label}
                </Button>
              ))}
              {transitionMut.error && (
                <span className="text-xs text-destructive self-center">
                  {getSafeErrorMessage(transitionMut.error)}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Dependencies */}
      {(dependencies.length > 0 || blocked_by.length > 0) && (
        <div className="rounded-lg border border-border/60 bg-card p-4 mb-4">
          <h3 className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest mb-2">
            Dependencies
          </h3>
          {dependencies.length > 0 && (
            <div className="mb-2">
              <span className="text-xs text-muted-foreground">Depends on: </span>
              {dependencies.map((d) => (
                <Link
                  key={d.dep_id}
                  to="/issues/$id"
                  params={{ id: d.depends_on_id }}
                  className="text-xs text-primary hover:underline mr-2"
                >
                  {d.depends_on_id}
                </Link>
              ))}
            </div>
          )}
          {blocked_by.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Blocks: </span>
              {blocked_by.map((d) => (
                <Link
                  key={d.dep_id}
                  to="/issues/$id"
                  params={{ id: d.issue_id }}
                  className="text-xs text-primary hover:underline mr-2"
                >
                  {d.issue_id}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity log */}
      {logs.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card p-4 mb-4">
          <h3 className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest mb-3">
            Activity
          </h3>
          <div className="space-y-2">
            {logs.map((log) => {
              const { icon: Icon, className: iconClass } = getActivityIcon(log.message)
              return (
                <div key={log.id} className="flex items-start gap-2 text-xs">
                  <span className="text-muted-foreground/60 shrink-0 tabular-nums">
                    {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Icon className={`size-3.5 shrink-0 mt-px ${iconClass}`} />
                  <span>{log.message}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="rounded-lg border border-border/60 bg-card p-4">
        <h3 className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest mb-3">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
        {comments.length > 0 && (
          <div className="space-y-3 mb-4">
            {comments.map((c) => (
              <div key={c.id} className="bg-muted rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{c.text}</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && commentText.trim()) commentMut.mutate()
            }}
            className="flex-1"
          />
          <Button
            onClick={() => commentMut.mutate()}
            disabled={!commentText.trim() || commentMut.isPending}
            size="sm"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
