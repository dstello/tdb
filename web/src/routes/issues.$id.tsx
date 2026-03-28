import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchIssue,
  transitionIssue,
  addComment,
  deleteIssue,
  type Issue,
} from '~/lib/api'
import { PriorityBadge, StatusBadge, TypeIcon } from '~/components/IssueCard'

export const Route = createFileRoute('/issues/$id')({
  component: IssueDetailPage,
})

const transitionMap: Record<string, { action: string; label: string; color: string }[]> = {
  open: [
    { action: 'start', label: 'Start', color: 'bg-blue-600 hover:bg-blue-500' },
    { action: 'review', label: 'Submit for Review', color: 'bg-purple-600 hover:bg-purple-500' },
    { action: 'block', label: 'Block', color: 'bg-red-600 hover:bg-red-500' },
    { action: 'close', label: 'Close', color: 'bg-zinc-600 hover:bg-zinc-500' },
  ],
  in_progress: [
    { action: 'review', label: 'Submit for Review', color: 'bg-purple-600 hover:bg-purple-500' },
    { action: 'block', label: 'Block', color: 'bg-red-600 hover:bg-red-500' },
    { action: 'close', label: 'Close', color: 'bg-zinc-600 hover:bg-zinc-500' },
  ],
  in_review: [
    { action: 'approve', label: 'Approve', color: 'bg-emerald-600 hover:bg-emerald-500' },
    { action: 'reject', label: 'Reject', color: 'bg-orange-600 hover:bg-orange-500' },
    { action: 'close', label: 'Close', color: 'bg-zinc-600 hover:bg-zinc-500' },
  ],
  blocked: [
    { action: 'unblock', label: 'Unblock', color: 'bg-emerald-600 hover:bg-emerald-500' },
    { action: 'close', label: 'Close', color: 'bg-zinc-600 hover:bg-zinc-500' },
  ],
  closed: [
    { action: 'reopen', label: 'Reopen', color: 'bg-emerald-600 hover:bg-emerald-500' },
  ],
}

function IssueDetailPage() {
  const { id } = Route.useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [commentText, setCommentText] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => fetchIssue(id),
  })

  const transitionMut = useMutation({
    mutationFn: ({ action }: { action: string }) =>
      transitionIssue(id, action as any),
    onSuccess: () => queryClient.invalidateQueries(),
  })

  const commentMut = useMutation({
    mutationFn: () => addComment(id, commentText),
    onSuccess: () => {
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: ['issue', id] })
    },
  })

  const deleteMut = useMutation({
    mutationFn: () => deleteIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries()
      router.navigate({ to: '/' })
    },
  })

  if (isLoading) return <div className="text-zinc-500 py-12 text-center">Loading...</div>
  if (error || !data)
    return (
      <div className="text-red-400 py-12 text-center">
        Failed to load issue: {error instanceof Error ? error.message : 'Not found'}
      </div>
    )

  const { issue, logs, comments, dependencies, blocked_by } = data
  const transitions = transitionMap[issue.status] ?? []

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link to="/" className="text-sm text-zinc-500 hover:text-white transition-colors mb-4 inline-block">
        ← Back to board
      </Link>

      {/* Issue header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <TypeIcon type={issue.type} />
            <span className="text-xs font-mono text-zinc-500">{issue.id}</span>
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>
          <button
            onClick={() => {
              if (confirm('Delete this issue?')) deleteMut.mutate()
            }}
            className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
        <h1 className="text-xl font-bold mb-2">{issue.title}</h1>
        {issue.description && (
          <p className="text-sm text-zinc-400 whitespace-pre-wrap">{issue.description}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs text-zinc-500">
          {issue.points && <span>{issue.points} pts</span>}
          {issue.sprint && <span>Sprint: {issue.sprint}</span>}
          {issue.due_date && <span>Due: {issue.due_date}</span>}
          {issue.labels?.length > 0 && (
            <span>
              {issue.labels.map((l) => (
                <span key={l} className="bg-zinc-800 px-1.5 py-0.5 rounded mr-1">
                  {l}
                </span>
              ))}
            </span>
          )}
          <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
        </div>

        {/* Transitions */}
        {transitions.length > 0 && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
            {transitions.map((t) => (
              <button
                key={t.action}
                onClick={() => transitionMut.mutate({ action: t.action })}
                disabled={transitionMut.isPending}
                className={`${t.color} text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50`}
              >
                {t.label}
              </button>
            ))}
            {transitionMut.error && (
              <span className="text-xs text-red-400 self-center">
                {transitionMut.error instanceof Error ? transitionMut.error.message : 'Failed'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Dependencies */}
      {(dependencies.length > 0 || blocked_by.length > 0) && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Dependencies
          </h3>
          {dependencies.length > 0 && (
            <div className="mb-2">
              <span className="text-xs text-zinc-500">Depends on: </span>
              {dependencies.map((d) => (
                <Link
                  key={d.dep_id}
                  to="/issues/$id"
                  params={{ id: d.depends_on_id }}
                  className="text-xs text-blue-400 hover:underline mr-2"
                >
                  {d.depends_on_id}
                </Link>
              ))}
            </div>
          )}
          {blocked_by.length > 0 && (
            <div>
              <span className="text-xs text-zinc-500">Blocks: </span>
              {blocked_by.map((d) => (
                <Link
                  key={d.dep_id}
                  to="/issues/$id"
                  params={{ id: d.issue_id }}
                  className="text-xs text-blue-400 hover:underline mr-2"
                >
                  {d.issue_id}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity log */}
      {logs.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Activity
          </h3>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 text-xs">
                <span className="text-zinc-600 shrink-0">
                  {new Date(log.created_at).toLocaleString()}
                </span>
                <span className="text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                  {log.entry_type}
                </span>
                <span className="text-zinc-300">{log.summary}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
        {comments.length > 0 && (
          <div className="space-y-3 mb-4">
            {comments.map((c) => (
              <div key={c.id} className="bg-zinc-800/60 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-zinc-500">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{c.text}</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && commentText.trim()) commentMut.mutate()
            }}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            onClick={() => commentMut.mutate()}
            disabled={!commentText.trim() || commentMut.isPending}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
