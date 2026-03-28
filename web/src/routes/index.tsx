import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchMonitor, fetchStats, type Issue } from '~/lib/api'
import { IssueCard, StatusBadge } from '~/components/IssueCard'
import { CreateIssueDialog } from '~/components/CreateIssueDialog'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  const [search, setSearch] = useState('')
  const [showClosed, setShowClosed] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const monitor = useQuery({
    queryKey: ['monitor', search, showClosed],
    queryFn: () =>
      fetchMonitor({
        search: search || undefined,
        include_closed: showClosed,
      }),
    refetchInterval: 30_000,
  })

  const stats = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 60_000,
  })

  const taskList = monitor.data?.monitor.task_list

  const columns: { key: string; label: string; issues: Issue[] }[] = taskList
    ? [
        { key: 'ready', label: 'Ready', issues: taskList.ready },
        { key: 'in_progress', label: 'In Progress', issues: taskList.in_progress },
        { key: 'in_review', label: 'In Review', issues: [...taskList.pending_review, ...taskList.reviewable] },
        { key: 'needs_rework', label: 'Needs Rework', issues: taskList.needs_rework },
        { key: 'blocked', label: 'Blocked', issues: taskList.blocked },
        ...(showClosed
          ? [{ key: 'closed', label: 'Closed', issues: taskList.closed }]
          : []),
      ]
    : []

  return (
    <div>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Board</h1>
          {stats.data && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>{stats.data.total} issues</span>
              <span>·</span>
              <span>{Math.round(stats.data.completion_rate * 100)}% done</span>
              {stats.data.created_today > 0 && (
                <>
                  <span>·</span>
                  <span>+{stats.data.created_today} today</span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showClosed}
              onChange={(e) => setShowClosed(e.target.checked)}
              className="rounded border-zinc-600"
            />
            Closed
          </label>
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            + New
          </button>
        </div>
      </div>

      {/* Focused issue */}
      {monitor.data?.monitor.focused_issue && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-medium mb-1">
            🎯 Focused
          </div>
          <Link
            to="/issues/$id"
            params={{ id: monitor.data.monitor.focused_issue.id }}
            className="hover:bg-zinc-800/50 transition-colors block rounded"
          >
            <IssueCard issue={monitor.data.monitor.focused_issue} />
          </Link>
        </div>
      )}

      {/* Loading / Error */}
      {monitor.isLoading && (
        <div className="text-zinc-500 text-sm py-12 text-center">Loading...</div>
      )}
      {monitor.error && (
        <div className="text-red-400 text-sm py-12 text-center">
          Failed to load: {monitor.error instanceof Error ? monitor.error.message : 'Unknown error'}
          <br />
          <span className="text-zinc-500">Is `td serve` running?</span>
        </div>
      )}

      {/* Kanban columns */}
      {taskList && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(220px, 1fr))` }}>
          {columns.map((col) => (
            <div key={col.key} className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3 min-h-[200px]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {col.label}
                </h2>
                <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full">
                  {col.issues.length}
                </span>
              </div>
              <div className="space-y-2">
                {col.issues.map((issue) => (
                  <Link
                    key={issue.id}
                    to="/issues/$id"
                    params={{ id: issue.id }}
                    className="block p-2.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-lg transition-all cursor-pointer"
                  >
                    <IssueCard issue={issue} />
                  </Link>
                ))}
                {col.issues.length === 0 && (
                  <p className="text-xs text-zinc-600 text-center py-6">No issues</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateIssueDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
