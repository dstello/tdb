import { memo } from 'react'
import { type Issue, type TransitionAction } from '~/lib/api'
import { types, priorities } from './data'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { CopyableId } from '~/components/CopyableId'
import {
  CalendarClock,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Undo2,
} from 'lucide-react'
import { cn } from '~/lib/utils'

export const IssueCard = memo(function IssueCard({
  issue,
  onClick,
  onTransition,
}: {
  issue: Issue
  onClick: (id: string) => void
  onTransition?: (issueId: string, action: TransitionAction) => void
}) {
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
      onClick={() => onClick(issue.id)}
      className={cn(
        "flex flex-col gap-1.5 rounded-md border border-border/50 p-2.5 text-left hover:border-border transition-colors cursor-pointer w-full",
        issue.status === 'closed' ? "bg-card/50 opacity-60" : "bg-card"
      )}
    >
      <div className="flex items-start gap-1.5">
        {issueType && (
          <issueType.icon className={`size-3.5 mt-0.5 shrink-0 ${issueType.iconClassName}`} />
        )}
        <span className={cn("text-sm leading-snug line-clamp-2", issue.status === 'closed' && "line-through")}>
          {issue.title}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <CopyableId id={issue.id} truncate={10} className="text-[10px] text-muted-foreground" />
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
      {issue.status === 'in_review' && onTransition && (
        <div className="flex items-center gap-1 mt-1 pt-1.5 border-t border-border/30">
          <Button
            variant="ghost"
            size="xs"
            className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 flex-1"
            onClick={(e) => { e.stopPropagation(); onTransition(issue.id, 'approve') }}
          >
            <CheckCircle2 className="size-3" />
            Approve
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 flex-1"
            onClick={(e) => { e.stopPropagation(); onTransition(issue.id, 'block') }}
          >
            <ShieldAlert className="size-3" />
            Block
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 flex-1"
            onClick={(e) => { e.stopPropagation(); onTransition(issue.id, 'reject') }}
          >
            <Undo2 className="size-3" />
            Ready
          </Button>
        </div>
      )}
    </button>
  )
})
