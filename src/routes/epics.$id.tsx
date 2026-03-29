import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchIssue,
  fetchIssues,
  transitionIssue,
  type Issue,
} from '~/lib/api'
import { statuses, priorities, types } from '~/components/tasks/data'
import { IssueQuickView } from '~/components/IssueQuickView'
import { CreateIssueDrawer } from '~/components/CreateIssueDialog'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import {
  Mountain,
  Plus,
  ArrowLeft,
  Play,
  Eye,
  Check,
  RotateCcw,
  ShieldBan,
  XCircle,
  LockOpen,
  CalendarClock,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/epics/$id')({
  component: EpicDetailPage,
})

const swimlaneColumns = [
  { status: 'open', label: 'Ready' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'in_review', label: 'In Review' },
  { status: 'blocked', label: 'Blocked' },
] as const

const transitionMap: Record<string, { actions: string[]; label: string; icon: typeof Play; className: string }[]> = {
  open: [
    { actions: ['start'], label: 'Start', icon: Play, className: 'text-emerald-400 hover:bg-emerald-400/10' },
    { actions: ['close'], label: 'Close', icon: XCircle, className: 'text-muted-foreground hover:bg-muted-foreground/10' },
  ],
  in_progress: [
    { actions: ['review'], label: 'Review', icon: Eye, className: 'text-blue-400 hover:bg-blue-400/10' },
    { actions: ['close'], label: 'Close', icon: XCircle, className: 'text-muted-foreground hover:bg-muted-foreground/10' },
  ],
  in_review: [
    { actions: ['approve'], label: 'Approve', icon: Check, className: 'text-emerald-400 hover:bg-emerald-400/10' },
    { actions: ['reject'], label: 'Back to Ready', icon: RotateCcw, className: 'text-muted-foreground hover:bg-muted-foreground/10' },
  ],
  blocked: [
    { actions: ['unblock'], label: 'Unblock', icon: LockOpen, className: 'text-emerald-400 hover:bg-emerald-400/10' },
  ],
  closed: [
    { actions: ['reopen'], label: 'Reopen', icon: RotateCcw, className: 'text-blue-400 hover:bg-blue-400/10' },
  ],
}

function EpicDetailPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showClosed, setShowClosed] = useState(false)

  const epicQuery = useQuery({
    queryKey: ['issue', id],
    queryFn: () => fetchIssue(id),
  })

  // Fetch all issues and filter children client-side
  const childrenQuery = useQuery({
    queryKey: ['issues', 'children', id],
    queryFn: () => fetchIssues({ limit: 500 }),
    select: (data) => ({
      ...data,
      issues: data.issues.filter((i) => i.parent_id === id),
    }),
  })

  const epic = epicQuery.data?.issue
  const children = childrenQuery.data?.issues ?? []
  const status = epic ? statuses.find((s) => s.value === epic.status) : null
  const priority = epic ? priorities.find((p) => p.value === epic.priority.toLowerCase()) : null
  const transitions = epic ? (transitionMap[epic.status] ?? []) : []

  // Progress stats
  const totalChildren = children.length
  const closedChildren = children.filter((c) => c.status === 'closed').length
  const progress = totalChildren > 0 ? Math.round((closedChildren / totalChildren) * 100) : 0

  const transitionMut = useMutation({
    mutationFn: async ({ actions }: { actions: string[] }) => {
      let result
      for (const action of actions) {
        result = await transitionIssue(id, action as any)
      }
      return result
    },
    onSuccess: () => queryClient.invalidateQueries(),
  })

  if (epicQuery.isLoading) {
    return <div className="text-sm text-muted-foreground py-12 text-center">Loading epic...</div>
  }

  if (!epic) {
    return <div className="text-sm text-destructive py-12 text-center">Epic not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        to="/epics"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3" />
        All Epics
      </Link>

      {/* Epic header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-purple-500/10 shrink-0 mt-0.5">
            <Mountain className="size-5 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-medium">{epic.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-[11px] text-muted-foreground/50">{epic.id}</span>
              {status && (
                <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${status.className}`}>
                  <status.icon className="size-2.5" />
                  {status.label}
                </span>
              )}
              {priority && (
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${priority.iconClassName}`}>
                  <priority.icon className="size-2.5" />
                  {priority.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {epic.description && (
          <p className="text-sm text-muted-foreground/80 pl-[52px]">{epic.description}</p>
        )}

        {/* Transitions + Progress */}
        <div className="flex items-center gap-4 pl-[52px]">
          <div className="flex gap-1">
            {transitions.map((t) => (
              <Button
                key={t.actions.join('-')}
                variant="ghost"
                size="sm"
                className={cn("gap-1.5 h-7 text-xs", t.className)}
                onClick={() => transitionMut.mutate({ actions: t.actions })}
                disabled={transitionMut.isPending}
              >
                <t.icon className="size-3" />
                {t.label}
              </Button>
            ))}
          </div>

          {totalChildren > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-24 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500/70 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {closedChildren}/{totalChildren}
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Subtasks header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Subtasks</h2>
          {totalChildren > 0 && (
            <button
              onClick={() => setShowClosed(!showClosed)}
              className={cn(
                "text-[11px] transition-colors",
                showClosed ? "text-foreground" : "text-muted-foreground/50 hover:text-muted-foreground"
              )}
            >
              {showClosed ? 'Hide closed' : `+ ${closedChildren} closed`}
            </button>
          )}
        </div>
        <Button size="sm" variant="secondary" onClick={() => setShowCreate(true)}>
          <Plus className="size-3.5 mr-1" />
          Add Subtask
        </Button>
      </div>

      {/* Swimlane board */}
      {childrenQuery.isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Loading subtasks...</div>
      ) : children.length === 0 ? (
        <div className="text-sm text-muted-foreground/50 py-8 text-center">
          No subtasks yet. Add one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {swimlaneColumns.map((col) => {
            const colIssues = children.filter((c) => c.status === col.status)
            const statusDef = statuses.find((s) => s.value === col.status)
            return (
              <div key={col.status} className="space-y-2">
                <div className="flex items-center gap-1.5 px-1">
                  {statusDef && <statusDef.icon className={`size-3 ${statusDef.iconClassName}`} />}
                  <span className="text-[11px] font-medium text-muted-foreground">{col.label}</span>
                  {colIssues.length > 0 && (
                    <span className="text-[10px] text-muted-foreground/50 tabular-nums">{colIssues.length}</span>
                  )}
                </div>
                <div className="space-y-1.5 min-h-[80px]">
                  {colIssues.map((issue) => (
                    <SubtaskCard
                      key={issue.id}
                      issue={issue}
                      onClick={() => setSelectedIssueId(issue.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Closed issues (collapsible) */}
      {showClosed && closedChildren > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <Check className="size-3 text-emerald-500" />
            <span className="text-[11px] font-medium text-muted-foreground">Closed</span>
            <span className="text-[10px] text-muted-foreground/50 tabular-nums">{closedChildren}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {children.filter((c) => c.status === 'closed').map((issue) => (
              <SubtaskCard
                key={issue.id}
                issue={issue}
                onClick={() => setSelectedIssueId(issue.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick view drawer */}
      {selectedIssueId && (
        <IssueQuickView
          issueId={selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
        />
      )}

      {/* Create subtask drawer */}
      {showCreate && (
        <CreateIssueDrawer
          onClose={() => setShowCreate(false)}
          parentId={id}
          parentTitle={epic.title}
        />
      )}
    </div>
  )
}

function SubtaskCard({ issue, onClick }: { issue: Issue; onClick: () => void }) {
  const issueType = types.find((t) => t.value === issue.type)
  const priority = priorities.find((p) => p.value === issue.priority.toLowerCase())

  const now = new Date()
  const dueDate = issue.due_date ? new Date(issue.due_date) : null
  const deferUntil = issue.defer_until ? new Date(issue.defer_until) : null
  const isOverdue = dueDate && dueDate < now
  const isDueSoon = dueDate && !isOverdue && dueDate.getTime() - now.getTime() < 3 * 86400000
  const isDeferred = deferUntil && deferUntil > now

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1.5 rounded-md border border-border/50 p-2.5 text-left hover:border-border transition-colors cursor-pointer w-full",
        issue.status === 'closed' ? "bg-card/50 opacity-60" : "bg-card"
      )}
    >
      <div className="flex items-start gap-1.5">
        {issueType && (
          <issueType.icon className={`size-3.5 mt-0.5 shrink-0 ${issueType.iconClassName}`} />
        )}
        <span className={cn("text-sm leading-snug line-clamp-2", issue.status === 'closed' && "line-through")}>{issue.title}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="font-mono text-[10px] text-muted-foreground">{issue.id.slice(0, 10)}</span>
        {priority && (
          <span className={`inline-flex items-center gap-0.5 rounded px-1 py-px text-[10px] font-medium ${priority.className}`}>
            <priority.icon className="size-2.5" />
            {priority.label}
          </span>
        )}
        {issue.labels?.length > 0 && issue.labels.slice(0, 2).map((l) => (
          <Badge key={l} variant="outline" className="text-[9px] px-1 py-0 h-4">{l}</Badge>
        ))}
      </div>
      {(isDeferred || dueDate) && (
        <div className="flex items-center gap-2 mt-0.5">
          {isDeferred && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <CalendarClock className="size-2.5" /> Deferred
            </span>
          )}
          {dueDate && (
            <span className={`inline-flex items-center gap-0.5 text-[10px] ${
              isOverdue ? 'text-destructive font-medium' : isDueSoon ? 'text-amber-500 font-medium' : 'text-muted-foreground'
            }`}>
              {isOverdue ? <AlertCircle className="size-2.5" /> : <CalendarCheck className="size-2.5" />}
              {dueDate.toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </button>
  )
}
