import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchIssue,
  transitionIssue,
  addComment,
  deleteIssue,
  updateIssue,
} from '~/lib/api'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '~/components/ui/drawer'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Separator } from '~/components/ui/separator'
import { statuses, types, priorities } from '~/components/tasks/data'
import { ExternalLink, X, CalendarClock, CalendarCheck, AlertCircle } from 'lucide-react'

const transitionMap: Record<string, { action: string; label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }[]> = {
  open: [
    { action: 'start', label: 'Start', variant: 'default' },
    { action: 'review', label: 'Review', variant: 'secondary' },
    { action: 'block', label: 'Block', variant: 'destructive' },
    { action: 'close', label: 'Close', variant: 'outline' },
  ],
  in_progress: [
    { action: 'review', label: 'Review', variant: 'default' },
    { action: 'block', label: 'Block', variant: 'destructive' },
    { action: 'close', label: 'Close', variant: 'outline' },
  ],
  in_review: [
    { action: 'approve', label: 'Approve', variant: 'default' },
    { action: 'reject', label: 'Reject', variant: 'destructive' },
    { action: 'close', label: 'Close', variant: 'outline' },
  ],
  blocked: [
    { action: 'unblock', label: 'Unblock', variant: 'default' },
    { action: 'close', label: 'Close', variant: 'outline' },
  ],
  closed: [
    { action: 'reopen', label: 'Reopen', variant: 'default' },
  ],
}

interface IssueQuickViewProps {
  issueId: string
  onClose: () => void
}

export function IssueQuickView({ issueId, onClose }: IssueQuickViewProps) {
  const queryClient = useQueryClient()
  const [commentText, setCommentText] = useState('')
  const [editingDefer, setEditingDefer] = useState(false)
  const [editingDue, setEditingDue] = useState(false)
  const [deferValue, setDeferValue] = useState('')
  const [dueValue, setDueValue] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => fetchIssue(issueId),
  })

  const transitionMut = useMutation({
    mutationFn: ({ action }: { action: string }) =>
      transitionIssue(issueId, action as any),
    onSuccess: () => queryClient.invalidateQueries(),
  })

  const commentMut = useMutation({
    mutationFn: () => addComment(issueId, commentText),
    onSuccess: () => {
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] })
    },
  })

  const deleteMut = useMutation({
    mutationFn: () => deleteIssue(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries()
      onClose()
    },
  })

  const deferMut = useMutation({
    mutationFn: (date: string | null) =>
      updateIssue(issueId, { defer_until: date === '' ? null : date }),
    onSuccess: () => {
      setEditingDefer(false)
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] })
      queryClient.invalidateQueries({ queryKey: ['board'] })
    },
  })

  const dueMut = useMutation({
    mutationFn: (date: string | null) =>
      updateIssue(issueId, { due_date: date === '' ? null : date }),
    onSuccess: () => {
      setEditingDue(false)
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] })
      queryClient.invalidateQueries({ queryKey: ['board'] })
    },
  })

  const issue = data?.issue
  const transitions = issue ? (transitionMap[issue.status] ?? []) : []
  const status = issue ? statuses.find((s) => s.value === issue.status) : null
  const issueType = issue ? types.find((t) => t.value === issue.type) : null
  const priority = issue ? priorities.find((p) => p.value === issue.priority) : null

  return (
    <Drawer open direction="right" modal={false} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="sm:max-w-md overflow-y-auto border-l border-border/60">
        <DrawerHeader className="flex flex-row items-start justify-between gap-2 pb-3">
          <div className="flex flex-col gap-1 min-w-0">
            <DrawerTitle className="truncate text-[15px] font-medium">
              {isLoading ? 'Loading...' : issue?.title ?? 'Issue'}
            </DrawerTitle>
            <DrawerDescription className="font-mono text-[11px]">
              {issueId.slice(0, 8)}
            </DrawerDescription>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground" asChild>
              <Link to="/issues/$id" params={{ id: issueId }}>
                <ExternalLink className="size-3.5" />
                <span className="sr-only">Full page</span>
              </Link>
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {isLoading && (
          <div className="text-muted-foreground text-sm text-center py-8">Loading...</div>
        )}

        {error && (
          <div className="text-destructive text-sm text-center py-8">
            {error instanceof Error ? error.message : 'Failed to load'}
          </div>
        )}

        {issue && (
          <div className="flex flex-col gap-4 px-4 pb-4">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {issueType && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <issueType.icon className="size-3.5" />
                  {issueType.label}
                </span>
              )}
              {status && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                  <status.icon className="size-3" />
                  {status.label}
                </span>
              )}
              {priority && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${priority.className}`}>
                  <priority.icon className="size-3" />
                  {priority.label}
                </span>
              )}
            </div>

            {/* Description */}
            {issue.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {issue.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {issue.points != null && <span>{issue.points} pts</span>}
              {issue.sprint && <span>Sprint: {issue.sprint}</span>}
              {issue.labels?.length > 0 &&
                issue.labels.map((l) => (
                  <Badge key={l} variant="outline" className="text-xs">
                    {l}
                  </Badge>
                ))}
              <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
            </div>

            {/* Deferral & Due Dates */}
            <DeferralSection
              issue={issue}
              editingDefer={editingDefer}
              editingDue={editingDue}
              deferValue={deferValue}
              dueValue={dueValue}
              onEditDefer={() => { setEditingDefer(true); setDeferValue(issue.defer_until ?? '') }}
              onEditDue={() => { setEditingDue(true); setDueValue(issue.due_date ?? '') }}
              onDeferChange={setDeferValue}
              onDueChange={setDueValue}
              onDeferSave={() => deferMut.mutate(deferValue || null)}
              onDueSave={() => dueMut.mutate(dueValue || null)}
              onDeferClear={() => deferMut.mutate(null)}
              onDueClear={() => dueMut.mutate(null)}
              onDeferCancel={() => setEditingDefer(false)}
              onDueCancel={() => setEditingDue(false)}
              isSaving={deferMut.isPending || dueMut.isPending}
            />

            {/* Transitions */}
            {transitions.length > 0 && (
              <>
                <Separator />
                <div className="flex gap-2 flex-wrap">
                  {transitions.map((t) => (
                    <Button
                      key={t.action}
                      variant={t.variant}
                      size="sm"
                      onClick={() => transitionMut.mutate({ action: t.action })}
                      disabled={transitionMut.isPending}
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
              </>
            )}

            {/* Dependencies */}
            {data && (data.dependencies.length > 0 || data.blocked_by.length > 0) && (
              <>
                <Separator />
                <div>
                  <h4 className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest mb-1">
                    Dependencies
                  </h4>
                  {data.dependencies.length > 0 && (
                    <div className="text-xs mb-1">
                      <span className="text-muted-foreground">Depends on: </span>
                      {data.dependencies.map((d) => (
                        <span
                          key={d.dep_id}
                          className="text-primary cursor-pointer hover:underline mr-2"
                        >
                          {d.depends_on_id.slice(0, 8)}
                        </span>
                      ))}
                    </div>
                  )}
                  {data.blocked_by.length > 0 && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Blocks: </span>
                      {data.blocked_by.map((d) => (
                        <span
                          key={d.dep_id}
                          className="text-primary cursor-pointer hover:underline mr-2"
                        >
                          {d.issue_id.slice(0, 8)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Activity */}
            {data && data.logs.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest mb-2">
                    Activity
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {data.logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 text-xs">
                        <span className="text-muted-foreground shrink-0">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1">
                          {log.type}
                        </Badge>
                        <span className="truncate">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Comments */}
            <Separator />
            <div>
              <h4 className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest mb-2">
                Comments {data && data.comments.length > 0 && `(${data.comments.length})`}
              </h4>
              {data && data.comments.length > 0 && (
                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                  {data.comments.map((c) => (
                    <div key={c.id} className="bg-muted rounded-md p-2">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(c.created_at).toLocaleString()}
                      </span>
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
                  size="sm"
                  onClick={() => commentMut.mutate()}
                  disabled={!commentText.trim() || commentMut.isPending}
                >
                  Send
                </Button>
              </div>
            </div>

            {/* Delete */}
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive w-fit"
              onClick={() => {
                if (confirm('Delete this issue?')) deleteMut.mutate()
              }}
            >
              Delete issue
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}

// --- Deferral & Due Date Section ---

interface DeferralSectionProps {
  issue: { defer_until: string | null; due_date: string | null }
  editingDefer: boolean
  editingDue: boolean
  deferValue: string
  dueValue: string
  onEditDefer: () => void
  onEditDue: () => void
  onDeferChange: (v: string) => void
  onDueChange: (v: string) => void
  onDeferSave: () => void
  onDueSave: () => void
  onDeferClear: () => void
  onDueClear: () => void
  onDeferCancel: () => void
  onDueCancel: () => void
  isSaving: boolean
}

function DeferralSection({
  issue,
  editingDefer,
  editingDue,
  deferValue,
  dueValue,
  onEditDefer,
  onEditDue,
  onDeferChange,
  onDueChange,
  onDeferSave,
  onDueSave,
  onDeferClear,
  onDueClear,
  onDeferCancel,
  onDueCancel,
  isSaving,
}: DeferralSectionProps) {
  const now = new Date()
  const deferUntil = issue.defer_until ? new Date(issue.defer_until) : null
  const dueDate = issue.due_date ? new Date(issue.due_date) : null
  const isDeferred = deferUntil && deferUntil > now
  const isOverdue = dueDate && dueDate < now
  const isDueSoon = dueDate && !isOverdue && dueDate.getTime() - now.getTime() < 3 * 86400000

  return (
    <div className="flex flex-col gap-2">
      {/* Defer */}
      <div className="flex items-center gap-2 text-xs">
        <CalendarClock className="size-3.5 text-muted-foreground shrink-0" />
        {editingDefer ? (
          <div className="flex items-center gap-1.5 flex-1">
            <Input
              type="date"
              value={deferValue}
              onChange={(e) => onDeferChange(e.target.value)}
              className="h-6 text-xs flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onDeferSave()
                if (e.key === 'Escape') onDeferCancel()
              }}
            />
            <Button size="xs" onClick={onDeferSave} disabled={isSaving}>
              Save
            </Button>
            <Button size="xs" variant="ghost" onClick={onDeferCancel}>
              ✕
            </Button>
          </div>
        ) : (
          <span className="flex items-center gap-1.5">
            {isDeferred ? (
              <span className="text-muted-foreground">
                Deferred until {deferUntil.toLocaleDateString()}
              </span>
            ) : issue.defer_until ? (
              <span className="text-muted-foreground">
                Was deferred until {new Date(issue.defer_until).toLocaleDateString()}
              </span>
            ) : (
              <span className="text-muted-foreground/60">No deferral</span>
            )}
            <Button size="xs" variant="ghost" className="h-4 px-1 text-[10px]" onClick={onEditDefer}>
              {issue.defer_until ? 'Edit' : 'Set'}
            </Button>
            {issue.defer_until && (
              <Button size="xs" variant="ghost" className="h-4 px-1 text-[10px] text-destructive" onClick={onDeferClear} disabled={isSaving}>
                Clear
              </Button>
            )}
          </span>
        )}
      </div>

      {/* Due */}
      <div className="flex items-center gap-2 text-xs">
        {isOverdue ? (
          <AlertCircle className="size-3.5 text-destructive shrink-0" />
        ) : (
          <CalendarCheck className={`size-3.5 shrink-0 ${isDueSoon ? 'text-amber-500' : 'text-muted-foreground'}`} />
        )}
        {editingDue ? (
          <div className="flex items-center gap-1.5 flex-1">
            <Input
              type="date"
              value={dueValue}
              onChange={(e) => onDueChange(e.target.value)}
              className="h-6 text-xs flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onDueSave()
                if (e.key === 'Escape') onDueCancel()
              }}
            />
            <Button size="xs" onClick={onDueSave} disabled={isSaving}>
              Save
            </Button>
            <Button size="xs" variant="ghost" onClick={onDueCancel}>
              ✕
            </Button>
          </div>
        ) : (
          <span className="flex items-center gap-1.5">
            {dueDate ? (
              <span className={
                isOverdue
                  ? 'text-destructive font-medium'
                  : isDueSoon
                    ? 'text-amber-500 font-medium'
                    : 'text-muted-foreground'
              }>
                Due {dueDate.toLocaleDateString()}
                {isOverdue && ' (overdue)'}
                {isDueSoon && ' (due soon)'}
              </span>
            ) : (
              <span className="text-muted-foreground/60">No due date</span>
            )}
            <Button size="xs" variant="ghost" className="h-4 px-1 text-[10px]" onClick={onEditDue}>
              {issue.due_date ? 'Edit' : 'Set'}
            </Button>
            {issue.due_date && (
              <Button size="xs" variant="ghost" className="h-4 px-1 text-[10px] text-destructive" onClick={onDueClear} disabled={isSaving}>
                Clear
              </Button>
            )}
          </span>
        )}
      </div>
    </div>
  )
}
