import { type ColumnDef } from "@tanstack/react-table"
import { Link } from "@tanstack/react-router"

import { Badge } from "~/components/ui/badge"
import { Checkbox } from "~/components/ui/checkbox"

import { types, statuses, priorities } from "./data"
import { type Issue } from "~/lib/api"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

export const columns: ColumnDef<Issue>[] = [
  {
    id: "select",
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Issue" />
    ),
    cell: ({ row }) => (
      <Link
        to="/issues/$id"
        params={{ id: row.getValue("id") }}
        className="w-[80px] truncate font-mono text-xs hover:underline"
      >
        {(row.getValue("id") as string).slice(0, 8)}
      </Link>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const issueType = types.find((t) => t.value === row.original.type)

      return (
        <div className="flex gap-2">
          {issueType && <Badge variant="outline">{issueType.label}</Badge>}
          <Link
            to="/issues/$id"
            params={{ id: row.original.id }}
            className="max-w-[500px] truncate font-medium hover:underline"
          >
            {row.getValue("title")}
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
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
        <div className="flex w-[120px] items-center gap-2">
          {status.icon && (
            <status.icon className="size-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
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
        <div className="flex w-[100px] items-center gap-2">
          {issueType.icon && (
            <issueType.icon className="size-4 text-muted-foreground" />
          )}
          <span>{issueType.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "priority",
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
        <div className="flex items-center gap-2">
          {priority.icon && (
            <priority.icon className="size-4 text-muted-foreground" />
          )}
          <span>{priority.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
