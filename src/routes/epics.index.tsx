import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchIssues, type Issue } from '~/lib/api'
import { statuses, priorities } from '~/components/tasks/data'
import { Mountain, Plus, ChevronRight } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { CreateEpicDrawer } from '~/components/CreateEpicDrawer'

export const Route = createFileRoute('/epics/')({
  component: EpicsPage,
})

function EpicsPage() {
  const [showCreate, setShowCreate] = useState(false)

  const epicsQuery = useQuery({
    queryKey: ['issues', 'epics'],
    queryFn: () => fetchIssues({ type: 'epic', limit: 100 }),
  })

  // Fetch all issues to compute child counts client-side
  const allIssuesQuery = useQuery({
    queryKey: ['issues', 'all-for-epics'],
    queryFn: () => fetchIssues({ limit: 500 }),
  })

  const epics = epicsQuery.data?.issues ?? []
  const allIssues = allIssuesQuery.data?.issues ?? []

  // Build child stats per epic
  const epicStats = new Map<string, { total: number; closed: number; inProgress: number }>()
  for (const epic of epics) {
    epicStats.set(epic.id, { total: 0, closed: 0, inProgress: 0 })
  }
  for (const issue of allIssues) {
    if (issue.parent_id && epicStats.has(issue.parent_id)) {
      const stats = epicStats.get(issue.parent_id)!
      stats.total++
      if (issue.status === 'closed') stats.closed++
      if (issue.status === 'in_progress' || issue.status === 'in_review') stats.inProgress++
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Epics</h1>
          <p className="text-sm text-muted-foreground">
            Large initiatives broken into subtasks
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="size-3.5 mr-1.5" />
          Create Epic
        </Button>
      </div>

      {epicsQuery.isLoading ? (
        <div className="text-sm text-muted-foreground py-12 text-center">Loading epics...</div>
      ) : epics.length === 0 ? (
        <div className="text-sm text-muted-foreground py-12 text-center">
          No epics yet. Create one to organize related tasks.
        </div>
      ) : (
        <div className="grid gap-3">
          {epics.map((epic) => (
            <EpicCard
              key={epic.id}
              epic={epic}
              stats={epicStats.get(epic.id) ?? { total: 0, closed: 0, inProgress: 0 }}
            />
          ))}
        </div>
      )}

      {showCreate && <CreateEpicDrawer onClose={() => setShowCreate(false)} />}
    </div>
  )
}

function EpicCard({
  epic,
  stats,
}: {
  epic: Issue
  stats: { total: number; closed: number; inProgress: number }
}) {
  const status = statuses.find((s) => s.value === epic.status)
  const priority = priorities.find((p) => p.value === epic.priority.toLowerCase())
  const progress = stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0

  return (
    <Link
      to="/epics/$id"
      params={{ id: epic.id }}
      className="group flex items-center gap-4 rounded-lg border border-border/50 bg-card p-4 hover:border-border hover:bg-card/80 transition-colors"
    >
      <div className="shrink-0">
        <div className="flex items-center justify-center size-10 rounded-lg bg-purple-500/10">
          <Mountain className="size-5 text-purple-400" />
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{epic.title}</span>
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

        {epic.description && (
          <p className="text-xs text-muted-foreground/70 line-clamp-1">{epic.description}</p>
        )}

        <div className="flex items-center gap-3">
          {stats.total > 0 ? (
            <>
              <div className="flex-1 max-w-48 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500/70 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {stats.closed}/{stats.total} done
              </span>
              {stats.inProgress > 0 && (
                <span className="text-[11px] text-amber-500/80 tabular-nums">
                  {stats.inProgress} active
                </span>
              )}
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground/50">No subtasks</span>
          )}
        </div>
      </div>

      <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
    </Link>
  )
}
