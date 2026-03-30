import { useState, useMemo, useCallback } from 'react'
import { X, Plus, EyeOff, Eye, GitFork } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { FacetedFilter } from './faceted-filter'
import { Kbd } from '~/components/KeyboardShortcuts'
import { filterStatuses, types, priorities } from './data'
import { CreateIssueDrawer } from '~/components/CreateIssueDialog'
import type { Issue } from '~/lib/api'

// ─── Hook ────────────────────────────────────────────────────────

export interface IssueFilters {
  search: string
  statusFilter: string[]
  typeFilter: string[]
  priorityFilter: string[]
}

export function useIssueFilters(issues: Issue[]) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [priorityFilter, setPriorityFilter] = useState<string[]>([])

  const filtered = useMemo(() => {
    return issues.filter((issue) => {
      if (search && !issue.title.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter.length && !statusFilter.includes(issue.status)) return false
      if (typeFilter.length && !typeFilter.includes(issue.type)) return false
      if (priorityFilter.length && !priorityFilter.includes(issue.priority.toLowerCase())) return false
      return true
    })
  }, [issues, search, statusFilter, typeFilter, priorityFilter])

  const counts = useMemo(() => {
    const status = new Map<string, number>()
    const type = new Map<string, number>()
    const priority = new Map<string, number>()
    for (const issue of issues) {
      status.set(issue.status, (status.get(issue.status) || 0) + 1)
      type.set(issue.type, (type.get(issue.type) || 0) + 1)
      const p = issue.priority.toLowerCase()
      priority.set(p, (priority.get(p) || 0) + 1)
    }
    return { status, type, priority }
  }, [issues])

  const isFiltered = !!(search || statusFilter.length || typeFilter.length || priorityFilter.length)

  const reset = useCallback(() => {
    setSearch('')
    setStatusFilter([])
    setTypeFilter([])
    setPriorityFilter([])
  }, [])

  return {
    filtered,
    isFiltered,
    reset,
    search, setSearch,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    priorityFilter, setPriorityFilter,
    counts,
  }
}

// ─── Component ───────────────────────────────────────────────────

export interface IssueFilterBarProps {
  filters: ReturnType<typeof useIssueFilters>
  // Toggles
  showClosed?: boolean
  onToggleClosed?: () => void
  hideSubtasks?: boolean
  onToggleSubtasks?: () => void
  // Create
  showCreate?: boolean
  onShowCreate?: () => void
  onCloseCreate?: () => void
  // Create drawer context (for subtask creation under an epic)
  createParentId?: string
  createParentTitle?: string
}

export function IssueFilterBar({
  filters,
  showClosed,
  onToggleClosed,
  hideSubtasks,
  onToggleSubtasks,
  showCreate,
  onShowCreate,
  onCloseCreate,
  createParentId,
  createParentTitle,
}: IssueFilterBarProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Filter issues..."
            value={filters.search}
            onChange={(e) => filters.setSearch(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px] text-[13px]"
          />
          <FacetedFilter
            title="Status"
            options={filterStatuses}
            selectedValues={filters.statusFilter}
            onFilterChange={filters.setStatusFilter}
            counts={filters.counts.status}
          />
          <FacetedFilter
            title="Type"
            options={types}
            selectedValues={filters.typeFilter}
            onFilterChange={filters.setTypeFilter}
            counts={filters.counts.type}
          />
          <FacetedFilter
            title="Priority"
            options={priorities}
            selectedValues={filters.priorityFilter}
            onFilterChange={filters.setPriorityFilter}
            counts={filters.counts.priority}
          />
          {filters.isFiltered && (
            <Button variant="ghost" size="sm" onClick={filters.reset}>
              Reset
              <X />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onToggleSubtasks && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSubtasks}
              className="h-8 text-xs"
            >
              <GitFork className="size-3.5" />
              {hideSubtasks ? 'Show Subtasks' : 'Hide Subtasks'}
            </Button>
          )}
          {onToggleClosed && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleClosed}
              className="h-8 text-xs"
            >
              {showClosed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              {showClosed ? 'Hide Closed' : 'Show Closed'}
            </Button>
          )}
          {onShowCreate && (
            <Button size="sm" onClick={onShowCreate}>
              <Plus />
              New Issue
              <Kbd>N</Kbd>
            </Button>
          )}
        </div>
      </div>
      {showCreate && onCloseCreate && (
        <CreateIssueDrawer
          onClose={onCloseCreate}
          parentId={createParentId}
          parentTitle={createParentTitle}
        />
      )}
    </>
  )
}
