import { LayoutGrid, List } from 'lucide-react'
import { cn } from '~/lib/utils'

export type ViewMode = 'board' | 'list'

export function ViewToggle({
  viewMode,
  onChange,
}: {
  viewMode: ViewMode
  onChange: (mode: ViewMode) => void
}) {
  return (
    <div className="flex items-center rounded-md border border-border/60 p-0.5">
      <button
        onClick={() => onChange('board')}
        className={cn(
          "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors",
          viewMode === 'board'
            ? "bg-foreground/10 text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="size-3.5" />
        Board
      </button>
      <button
        onClick={() => onChange('list')}
        className={cn(
          "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors",
          viewMode === 'list'
            ? "bg-foreground/10 text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="size-3.5" />
        List
      </button>
    </div>
  )
}
