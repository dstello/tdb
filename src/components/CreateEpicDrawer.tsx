import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { createIssue, createBoard, getSafeErrorMessage, type CreateIssueInput } from '~/lib/api'
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

const createEpicSchema = z.object({
  title: z.string(),
  priority: z.string().optional(),
  description: z.string().max(10000).optional(),
})

const priorityOptions = [
  { value: 'P0', label: 'P0' },
  { value: 'P1', label: 'P1' },
  { value: 'P2', label: 'P2' },
  { value: 'P3', label: 'P3' },
  { value: 'P4', label: 'P4' },
]

export function CreateEpicDrawer({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [validationError, setValidationError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    priority: 'P2',
    description: '',
  })

  const mutation = useMutation({
    mutationFn: async () => {
      // Create the epic issue
      const input: CreateIssueInput = {
        title: form.title,
        type: 'epic',
        priority: form.priority,
        description: form.description,
      }
      const result = await createIssue(input)
      const epicId = result.issue.id

      // Auto-create a board for this epic's children
      await createBoard({
        name: form.title,
        query: `parent:${epicId}`,
      })

      return result
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['monitor'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      onClose()
      navigate({ to: '/epics/$id', params: { id: result.issue.id } })
    },
  })

  const handleSubmit = useCallback(() => {
    if (mutation.isPending) return
    setValidationError(null)
    const result = createEpicSchema.safeParse(form)
    if (!result.success) {
      setValidationError(result.error.issues[0].message)
      return
    }
    mutation.mutate()
  }, [form, mutation])

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
      <DrawerContent className="sm:max-w-md border-l border-border/60 select-text" data-vaul-no-drag>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader className="pb-3">
            <DrawerTitle className="text-[15px] font-medium">Create Epic</DrawerTitle>
            <DrawerDescription className="text-[13px]">
              A large initiative with its own board of subtasks.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Epic title..."
                autoFocus
              />
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

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="What does this epic aim to achieve?"
              />
            </div>

            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}
            {mutation.error && (
              <p className="text-sm text-destructive">
                {getSafeErrorMessage(mutation.error)}
              </p>
            )}
          </div>

          <DrawerFooter>
            <Button
              onClick={handleSubmit}
              disabled={!form.title.trim() || mutation.isPending}
            >
              {mutation.isPending ? 'Creating...' : 'Create Epic'}
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
