import type { ViewMode } from '~/components/tasks/view-toggle'

export interface IssueSearchParams {
  q?: string
  status?: string   // comma-separated
  type?: string     // comma-separated
  priority?: string // comma-separated
  view?: ViewMode
  showClosed?: boolean
  hideSubtasks?: boolean
}

// Parse comma-separated string to array, filtering empty values
function csvToArray(value: string | undefined): string[] {
  if (!value) return []
  return value.split(',').map(s => s.trim()).filter(Boolean)
}

// Serialize array to comma-separated string, or undefined if empty
function arrayToCsv(arr: string[]): string | undefined {
  return arr.length > 0 ? arr.join(',') : undefined
}

export function parseSearchParams(raw: Record<string, unknown>): {
  q: string
  status: string[]
  type: string[]
  priority: string[]
  view: ViewMode | undefined
  showClosed: boolean
  hideSubtasks: boolean | undefined
} {
  return {
    q: typeof raw.q === 'string' ? raw.q : '',
    status: csvToArray(typeof raw.status === 'string' ? raw.status : undefined),
    type: csvToArray(typeof raw.type === 'string' ? raw.type : undefined),
    priority: csvToArray(typeof raw.priority === 'string' ? raw.priority : undefined),
    view: raw.view === 'board' || raw.view === 'list' ? raw.view : undefined,
    showClosed: raw.showClosed === true || raw.showClosed === 'true',
    hideSubtasks: raw.hideSubtasks === true || raw.hideSubtasks === 'true' ? true
      : raw.hideSubtasks === false || raw.hideSubtasks === 'false' ? false
      : undefined,
  }
}

/**
 * Build a clean search params object for navigation.
 * Omits default/empty values to keep URLs tidy.
 */
export function buildSearchParams(opts: {
  q?: string
  status?: string[]
  type?: string[]
  priority?: string[]
  view?: ViewMode
  defaultView?: ViewMode
  showClosed?: boolean
  hideSubtasks?: boolean
  defaultHideSubtasks?: boolean
}): IssueSearchParams {
  const params: IssueSearchParams = {}
  if (opts.q) params.q = opts.q
  const statusCsv = arrayToCsv(opts.status ?? [])
  if (statusCsv) params.status = statusCsv
  const typeCsv = arrayToCsv(opts.type ?? [])
  if (typeCsv) params.type = typeCsv
  const priorityCsv = arrayToCsv(opts.priority ?? [])
  if (priorityCsv) params.priority = priorityCsv
  // Only include view if it differs from the page default
  if (opts.view && opts.view !== opts.defaultView) params.view = opts.view
  if (opts.showClosed) params.showClosed = true
  // Include hideSubtasks when it differs from the page default
  const defaultHS = opts.defaultHideSubtasks ?? false
  if (opts.hideSubtasks !== defaultHS) {
    params.hideSubtasks = opts.hideSubtasks
  }
  return params
}

/**
 * Validate search params for TanStack Router's validateSearch.
 * Accepts any record and returns a typed IssueSearchParams.
 */
export function validateIssueSearch(raw: Record<string, unknown>): IssueSearchParams {
  const params: IssueSearchParams = {}
  if (typeof raw.q === 'string' && raw.q) params.q = raw.q
  if (typeof raw.status === 'string' && raw.status) params.status = raw.status
  if (typeof raw.type === 'string' && raw.type) params.type = raw.type
  if (typeof raw.priority === 'string' && raw.priority) params.priority = raw.priority
  if (raw.view === 'board' || raw.view === 'list') params.view = raw.view
  if (raw.showClosed === true || raw.showClosed === 'true') params.showClosed = true
  if (raw.hideSubtasks === true || raw.hideSubtasks === 'true') params.hideSubtasks = true
  return params
}
