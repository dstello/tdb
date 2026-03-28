import { Issue } from '~/lib/api'

const priorityConfig: Record<string, { label: string; class: string }> = {
  P0: { label: 'P0', class: 'bg-red-500/20 text-red-400 border-red-500/30' },
  P1: { label: 'P1', class: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  P2: { label: 'P2', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  P3: { label: 'P3', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  P4: { label: 'P4', class: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] ?? priorityConfig.P2
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${config.class}`}>
      {config.label}
    </span>
  )
}

const statusConfig: Record<string, { label: string; class: string }> = {
  open: { label: 'Open', class: 'bg-emerald-500/20 text-emerald-400' },
  in_progress: { label: 'In Progress', class: 'bg-blue-500/20 text-blue-400' },
  in_review: { label: 'In Review', class: 'bg-purple-500/20 text-purple-400' },
  blocked: { label: 'Blocked', class: 'bg-red-500/20 text-red-400' },
  closed: { label: 'Closed', class: 'bg-zinc-500/20 text-zinc-400' },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, class: 'bg-zinc-500/20 text-zinc-400' }
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.class}`}>
      {config.label}
    </span>
  )
}

const typeIcons: Record<string, string> = {
  bug: '🐛',
  feature: '✨',
  task: '📋',
  epic: '🏔️',
  chore: '🔧',
}

export function TypeIcon({ type }: { type: string }) {
  return <span className="text-xs">{typeIcons[type] ?? '📋'}</span>
}

export function IssueCard({ issue }: { issue: Issue }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <TypeIcon type={issue.type} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-200 truncate">{issue.title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <PriorityBadge priority={issue.priority} />
          <span className="text-[10px] text-zinc-500 font-mono">{issue.id}</span>
          {issue.labels?.map((l) => (
            <span
              key={l}
              className="text-[10px] text-zinc-500 bg-zinc-800 px-1 py-0.5 rounded"
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
