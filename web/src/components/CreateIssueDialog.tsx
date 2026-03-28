import { useState } from 'react'
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
  })

  const mutation = useMutation({
    mutationFn: createIssue,
    onSuccess: () => {
      queryClient.invalidateQueries()
      setForm({ title: '', type: 'task', priority: 'P2', description: '' })
      onClose()
    },
  })

  return (
    <Drawer open onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Create Issue</DrawerTitle>
            <DrawerDescription>
              Add a new issue to your tracker.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Issue title..."
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
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
                <label className="text-sm font-medium">Priority</label>
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
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="Optional description..."
              />
            </div>

            {mutation.error && (
              <p className="text-sm text-destructive">
                {mutation.error instanceof Error ? mutation.error.message : 'Failed to create issue'}
              </p>
            )}
          </div>

          <DrawerFooter>
            <Button
              onClick={() => mutation.mutate(form)}
              disabled={!form.title.trim() || mutation.isPending}
            >
              {mutation.isPending ? 'Creating...' : 'Create'}
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
