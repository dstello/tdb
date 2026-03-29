import { type Table } from "@tanstack/react-table"
import { X, Plus, EyeOff, Eye } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

import { statuses, filterStatuses, types, priorities } from "./data"
import { CreateIssueDrawer } from "~/components/CreateIssueDialog"
import type { IssueTableMeta } from "./columns"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const meta = table.options.meta as IssueTableMeta | undefined

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Filter issues..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px] text-[13px]"
          />
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={filterStatuses}
            />
          )}
          {table.getColumn("type") && (
            <DataTableFacetedFilter
              column={table.getColumn("type")}
              title="Type"
              options={types}
            />
          )}
          {table.getColumn("priority") && (
            <DataTableFacetedFilter
              column={table.getColumn("priority")}
              title="Priority"
              options={priorities}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetColumnFilters()}
            >
              Reset
              <X />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {meta?.onToggleClosed && (
            <Button
              variant="outline"
              size="sm"
              onClick={meta.onToggleClosed}
              className="h-8 text-xs"
            >
              {meta.showClosed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              {meta.showClosed ? "Hide Closed" : "Show Closed"}
            </Button>
          )}
          <DataTableViewOptions table={table} />
          <Button size="sm" onClick={() => meta?.onShowCreate?.()}>
            <Plus />
            New Issue
          </Button>
        </div>
      </div>
      {meta?.showCreate && (
        <CreateIssueDrawer onClose={() => meta?.onCloseCreate?.()} />
      )}
    </>
  )
}
