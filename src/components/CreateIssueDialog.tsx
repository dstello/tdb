import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createIssue, type CreateIssueInput } from '~/lib/api'
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
import { cn } from '~/lib/utils'

const typeOptions = [
  { value: 'task', label: 'Task' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'epic', label: 'Epic' },
  { value: 'chore', label: 'Chore' },
]

const priorityOptions = [
  { value: 'P0', label: 'P0' },
  { value: 'P1', label: 'P1' },
  { value: 'P2', label: 'P2' },
  { value: 'P3', label: 'P3' },
  { value: 'P4', label: 'P4' },
]

interface CreateIssueDrawerProps {
  onClose: () => void
  parentId?: string
  parentTitle?: string
}

export function CreateIssueDrawer({ onClose, parentId, parentTitle }: CreateIssueDrawerProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CreateIssueInput>({
    title: '',
    type: 'task',
    priority: 'P2',
    description: '',
    parent_id: parentId,
    defer_until: undefined,
    due_date: undefined,
  })

  /* Epics query — commented out for now
  const epicsQuery = useQuery({
    queryKey: ['issues', 'epics'],
    queryFn: () => fetchIssues({ type: 'epic', limit: 100 }),
  })
  */

  const mutation = useMutation({
    mutationFn: createIssue,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['monitor'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      setForm({ title: '', type: 'task', priority: 'P2', description: '', parent_id: parentId })
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
      <DrawerContent className="sm:max-w-md border-l border-border/60 select-text" data-vaul-no-drag
      >
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader className="pb-3">
            <DrawerTitle className="text-[15px] font-medium">
              {parentId ? 'Add Subtask' : 'Create Issue'}
            </DrawerTitle>
            <DrawerDescription className="text-[13px]">
              {parentTitle
                ? <>Subtask of <span className="text-foreground/70 font-medium">{parentTitle}</span></>
                : 'Add a new issue to your tracker.'
              }
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Issue title..."
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">Type</label>
                <div className="flex flex-wrap gap-1">
                  {typeOptions.filter((opt) => !parentId || opt.value !== 'epic').map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: opt.value })}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-md transition-colors",
                        form.type === opt.value
                          ? "bg-foreground/10 text-foreground font-medium"
                          : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-foreground/5"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">Priority</label>
                <div className="flex flex-wrap gap-1">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, priority: opt.value })}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-md transition-colors",
                        form.priority === opt.value
                          ? "bg-foreground/10 text-foreground font-medium"
                          : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-foreground/5"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="Optional description..."
              />
            </div>

            {/* Parent epic — commented out for now
            {epicsQuery.data && epicsQuery.data.issues.length > 0 && (
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">Parent Epic</label>
                <Select
                  modal={false}
                  value={form.parent_id ?? '_none'}
                  onValueChange={(value) => setForm({ ...form, parent_id: value === '_none' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent portal={false}>
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
            */}

            {/* Defer & Due dates — commented out for now
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
            */}

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
              {mutation.isPending ? 'Creating...' : parentId ? 'Add Subtask' : 'Create'}
              <span className="ml-1 text-[10px] opacity-50">⌘↵</span>
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="text-muted-foreground">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
