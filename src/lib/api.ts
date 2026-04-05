const API_BASE = import.meta.env.VITE_TD_API_URL ?? 'http://localhost:54321'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  const json = await res.json()
  if (!json.ok) {
    throw new ApiError(json.error?.message ?? 'Unknown error', json.error)
  }
  return json.data as T
}

export class ApiError extends Error {
  constructor(
    message: string,
    public details?: { code: string; fields?: unknown[] },
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const SAFE_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Please check your input and try again.',
  NOT_FOUND: 'The requested item could not be found.',
  CONFLICT: 'This action conflicts with the current state.',
  ALREADY_EXISTS: 'An item with that name already exists.',
  INTERNAL: 'An internal error occurred. Please try again.',
}

export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.details?.code) {
    return SAFE_ERROR_MESSAGES[error.details.code] ?? 'Something went wrong. Please try again.'
  }
  if (error instanceof Error && error.message === 'Failed to fetch') {
    return 'Unable to connect to the server.'
  }
  return 'Something went wrong. Please try again.'
}

// --- Types ---

export interface Issue {
  id: string
  title: string
  status: string
  type: string
  priority: string
  description: string
  acceptance: string
  points: number | null
  labels: string[]
  parent_id: string | null
  sprint: string | null
  minor: boolean
  defer_until: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface MonitorData {
  monitor: {
    timestamp: string
    focused_issue: Issue | null
    in_progress: Issue[]
    task_list: {
      reviewable: Issue[]
      needs_rework: Issue[]
      in_progress: Issue[]
      ready: Issue[]
      pending_review: Issue[]
      blocked: Issue[]
      closed: Issue[]
    }
    activity: Array<{ issue_id: string; summary: string; timestamp: string }>
    recent_handoffs: unknown[]
    active_sessions: unknown[]
  }
  session_id: string
  change_token: string
}

export interface IssueDetail {
  issue: Issue
  logs: Array<{
    id: string
    issue_id: string
    session_id: string
    work_session_id: string
    type: string
    message: string
    timestamp: string
  }>
  comments: Array<{
    id: string
    issue_id: string
    session_id: string
    text: string
    created_at: string
  }>
  latest_handoff: unknown | null
  dependencies: Array<{
    dep_id: string
    issue_id: string
    depends_on_id: string
    relation_type: string
  }>
  blocked_by: Array<{
    dep_id: string
    issue_id: string
    depends_on_id: string
    relation_type: string
  }>
}

export interface StatsData {
  total: number
  by_status: Record<string, number>
  by_type: Record<string, number>
  by_priority: Record<string, number>
  created_today: number
  created_this_week: number
  total_points: number
  completion_rate: number
  total_logs: number
  total_handoffs: number
}

export interface CreateIssueInput {
  title: string
  type?: string
  priority?: string
  description?: string
  acceptance?: string
  points?: number
  labels?: string[]
  parent_id?: string
  sprint?: string
  minor?: boolean
  defer_until?: string | null
  due_date?: string | null
}

export interface Board {
  id: string
  name: string
  query: string
  is_builtin: boolean
  view_mode: string
  last_viewed_at: string | null
  created_at: string
  updated_at: string
}

export interface BoardIssue {
  board_id: string
  category: string
  has_position: boolean
  issue: Issue
  position: number
}

export interface BoardDetail {
  board: Board
  issues: BoardIssue[]
}

export interface CreateBoardInput {
  name: string
  query?: string
}

export interface IssueListData {
  issues: Issue[]
  total: number
  offset: number
  limit: number
  has_more: boolean
}

// --- Endpoints ---

export function fetchMonitor(params?: {
  sort?: string
  search?: string
  include_closed?: boolean
}) {
  const sp = new URLSearchParams()
  if (params?.sort) sp.set('sort', params.sort)
  if (params?.search) sp.set('search', params.search)
  if (params?.include_closed) sp.set('include_closed', 'true')
  const qs = sp.toString()
  return request<MonitorData>(`/v1/monitor${qs ? `?${qs}` : ''}`)
}

export function fetchIssue(id: string) {
  return request<IssueDetail>(`/v1/issues/${id}`)
}

export function fetchStats() {
  return request<StatsData>('/v1/stats')
}

export function createIssue(input: CreateIssueInput) {
  return request<{ issue: Issue }>('/v1/issues', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateIssue(id: string, fields: Partial<CreateIssueInput>) {
  return request<{ issue: Issue }>(`/v1/issues/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  })
}

export function deleteIssue(id: string) {
  return request<{ deleted: boolean }>(`/v1/issues/${id}`, {
    method: 'DELETE',
  })
}

// Status transitions
export type TransitionAction =
  | 'start'
  | 'review'
  | 'approve'
  | 'reject'
  | 'block'
  | 'unblock'
  | 'close'
  | 'reopen'

export function transitionIssue(id: string, action: TransitionAction, reason?: string) {
  return request<{ issue: Issue; cascades: unknown }>(`/v1/issues/${id}/${action}`, {
    method: 'POST',
    body: JSON.stringify(reason ? { reason } : {}),
  })
}

// Comments
export function addComment(issueId: string, text: string) {
  return request<{ comment: unknown }>(`/v1/issues/${issueId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export function deleteComment(issueId: string, commentId: string) {
  return request<{ deleted: boolean }>(
    `/v1/issues/${issueId}/comments/${commentId}`,
    { method: 'DELETE' },
  )
}

// SSE
export function getEventsUrl() {
  return `${API_BASE}/v1/events`
}

// --- Boards ---

export function fetchBoards() {
  return request<{ boards: Board[] }>('/v1/boards')
}

export function fetchBoard(id: string) {
  return request<BoardDetail>(`/v1/boards/${id}`)
}

export function createBoard(input: CreateBoardInput) {
  return request<{ board: Board }>('/v1/boards', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateBoard(id: string, fields: Partial<CreateBoardInput>) {
  return request<{ board: Board }>(`/v1/boards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  })
}

export function deleteBoard(id: string) {
  return request<{ deleted: boolean }>(`/v1/boards/${id}`, {
    method: 'DELETE',
  })
}

// --- Issues List (filtered) ---

export function fetchIssues(params?: {
  type?: string
  parent?: string
  status?: string
  limit?: number
  offset?: number
}) {
  const sp = new URLSearchParams()
  if (params?.type) sp.set('type', params.type)
  if (params?.parent) sp.set('parent', params.parent)
  if (params?.status) sp.set('status', params.status)
  if (params?.limit) sp.set('limit', String(params.limit))
  if (params?.offset) sp.set('offset', String(params.offset))
  const qs = sp.toString()
  return request<IssueListData>(`/v1/issues${qs ? `?${qs}` : ''}`)
}

export { API_BASE }
