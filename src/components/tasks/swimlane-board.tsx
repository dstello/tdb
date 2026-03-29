import { type Issue } from '~/lib/api'
import { statuses } from './data'
import { IssueCard } from './issue-card'
import { Check } from 'lucide-react'
import { cn } from '~/lib/utils'

const defaultColumns = [
  { status: 'open', label: 'Ready' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'in_review', label: 'In Review' },
  { status: 'blocked', label: 'Blocked' },
] as const

export interface SwimlaneBoardProps {
  issues: Issue[]
  onIssueClick: (issueId: string) => void
  showClosed?: boolean
  columns?: ReadonlyArray<{ status: string; label: string }>
  isLoading?: boolean
  emptyMessage?: string
}

export function SwimlaneBoardView({
  issues,
  onIssueClick,
  showClosed = false,
  columns = defaultColumns,
  isLoading = false,
  emptyMessage = 'No issues yet.',
}: SwimlaneBoardProps) {
  const closedIssues = issues.filter((i) => i.status === 'closed')

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Loading...</div>
  }

  if (issues.length === 0) {
    return <div className="text-sm text-muted-foreground/50 py-8 text-center">{emptyMessage}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 overflow-x-auto pb-2 flex-1 min-h-0">
        {columns.map((col) => {
          const colIssues = issues.filter((i) => i.status === col.status)
          const statusDef = statuses.find((s) => s.value === col.status)
          return (
            <div
              key={col.status}
              className="flex flex-col min-w-[240px] w-[280px] shrink-0 rounded-lg bg-muted/30 border border-border/40"
            >
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/30">
                {statusDef && (
                  <statusDef.icon className={`size-3.5 ${statusDef.iconClassName}`} />
                )}
                <span className="text-sm font-medium">{col.label}</span>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {colIssues.length}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 p-1.5 overflow-y-auto flex-1">
                {colIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onClick={() => onIssueClick(issue.id)}
                  />
                ))}
                {colIssues.length === 0 && (
                  <div className="text-muted-foreground/50 text-xs text-center py-6">
                    No issues
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showClosed && closedIssues.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <Check className="size-3 text-emerald-500" />
            <span className="text-[11px] font-medium text-muted-foreground">Closed</span>
            <span className="text-[10px] text-muted-foreground/50 tabular-nums">{closedIssues.length}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {closedIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={() => onIssueClick(issue.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
