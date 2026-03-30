import { useState, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchBoards,
  fetchBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  getSafeErrorMessage,
  type Board,
  type Issue,
} from '~/lib/api'
import { IssueQuickView } from '~/components/IssueQuickView'
import { SwimlaneBoardView } from '~/components/tasks/swimlane-board'
import { ViewToggle } from '~/components/tasks/view-toggle'
import { IssueFilterBar, useIssueFilters } from '~/components/tasks/issue-filter-bar'
import { columns, type IssueTableMeta } from '~/components/tasks/columns'
import { DataTable } from '~/components/tasks/data-table'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '~/components/ui/dialog'
import {
  Pencil,
  Trash2,
  LayoutGrid,
} from 'lucide-react'
import { validateIssueSearch } from '~/lib/search-params'
import { useSearchParamFilters } from '~/lib/use-search-param-filters'

export const Route = createFileRoute('/boards')({
  component: BoardsPage,
  validateSearch: validateIssueSearch,
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
  const search = Route.useSearch()
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null)
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingBoard, setEditingBoard] = useState<Board | null>(null)

  const {
    filterState, filterSetters, resetFilters,
    viewMode, setViewMode,
    showClosed, toggleClosed,
  } = useSearchParamFilters(search, { pageKey: 'boards', defaultView: 'board' })

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
    refetchInterval: 60_000,
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      if (activeBoardId) setActiveBoardId(null)
    },
  })

  const boardIssues = boardDetailQuery.data?.issues ?? []
  const allIssues: Issue[] = boardIssues.map((bi) => bi.issue)
  const preFiltered = showClosed ? allIssues : allIssues.filter((i) => i.status !== 'closed')

  const filters = useIssueFilters(preFiltered, filterState, filterSetters, resetFilters)
  const issues = filters.filtered

  const parentNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const issue of allIssues) {
      if (issue.type === 'epic' || allIssues.some((i) => i.parent_id === issue.id)) {
        map.set(issue.id, issue.title)
      }
    }
    return map
  }, [allIssues])

  const visibleColumns = useMemo(
    () => showClosed ? swimlaneColumns : swimlaneColumns.filter((col) => col.status !== 'closed'),
    [showClosed]
  )

  const tableMeta: IssueTableMeta = {
    onIssueClick: (issueId) => setSelectedIssueId(issueId),
    parentNames,
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LayoutGrid className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-medium tracking-tight">Boards</h2>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleClosed}
            className="text-xs"
          >
            {showClosed ? 'Hide Closed' : 'Show Closed'}
          </Button>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <LayoutGrid className="size-3.5 mr-1" />
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
                disabled={deleteMut.isPending}
                onClick={() => {
                  if (deleteMut.isPending) return
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
          Failed to load boards: {getSafeErrorMessage(boardsQuery.error)}
        </div>
      )}

      {/* Empty state */}
      {boards.length === 0 && !boardsQuery.isLoading && !boardsQuery.error && (
        <div className="text-muted-foreground text-sm py-12 text-center">
          No boards yet. Create one to get started.
        </div>
      )}

      {/* Filter bar */}
      {selectedBoardId && (
        <IssueFilterBar filters={filters} />
      )}

      {/* Board/List content */}
      {selectedBoardId && (
        viewMode === 'board' ? (
          <SwimlaneBoardView
            issues={issues}
            onIssueClick={(issueId) => setSelectedIssueId(issueId)}
            columns={visibleColumns}
            isLoading={boardDetailQuery.isLoading}
            emptyMessage="No issues match this board's query."
          />
        ) : (
          <DataTable data={issues} columns={columns} meta={tableMeta} />
        )
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

// --- Board Form Dialog ---

const boardFormSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(200),
  query: z.string().max(500).optional(),
})

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
  const [validationError, setValidationError] = useState<string | null>(null)

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
    setValidationError(null)
    const result = boardFormSchema.safeParse({ name, query: query || undefined })
    if (!result.success) {
      setValidationError(result.error.issues[0].message)
      return
    }
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
          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}
          {error && (
            <p className="text-sm text-destructive">
              {getSafeErrorMessage(error)}
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
