import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchBoards,
  fetchBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  type Board,
  type BoardIssue,
} from '~/lib/api'
import { IssueQuickView } from '~/components/IssueQuickView'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Separator } from '~/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '~/components/ui/dialog'
import { statuses, types, priorities } from '~/components/tasks/data'
import {
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  CalendarClock,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react'

export const Route = createFileRoute('/boards')({
  component: BoardsPage,
})

const swimlaneColumns = [
  { status: 'open', label: 'Open' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'in_review', label: 'In Review' },
  { status: 'blocked', label: 'Blocked' },
  { status: 'closed', label: 'Closed' },
] as const

function BoardsPage() {
  const queryClient = useQueryClient()
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null)
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingBoard, setEditingBoard] = useState<Board | null>(null)
  const [showClosed, setShowClosed] = useState(false)

  const boardsQuery = useQuery({
    queryKey: ['boards'],
    queryFn: fetchBoards,
    refetchInterval: 30_000,
  })

  const boards = boardsQuery.data?.boards ?? []

  // Auto-select first board
  const selectedBoardId = activeBoardId ?? boards[0]?.id ?? null

  const boardDetailQuery = useQuery({
    queryKey: ['board', selectedBoardId],
    queryFn: () => fetchBoard(selectedBoardId!),
    enabled: !!selectedBoardId,
    refetchInterval: 15_000,
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      if (activeBoardId) setActiveBoardId(null)
    },
  })

  const boardIssues = boardDetailQuery.data?.issues ?? []

  const issuesByStatus = swimlaneColumns.map((col) => ({
    ...col,
    issues: boardIssues.filter((bi) => bi.issue.status === col.status),
  }))

  const visibleColumns = showClosed
    ? issuesByStatus
    : issuesByStatus.filter((col) => col.status !== 'closed')

  return (
    <div className="flex h-full flex-1 flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LayoutGrid className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-medium tracking-tight">Boards</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClosed((v) => !v)}
            className="text-xs"
          >
            {showClosed ? 'Hide Closed' : 'Show Closed'}
          </Button>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="size-3.5 mr-1" />
            New Board
          </Button>
        </div>
      </div>

      {/* Board tabs */}
      {boards.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => setActiveBoardId(board.id)}
              className={`
                inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors shrink-0
                ${selectedBoardId === board.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'}
              `}
            >
              {board.name}
              {board.query && (
                <span className="text-[10px] opacity-60">
                  ({board.query.length > 20 ? board.query.slice(0, 20) + '…' : board.query})
                </span>
              )}
            </button>
          ))}
          {selectedBoardId && !boards.find((b) => b.id === selectedBoardId)?.is_builtin && (
            <div className="flex items-center gap-0.5 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground"
                onClick={() => {
                  const b = boards.find((b) => b.id === selectedBoardId)
                  if (b) setEditingBoard(b)
                }}
              >
                <Pencil className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-destructive"
                onClick={() => {
                  if (confirm('Delete this board?')) deleteMut.mutate(selectedBoardId)
                }}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {boardsQuery.error && (
        <div className="text-destructive text-sm py-12 text-center">
          Failed to load boards: {boardsQuery.error instanceof Error ? boardsQuery.error.message : 'Unknown error'}
        </div>
      )}

      {/* Empty state */}
      {boards.length === 0 && !boardsQuery.isLoading && !boardsQuery.error && (
        <div className="text-muted-foreground text-sm py-12 text-center">
          No boards yet. Create one to get started.
        </div>
      )}

      {/* Swimlane columns */}
      {selectedBoardId && (
        <div className="flex gap-3 overflow-x-auto pb-2 flex-1 min-h-0">
          {visibleColumns.map((col) => {
            const statusMeta = statuses.find((s) => s.value === col.status)
            return (
              <div
                key={col.status}
                className="flex flex-col min-w-[240px] w-[280px] shrink-0 rounded-lg bg-muted/30 border border-border/40"
              >
                {/* Column header */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/30">
                  {statusMeta && (
                    <statusMeta.icon className={`size-3.5 ${statusMeta.iconClassName}`} />
                  )}
                  <span className="text-sm font-medium">{col.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                    {col.issues.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-1.5 p-1.5 overflow-y-auto flex-1">
                  {col.issues.map((bi) => (
                    <IssueCard
                      key={bi.issue.id}
                      boardIssue={bi}
                      onClick={() => setSelectedIssueId(bi.issue.id)}
                    />
                  ))}
                  {col.issues.length === 0 && (
                    <div className="text-muted-foreground/50 text-xs text-center py-6">
                      No issues
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick view drawer */}
      {selectedIssueId && (
        <IssueQuickView
          issueId={selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
        />
      )}

      {/* Create board dialog */}
      {showCreateDialog && (
        <BoardFormDialog
          onClose={() => setShowCreateDialog(false)}
        />
      )}

      {/* Edit board dialog */}
      {editingBoard && (
        <BoardFormDialog
          board={editingBoard}
          onClose={() => setEditingBoard(null)}
        />
      )}
    </div>
  )
}

// --- Issue Card ---

function IssueCard({
  boardIssue,
  onClick,
}: {
  boardIssue: BoardIssue
  onClick: () => void
}) {
  const issue = boardIssue.issue
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
      className="flex flex-col gap-1.5 rounded-md bg-card border border-border/50 p-2.5 text-left hover:bg-card/80 hover:border-border transition-colors cursor-pointer"
    >
      {/* Title row */}
      <div className="flex items-start gap-1.5">
        {issueType && (
          <issueType.icon className={`size-3.5 mt-0.5 shrink-0 ${issueType.iconClassName}`} />
        )}
        <span className="text-sm leading-snug line-clamp-2">{issue.title}</span>
      </div>

      {/* Footer meta */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="font-mono text-[10px] text-muted-foreground">
          {issue.id.slice(0, 10)}
        </span>
        {priority && (
          <span className={`inline-flex items-center gap-0.5 rounded px-1 py-px text-[10px] font-medium ${priority.className}`}>
            <priority.icon className="size-2.5" />
            {priority.label}
          </span>
        )}
        {issue.labels?.length > 0 && issue.labels.slice(0, 2).map((l) => (
          <Badge key={l} variant="outline" className="text-[9px] px-1 py-0 h-4">
            {l}
          </Badge>
        ))}
      </div>

      {/* Deferral / Due date indicators */}
      {(isDeferred || dueDate) && (
        <div className="flex items-center gap-2 mt-0.5">
          {isDeferred && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <CalendarClock className="size-2.5" />
              Deferred
            </span>
          )}
          {dueDate && (
            <span className={`inline-flex items-center gap-0.5 text-[10px] ${
              isOverdue
                ? 'text-destructive font-medium'
                : isDueSoon
                  ? 'text-amber-500 font-medium'
                  : 'text-muted-foreground'
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

// --- Board Form Dialog ---

function BoardFormDialog({
  board,
  onClose,
}: {
  board?: Board
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(board?.name ?? '')
  const [query, setQuery] = useState(board?.query ?? '')

  const createMut = useMutation({
    mutationFn: () => createBoard({ name, query: query || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      onClose()
    },
  })

  const updateMut = useMutation({
    mutationFn: () => updateBoard(board!.id, { name, query: query || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      queryClient.invalidateQueries({ queryKey: ['board', board!.id] })
      onClose()
    },
  })

  const isEditing = !!board
  const isPending = createMut.isPending || updateMut.isPending
  const error = createMut.error || updateMut.error

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (isEditing) {
      updateMut.mutate()
    } else {
      createMut.mutate()
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Board' : 'New Board'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="board-name">
              Name
            </label>
            <Input
              id="board-name"
              placeholder="Sprint 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="board-query">
              Query <span className="text-muted-foreground font-normal">(TDQ)</span>
            </label>
            <Input
              id="board-query"
              placeholder='priority <= P1 AND status != closed'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Filter issues with TDQ syntax. Leave empty to show all issues.
            </p>
          </div>
          {error && (
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : 'Failed to save'}
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={!name.trim() || isPending}>
              {isEditing ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
