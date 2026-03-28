import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchMonitor, fetchStats, type Issue } from '~/lib/api'
import { columns } from '~/components/tasks/columns'
import { DataTable } from '~/components/tasks/data-table'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function collectIssues(data: ReturnType<typeof useQuery<Awaited<ReturnType<typeof fetchMonitor>>>>['data']): Issue[] {
  if (!data) return []
  const map = new Map<string, Issue>()
  const add = (issue: Issue | null) => {
    if (issue && !map.has(issue.id)) map.set(issue.id, issue)
  }

  add(data.monitor.focused_issue)
  data.monitor.in_progress.forEach(add)
  const tl = data.monitor.task_list
  tl.ready.forEach(add)
  tl.in_progress.forEach(add)
  tl.reviewable.forEach(add)
  tl.needs_rework.forEach(add)
  tl.pending_review.forEach(add)
  tl.blocked.forEach(add)
  tl.closed.forEach(add)

  return Array.from(map.values())
}

function Dashboard() {
  const monitor = useQuery({
    queryKey: ['monitor', true],
    queryFn: () => fetchMonitor({ include_closed: true }),
    refetchInterval: 30_000,
  })

  const stats = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 60_000,
  })

  const issues = collectIssues(monitor.data)

  return (
    <div className="flex h-full flex-1 flex-col gap-8">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Issues</h2>
          <p className="text-muted-foreground text-sm">
            {stats.data
              ? `${stats.data.total} issues · ${Math.round(stats.data.completion_rate * 100)}% complete${stats.data.created_today > 0 ? ` · +${stats.data.created_today} today` : ''}`
              : 'Loading...'}
          </p>
        </div>
      </div>

      {monitor.error && (
        <div className="text-destructive text-sm py-12 text-center">
          Failed to load: {monitor.error instanceof Error ? monitor.error.message : 'Unknown error'}
          <br />
          <span className="text-muted-foreground">Is `td serve` running?</span>
        </div>
      )}

      <DataTable data={issues} columns={columns} />
    </div>
  )
}
