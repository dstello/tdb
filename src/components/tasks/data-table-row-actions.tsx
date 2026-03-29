import { type Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

import { type Issue, transitionIssue, deleteIssue } from "~/lib/api"

const transitionsByStatus: Record<string, { action: string; label: string }[]> = {
  open: [
    { action: "start", label: "Start" },
    { action: "review", label: "Submit for Review" },
    { action: "block", label: "Block" },
    { action: "close", label: "Close" },
  ],
  in_progress: [
    { action: "review", label: "Submit for Review" },
    { action: "block", label: "Block" },
    { action: "close", label: "Close" },
  ],
  in_review: [
    { action: "approve", label: "Approve" },
    { action: "reject", label: "Reject" },
    { action: "close", label: "Close" },
  ],
  blocked: [
    { action: "unblock", label: "Unblock" },
    { action: "close", label: "Close" },
  ],
  closed: [
    { action: "reopen", label: "Reopen" },
  ],
}

interface DataTableRowActionsProps {
  row: Row<Issue>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const issue = row.original
  const queryClient = useQueryClient()
  const transitions = transitionsByStatus[issue.status] ?? []

  const handleTransition = async (action: string) => {
    await transitionIssue(issue.id, action as Parameters<typeof transitionIssue>[1])
    queryClient.invalidateQueries({ queryKey: ["monitor"] })
  }

  const handleDelete = async () => {
    await deleteIssue(issue.id)
    queryClient.invalidateQueries({ queryKey: ["monitor"] })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 data-[state=open]:bg-muted"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {transitions.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Transition</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {transitions.map((t) => (
                <DropdownMenuItem key={t.action} onClick={() => handleTransition(t.action)}>
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        {transitions.length > 0 && <DropdownMenuSeparator />}
        <DropdownMenuItem
          className="text-destructive"
          onClick={handleDelete}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
