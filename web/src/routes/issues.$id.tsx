import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchIssue,
  transitionIssue,
  addComment,
  deleteIssue,
} from '~/lib/api'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Separator } from '~/components/ui/separator'
import { statuses, types, priorities } from '~/components/tasks/data'

export const Route = createFileRoute('/issues/$id')({
  component: IssueDetailPage,
})

const transitionMap: Record<string, { action: string; label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }[]> = {
  open: [
    { action: 'start', label: 'Start', variant: 'default' },
    { action: 'review', label: 'Submit for Review', variant: 'secondary' },
    { action: 'block', label: 'Block', variant: 'destructive' },
    { action: 'close', label: 'Close', variant: 'outline' },
  ],
  in_progress: [
    { action: 'review', label: 'Submit for Review', variant: 'default' },
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

function IssueDetailPage() {
  const { id } = Route.useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [commentText, setCommentText] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => fetchIssue(id),
  })

  const transitionMut = useMutation({
    mutationFn: ({ action }: { action: string }) =>
      transitionIssue(id, action as any),
    onSuccess: () => queryClient.invalidateQueries(),
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
      queryClient.invalidateQueries()
      router.navigate({ to: '/' })
    },
  })

  if (isLoading) return <div className="text-muted-foreground py-12 text-center">Loading...</div>
  if (error || !data)
    return (
      <div className="text-destructive py-12 text-center">
        Failed to load issue: {error instanceof Error ? error.message : 'Not found'}
      </div>
    )

  const { issue, logs, comments, dependencies, blocked_by } = data
  const transitions = transitionMap[issue.status] ?? []
  const status = statuses.find((s) => s.value === issue.status)
  const issueType = types.find((t) => t.value === issue.type)
  const priority = priorities.find((p) => p.value === issue.priority)

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block">
        ← Back to issues
      </Link>

      {/* Issue header */}
      <div className="rounded-lg border bg-card p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {issueType && (
              <Badge variant="outline" className="gap-1">
                <issueType.icon className="size-3" />
                {issueType.label}
              </Badge>
            )}
            <span className="text-xs font-mono text-muted-foreground">{issue.id}</span>
            {status && (
              <Badge variant="secondary" className="gap-1">
                <status.icon className="size-3" />
                {status.label}
              </Badge>
            )}
            {priority && (
              <Badge variant="secondary" className="gap-1">
                <priority.icon className="size-3" />
                {priority.label}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm('Delete this issue?')) deleteMut.mutate()
            }}
          >
            Delete
          </Button>
        </div>
        <h1 className="text-xl font-bold mb-2">{issue.title}</h1>
        {issue.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{issue.description}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs text-muted-foreground">
          {issue.points && <span>{issue.points} pts</span>}
          {issue.sprint && <span>Sprint: {issue.sprint}</span>}
          {issue.due_date && <span>Due: {issue.due_date}</span>}
          {issue.labels?.length > 0 && (
            <span className="flex gap-1">
              {issue.labels.map((l) => (
                <Badge key={l} variant="outline" className="text-xs">
                  {l}
                </Badge>
              ))}
            </span>
          )}
          <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
        </div>

        {/* Transitions */}
        {transitions.length > 0 && (
          <>
            <Separator className="my-4" />
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
              {transitionMut.error && (
                <span className="text-xs text-destructive self-center">
                  {transitionMut.error instanceof Error ? transitionMut.error.message : 'Failed'}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Dependencies */}
      {(dependencies.length > 0 || blocked_by.length > 0) && (
        <div className="rounded-lg border bg-card p-4 mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
        <div className="rounded-lg border bg-card p-4 mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Activity
          </h3>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 text-xs">
                <span className="text-muted-foreground shrink-0">
                  {new Date(log.created_at).toLocaleString()}
                </span>
                <Badge variant="outline" className="text-xs">
                  {log.entry_type}
                </Badge>
                <span>{log.summary}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
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
