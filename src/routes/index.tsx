import { useState, useEffect, useCallback } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMonitor, fetchStats, deleteIssue, type Issue } from '~/lib/api'
import { columns, type IssueTableMeta } from '~/components/tasks/columns'
import { DataTable } from '~/components/tasks/data-table'
import { IssueQuickView } from '~/components/IssueQuickView'
import { CreateIssueDrawer } from '~/components/CreateIssueDialog'

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
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)
  const [showClosed, setShowClosed] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1)

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

  const allIssues = collectIssues(monitor.data)
  const issues = showClosed ? allIssues : allIssues.filter((i) => i.status !== 'closed')

  const getFocusedIssue = useCallback((): Issue | null => {
    if (focusedRowIndex < 0 || focusedRowIndex >= issues.length) return null
    return issues[focusedRowIndex]
  }, [focusedRowIndex, issues])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' || target.isContentEditable

      // Cmd+Enter or Ctrl+Enter: handled by CreateIssueDrawer
      if (isInput) return

      // Escape: close quick view or create drawer
      if (e.key === 'Escape') {
        if (selectedIssueId) { setSelectedIssueId(null); return }
        if (showCreate) { setShowCreate(false); return }
        return
      }

      // n: new issue
      if (e.key === 'n') {
        e.preventDefault()
        setShowCreate(true)
        return
      }

      // j / ArrowDown: move focus down
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedRowIndex((prev) => Math.min(prev + 1, issues.length - 1))
        return
      }

      // k / ArrowUp: move focus up
      if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedRowIndex((prev) => Math.max(prev - 1, 0))
        return
      }

      // Enter / e: open focused issue
      if (e.key === 'Enter' || e.key === 'e') {
        const issue = getFocusedIssue()
        if (issue) {
          e.preventDefault()
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            navigate({ to: '/issues/$id', params: { id: issue.id } })
          } else {
            setSelectedIssueId(issue.id)
          }
        }
        return
      }

      // d: delete focused issue
      if (e.key === 'd') {
        const issue = getFocusedIssue()
        if (issue) {
          e.preventDefault()
          if (confirm(`Delete "${issue.title}"?`)) {
            deleteIssue(issue.id).then(() => {
              queryClient.invalidateQueries({ queryKey: ['monitor'] })
              queryClient.invalidateQueries({ queryKey: ['stats'] })
              setFocusedRowIndex((prev) => Math.max(prev - 1, 0))
            })
          }
        }
        return
      }

      // /: focus search
      if (e.key === '/') {
        e.preventDefault()
        const input = document.querySelector<HTMLInputElement>('[placeholder="Filter issues..."]')
        input?.focus()
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [issues, focusedRowIndex, selectedIssueId, showCreate, getFocusedIssue, navigate, queryClient])

  const tableMeta: IssueTableMeta = {
    onIssueClick: (issueId) => setSelectedIssueId(issueId),
    showClosed,
    onToggleClosed: () => setShowClosed((prev) => !prev),
    showCreate,
    onShowCreate: () => setShowCreate(true),
    onCloseCreate: () => setShowCreate(false),
    focusedRowIndex,
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-medium tracking-tight">Issues</h2>
        <div className="flex items-center gap-4">
          {stats.data && (
            <p className="text-muted-foreground text-xs font-mono tabular-nums">
              {stats.data.total} total · {Math.round(stats.data.completion_rate * 100)}% done{stats.data.created_today > 0 ? ` · +${stats.data.created_today} today` : ''}
            </p>
          )}
          <span className="text-muted-foreground/40 text-[10px] hidden sm:inline">
            <kbd className="rounded border border-border/60 px-1 py-0.5 font-mono">n</kbd> new
            {' · '}
            <kbd className="rounded border border-border/60 px-1 py-0.5 font-mono">j</kbd><kbd className="rounded border border-border/60 px-1 py-0.5 font-mono">k</kbd> nav
            {' · '}
            <kbd className="rounded border border-border/60 px-1 py-0.5 font-mono">e</kbd> open
            {' · '}
            <kbd className="rounded border border-border/60 px-1 py-0.5 font-mono">/</kbd> search
          </span>
        </div>
      </div>

      {monitor.error && (
        <div className="text-destructive text-sm py-12 text-center">
          Failed to load: {monitor.error instanceof Error ? monitor.error.message : 'Unknown error'}
          <br />
          <span className="text-muted-foreground">Is `td serve` running?</span>
        </div>
      )}

      <DataTable data={issues} columns={columns} meta={tableMeta} />

      {selectedIssueId && (
        <IssueQuickView
          issueId={selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
        />
      )}
    </div>
  )
}
