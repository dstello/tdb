import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { parseSearchParams, buildSearchParams, type IssueSearchParams } from '~/lib/search-params'
import type { ViewMode } from '~/components/tasks/view-toggle'
import type { IssueFilterState, IssueFilterSetters } from '~/components/tasks/issue-filter-bar'

/**
 * Reads filter/view/toggle state from URL search params and provides setters
 * that write back to the URL. Designed to be passed into useIssueFilters as
 * external state.
 */
export function useSearchParamFilters(
  search: IssueSearchParams,
  opts: {
    pageKey: string          // e.g. 'issues', 'boards', 'epic-detail'
    defaultView: ViewMode
    defaultHideSubtasks?: boolean
  },
) {
  const navigate = useNavigate()
  const parsed = parseSearchParams(search as Record<string, unknown>)

  // Resolve view mode: URL param > localStorage > page default
  const storageKey = `tdb-view-${opts.pageKey}`
  const storedView = typeof window !== 'undefined'
    ? (localStorage.getItem(storageKey) as ViewMode | null)
    : null
  const resolvedView = parsed.view ?? storedView ?? opts.defaultView

  // Debounced search: local state for responsive typing
  const [localSearch, setLocalSearch] = useState(parsed.q)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Sync local search when URL changes externally (e.g. back/forward)
  const prevQ = useRef(parsed.q)
  useEffect(() => {
    if (parsed.q !== prevQ.current) {
      setLocalSearch(parsed.q)
      prevQ.current = parsed.q
    }
  }, [parsed.q])

  // Helper to navigate with updated search params
  const update = useCallback(
    (updates: Partial<Parameters<typeof buildSearchParams>[0]>) => {
      const current = {
        q: parsed.q,
        status: parsed.status,
        type: parsed.type,
        priority: parsed.priority,
        view: parsed.view ?? opts.defaultView,
        defaultView: opts.defaultView,
        showClosed: parsed.showClosed,
        hideSubtasks: parsed.hideSubtasks,
        defaultHideSubtasks: opts.defaultHideSubtasks,
      }
      const next = buildSearchParams({ ...current, ...updates })
      navigate({ search: next, replace: true })
    },
    [navigate, parsed, opts.defaultView, opts.defaultHideSubtasks],
  )

  // Filter state for useIssueFilters
  const filterState: IssueFilterState = {
    search: localSearch,
    statusFilter: parsed.status,
    typeFilter: parsed.type,
    priorityFilter: parsed.priority,
  }

  const filterSetters: IssueFilterSetters = {
    setSearch: useCallback(
      (q: string) => {
        setLocalSearch(q)
        prevQ.current = q
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (!q) {
          // Flush immediately when clearing
          update({ q: '' })
        } else {
          debounceRef.current = setTimeout(() => {
            update({ q })
          }, 300)
        }
      },
      [update],
    ),
    setStatusFilter: useCallback((s: string[]) => update({ status: s }), [update]),
    setTypeFilter: useCallback((t: string[]) => update({ type: t }), [update]),
    setPriorityFilter: useCallback((p: string[]) => update({ priority: p }), [update]),
  }

  // View mode (URL > localStorage > default)
  const viewMode: ViewMode = resolvedView
  const setViewMode = useCallback(
    (v: ViewMode) => {
      localStorage.setItem(storageKey, v)
      update({ view: v })
    },
    [update, storageKey],
  )

  // Toggles
  const showClosed = parsed.showClosed
  const toggleClosed = useCallback(
    () => update({ showClosed: !parsed.showClosed }),
    [update, parsed.showClosed],
  )

  const hideSubtasks = parsed.hideSubtasks ?? (opts.defaultHideSubtasks ?? false)
  const toggleSubtasks = useCallback(
    () => update({ hideSubtasks: !hideSubtasks }),
    [update, hideSubtasks],
  )

  // Reset all filter params in a single navigation
  const resetFilters = useCallback(() => {
    setLocalSearch('')
    prevQ.current = ''
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const next = buildSearchParams({
      q: '',
      status: [],
      type: [],
      priority: [],
      view: parsed.view ?? opts.defaultView,
      defaultView: opts.defaultView,
      showClosed: parsed.showClosed,
      hideSubtasks: parsed.hideSubtasks,
      defaultHideSubtasks: opts.defaultHideSubtasks,
    })
    navigate({ search: next, replace: true })
  }, [navigate, parsed.view, parsed.showClosed, parsed.hideSubtasks, opts.defaultView, opts.defaultHideSubtasks])

  return {
    filterState,
    filterSetters,
    resetFilters,
    viewMode,
    setViewMode,
    showClosed,
    toggleClosed,
    hideSubtasks,
    toggleSubtasks,
  }
}
