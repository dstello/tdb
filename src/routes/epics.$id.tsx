import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchIssue,
  fetchIssues,
  transitionIssue,
  type Issue,
} from '~/lib/api'
import { statuses, priorities } from '~/components/tasks/data'
import { columns, type IssueTableMeta } from '~/components/tasks/columns'
import { DataTable } from '~/components/tasks/data-table'
import { SwimlaneBoardView } from '~/components/tasks/swimlane-board'
import { IssueQuickView } from '~/components/IssueQuickView'
import { CreateIssueDrawer } from '~/components/CreateIssueDialog'
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
} from 'lucide-react'
import { cn } from '~/lib/utils'
import { ViewToggle, type ViewMode } from '~/components/tasks/view-toggle'

export const Route = createFileRoute('/epics/$id')({
  component: EpicDetailPage,
})

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
  const [viewMode, setViewMode] = useState<ViewMode>('board')

  const epicQuery = useQuery({
    queryKey: ['issue', id],
    queryFn: () => fetchIssue(id),
  })

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

  const totalChildren = children.length
  const closedChildren = children.filter((c) => c.status === 'closed').length
  const progress = totalChildren > 0 ? Math.round((closedChildren / totalChildren) * 100) : 0

  const filteredChildren = showClosed
    ? children
    : children.filter((c) => c.status !== 'closed')

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

  const tableMeta: IssueTableMeta = {
    onIssueClick: (issueId) => setSelectedIssueId(issueId),
    showClosed,
    onToggleClosed: () => setShowClosed((prev) => !prev),
    showCreate,
    onShowCreate: () => setShowCreate(true),
    onCloseCreate: () => setShowCreate(false),
  }

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

      {/* Subtasks header with view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Subtasks</h2>
          {totalChildren > 0 && viewMode === 'board' && (
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
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          <Button size="sm" variant="secondary" onClick={() => setShowCreate(true)}>
            <Plus className="size-3.5 mr-1" />
            Add Subtask
          </Button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'board' ? (
        <SwimlaneBoardView
          issues={children}
          onIssueClick={(issueId) => setSelectedIssueId(issueId)}
          showClosed={showClosed}
          isLoading={childrenQuery.isLoading}
          emptyMessage="No subtasks yet. Add one to get started."
        />
      ) : (
        <DataTable data={filteredChildren} columns={columns} meta={tableMeta} />
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
