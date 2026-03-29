import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createIssue, fetchIssues, type CreateIssueInput } from '~/lib/api'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '~/components/ui/drawer'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

export function CreateIssueDrawer({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CreateIssueInput>({
    title: '',
    type: 'task',
    priority: 'P2',
    description: '',
    parent_id: undefined,
    defer_until: undefined,
    due_date: undefined,
  })

  const epicsQuery = useQuery({
    queryKey: ['issues', 'epics'],
    queryFn: () => fetchIssues({ type: 'epic', limit: 100 }),
  })

  const mutation = useMutation({
    mutationFn: createIssue,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['monitor'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      setForm({ title: '', type: 'task', priority: 'P2', description: '' })
      onClose()
    },
  })

  const handleSubmit = useCallback(() => {
    if (form.title.trim() && !mutation.isPending) {
      mutation.mutate(form)
    }
  }, [form, mutation])

  // Cmd+Enter to submit from anywhere in the drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSubmit])

  return (
    <Drawer open direction="right" modal={false} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="sm:max-w-md border-l border-border/60"
      >
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader className="pb-3">
            <DrawerTitle className="text-[15px] font-medium">Create Issue</DrawerTitle>
            <DrawerDescription className="text-[13px]">
              Add a new issue to your tracker.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Issue title..."
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">Type</label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm({ ...form, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="chore">Chore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">Priority</label>
                <Select
                  value={form.priority}
                  onValueChange={(value) => setForm({ ...form, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P0">P0 — Critical</SelectItem>
                    <SelectItem value="P1">P1 — High</SelectItem>
                    <SelectItem value="P2">P2 — Medium</SelectItem>
                    <SelectItem value="P3">P3 — Low</SelectItem>
                    <SelectItem value="P4">P4 — Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="Optional description..."
              />
            </div>

            {/* Parent epic */}
            {epicsQuery.data && epicsQuery.data.issues.length > 0 && (
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">Parent Epic</label>
                <Select
                  value={form.parent_id ?? '_none'}
                  onValueChange={(value) => setForm({ ...form, parent_id: value === '_none' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">None</SelectItem>
                    {epicsQuery.data.issues.map((epic) => (
                      <SelectItem key={epic.id} value={epic.id}>
                        {epic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Defer & Due dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">Defer Until</label>
                <Input
                  type="date"
                  value={form.defer_until ?? ''}
                  onChange={(e) => setForm({ ...form, defer_until: e.target.value || undefined })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">Due Date</label>
                <Input
                  type="date"
                  value={form.due_date ?? ''}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value || undefined })}
                />
              </div>
            </div>

            {mutation.error && (
              <p className="text-sm text-destructive">
                {mutation.error instanceof Error ? mutation.error.message : 'Failed to create issue'}
              </p>
            )}
          </div>

          <DrawerFooter>
            <Button
              onClick={handleSubmit}
              disabled={!form.title.trim() || mutation.isPending}
            >
              {mutation.isPending ? 'Creating...' : 'Create'}
              <span className="ml-1 text-[10px] opacity-60">⌘↵</span>
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
