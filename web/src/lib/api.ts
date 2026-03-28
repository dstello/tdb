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
    entry_type: string
    summary: string
    created_at: string
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
type TransitionAction =
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

export { API_BASE }
