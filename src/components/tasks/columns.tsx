import { type ColumnDef } from "@tanstack/react-table"

import { Checkbox } from "~/components/ui/checkbox"

import { types, statuses, priorities } from "./data"
import { type Issue } from "~/lib/api"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { CornerDownRight } from "lucide-react"

export interface IssueTableMeta {
  onIssueClick?: (issueId: string) => void
  focusedRowIndex?: number
  parentNames?: Map<string, string>
}

export const columns: ColumnDef<Issue>[] = [
  {
    id: "select",
    size: 32,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    size: 72,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Issue" />
    ),
    cell: ({ row }) => {
      return (
        <span className="font-mono text-[11px] text-muted-foreground">
          {(row.getValue("id") as string).slice(0, 8)}
        </span>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row, table }) => {
      const issue = row.original
      const isSubtask = !!issue.parent_id
      const meta = table.options.meta as IssueTableMeta | undefined
      const parentName = isSubtask && meta?.parentNames?.get(issue.parent_id!)
      const issueType = types.find((t) => t.value === issue.type)

      return (
        <div className="flex items-center gap-2 min-w-0">
          {isSubtask ? (
            <CornerDownRight className="size-3.5 shrink-0 text-muted-foreground/50" />
          ) : issueType ? (
            <span className={`shrink-0 ${issueType.iconClassName ?? 'text-muted-foreground'}`} title={issueType.label}>
              <issueType.icon className="size-3.5" />
            </span>
          ) : null}
          <span className="truncate text-[13px]">
            {parentName && (
              <span className="text-muted-foreground">{parentName}: </span>
            )}
            {row.getValue("title")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    size: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (s) => s.value === row.getValue("status")
      )

      if (!status) {
        return <span>{row.getValue("status")}</span>
      }

      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
          <status.icon className="size-3" />
          {status.label}
        </span>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const issueType = types.find(
        (t) => t.value === row.getValue("type")
      )

      if (!issueType) {
        return <span>{row.getValue("type")}</span>
      }

      return (
        <span className="text-[13px] text-muted-foreground">
          {issueType.label}
        </span>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "priority",
    size: 100,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (p) => p.value === row.getValue("priority")
      )

      if (!priority) {
        return <span>{row.getValue("priority")}</span>
      }

      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${priority.className}`}>
          <priority.icon className="size-3" />
          {priority.label}
        </span>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    size: 40,
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
