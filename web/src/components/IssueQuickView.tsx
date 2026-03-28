import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchIssue,
  transitionIssue,
  addComment,
  deleteIssue,
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
import { ExternalLink, X } from 'lucide-react'

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

  const issue = data?.issue
  const transitions = issue ? (transitionMap[issue.status] ?? []) : []
  const status = issue ? statuses.find((s) => s.value === issue.status) : null
  const issueType = issue ? types.find((t) => t.value === issue.type) : null
  const priority = issue ? priorities.find((p) => p.value === issue.priority) : null

  return (
    <Drawer open direction="right" modal={false} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="sm:max-w-md overflow-y-auto">
        <DrawerHeader className="flex flex-row items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <DrawerTitle className="truncate">
              {isLoading ? 'Loading...' : issue?.title ?? 'Issue'}
            </DrawerTitle>
            <DrawerDescription className="font-mono text-xs">
              {issueId.slice(0, 8)}
            </DrawerDescription>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="size-8" asChild>
              <Link to="/issues/$id" params={{ id: issueId }}>
                <ExternalLink className="size-4" />
                <span className="sr-only">Full page</span>
              </Link>
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <X className="size-4" />
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
                <Badge variant="outline" className="gap-1">
                  <issueType.icon className="size-3" />
                  {issueType.label}
                </Badge>
              )}
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
              {issue.due_date && <span>Due: {issue.due_date}</span>}
              {issue.labels?.length > 0 &&
                issue.labels.map((l) => (
                  <Badge key={l} variant="outline" className="text-xs">
                    {l}
                  </Badge>
                ))}
              <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
            </div>

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
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
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
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Activity
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {data.logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 text-xs">
                        <span className="text-muted-foreground shrink-0">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1">
                          {log.entry_type}
                        </Badge>
                        <span className="truncate">{log.summary}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Comments */}
            <Separator />
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
