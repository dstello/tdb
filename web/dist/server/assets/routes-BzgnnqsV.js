import { a as fetchMonitor, c as transitionIssue, n as createIssue, o as fetchStats, r as deleteIssue } from "./api-BtRJ_phB.js";
import { a as statuses, c as cn, i as priorities, n as Input, o as types, r as Button, s as Badge, t as Separator } from "./separator-DGuHPZYZ.js";
import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cva } from "class-variance-authority";
import { Checkbox } from "@base-ui/react/checkbox";
import { ArrowDown, ArrowUp, Check, CheckIcon, ChevronDownIcon, ChevronLeft, ChevronRight, ChevronRightIcon, ChevronUpIcon, ChevronsLeft, ChevronsRight, ChevronsUpDown, EyeOff, MoreHorizontal, Plus, PlusCircle, SearchIcon, Settings2, X } from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import { flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Select } from "@base-ui/react/select";
import { Command } from "cmdk";
import { Popover } from "@base-ui/react/popover";
import { Drawer } from "vaul";
//#region src/components/ui/checkbox.tsx
function Checkbox$1({ className, ...props }) {
	return /* @__PURE__ */ jsx(Checkbox.Root, {
		"data-slot": "checkbox",
		className: cn("peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary", className),
		...props,
		children: /* @__PURE__ */ jsx(Checkbox.Indicator, {
			"data-slot": "checkbox-indicator",
			className: "grid place-content-center text-current transition-none [&>svg]:size-3.5",
			children: /* @__PURE__ */ jsx(CheckIcon, {})
		})
	});
}
//#endregion
//#region src/components/ui/dropdown-menu.tsx
function DropdownMenu({ ...props }) {
	return /* @__PURE__ */ jsx(Menu.Root, {
		"data-slot": "dropdown-menu",
		...props
	});
}
function DropdownMenuTrigger({ ...props }) {
	return /* @__PURE__ */ jsx(Menu.Trigger, {
		"data-slot": "dropdown-menu-trigger",
		...props
	});
}
function DropdownMenuContent({ align = "start", alignOffset = 0, side = "bottom", sideOffset = 4, className, ...props }) {
	return /* @__PURE__ */ jsx(Menu.Portal, { children: /* @__PURE__ */ jsx(Menu.Positioner, {
		className: "isolate z-50 outline-none",
		align,
		alignOffset,
		side,
		sideOffset,
		children: /* @__PURE__ */ jsx(Menu.Popup, {
			"data-slot": "dropdown-menu-content",
			className: cn("z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95", className),
			...props
		})
	}) });
}
function DropdownMenuLabel({ className, inset, ...props }) {
	return /* @__PURE__ */ jsx(Menu.GroupLabel, {
		"data-slot": "dropdown-menu-label",
		"data-inset": inset,
		className: cn("px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7", className),
		...props
	});
}
function DropdownMenuItem({ className, inset, variant = "default", ...props }) {
	return /* @__PURE__ */ jsx(Menu.Item, {
		"data-slot": "dropdown-menu-item",
		"data-inset": inset,
		"data-variant": variant,
		className: cn("group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive", className),
		...props
	});
}
function DropdownMenuSub({ ...props }) {
	return /* @__PURE__ */ jsx(Menu.SubmenuRoot, {
		"data-slot": "dropdown-menu-sub",
		...props
	});
}
function DropdownMenuSubTrigger({ className, inset, children, ...props }) {
	return /* @__PURE__ */ jsxs(Menu.SubmenuTrigger, {
		"data-slot": "dropdown-menu-sub-trigger",
		"data-inset": inset,
		className: cn("flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
		...props,
		children: [children, /* @__PURE__ */ jsx(ChevronRightIcon, { className: "ml-auto" })]
	});
}
function DropdownMenuSubContent({ align = "start", alignOffset = -3, side = "right", sideOffset = 0, className, ...props }) {
	return /* @__PURE__ */ jsx(DropdownMenuContent, {
		"data-slot": "dropdown-menu-sub-content",
		className: cn("w-auto min-w-[96px] rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className),
		align,
		alignOffset,
		side,
		sideOffset,
		...props
	});
}
function DropdownMenuCheckboxItem({ className, children, checked, inset, ...props }) {
	return /* @__PURE__ */ jsxs(Menu.CheckboxItem, {
		"data-slot": "dropdown-menu-checkbox-item",
		"data-inset": inset,
		className: cn("relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
		checked,
		...props,
		children: [/* @__PURE__ */ jsx("span", {
			className: "pointer-events-none absolute right-2 flex items-center justify-center",
			"data-slot": "dropdown-menu-checkbox-item-indicator",
			children: /* @__PURE__ */ jsx(Menu.CheckboxItemIndicator, { children: /* @__PURE__ */ jsx(CheckIcon, {}) })
		}), children]
	});
}
function DropdownMenuSeparator({ className, ...props }) {
	return /* @__PURE__ */ jsx(Menu.Separator, {
		"data-slot": "dropdown-menu-separator",
		className: cn("-mx-1 my-1 h-px bg-border", className),
		...props
	});
}
//#endregion
//#region src/components/tasks/data-table-column-header.tsx
function DataTableColumnHeader({ column, title, className }) {
	if (!column.getCanSort()) return /* @__PURE__ */ jsx("div", {
		className: cn(className),
		children: title
	});
	return /* @__PURE__ */ jsx("div", {
		className: cn("flex items-center gap-2", className),
		children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ jsxs(Button, {
				variant: "ghost",
				size: "sm",
				className: "-ml-3 h-8 data-[state=open]:bg-accent",
				children: [/* @__PURE__ */ jsx("span", { children: title }), column.getIsSorted() === "desc" ? /* @__PURE__ */ jsx(ArrowDown, {}) : column.getIsSorted() === "asc" ? /* @__PURE__ */ jsx(ArrowUp, {}) : /* @__PURE__ */ jsx(ChevronsUpDown, {})]
			})
		}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
			align: "start",
			children: [
				/* @__PURE__ */ jsxs(DropdownMenuItem, {
					onClick: () => column.toggleSorting(false),
					children: [/* @__PURE__ */ jsx(ArrowUp, {}), "Asc"]
				}),
				/* @__PURE__ */ jsxs(DropdownMenuItem, {
					onClick: () => column.toggleSorting(true),
					children: [/* @__PURE__ */ jsx(ArrowDown, {}), "Desc"]
				}),
				/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
				/* @__PURE__ */ jsxs(DropdownMenuItem, {
					onClick: () => column.toggleVisibility(false),
					children: [/* @__PURE__ */ jsx(EyeOff, {}), "Hide"]
				})
			]
		})] })
	});
}
//#endregion
//#region src/components/tasks/data-table-row-actions.tsx
var transitionsByStatus = {
	open: [
		{
			action: "start",
			label: "Start"
		},
		{
			action: "review",
			label: "Submit for Review"
		},
		{
			action: "block",
			label: "Block"
		},
		{
			action: "close",
			label: "Close"
		}
	],
	in_progress: [
		{
			action: "review",
			label: "Submit for Review"
		},
		{
			action: "block",
			label: "Block"
		},
		{
			action: "close",
			label: "Close"
		}
	],
	in_review: [
		{
			action: "approve",
			label: "Approve"
		},
		{
			action: "reject",
			label: "Reject"
		},
		{
			action: "close",
			label: "Close"
		}
	],
	blocked: [{
		action: "unblock",
		label: "Unblock"
	}, {
		action: "close",
		label: "Close"
	}],
	closed: [{
		action: "reopen",
		label: "Reopen"
	}]
};
function DataTableRowActions({ row }) {
	const issue = row.original;
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const transitions = transitionsByStatus[issue.status] ?? [];
	const handleTransition = async (action) => {
		await transitionIssue(issue.id, action);
		queryClient.invalidateQueries({ queryKey: ["monitor"] });
	};
	const handleDelete = async () => {
		await deleteIssue(issue.id);
		queryClient.invalidateQueries({ queryKey: ["monitor"] });
	};
	return /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsxs(Button, {
			variant: "ghost",
			size: "icon",
			className: "size-8 data-[state=open]:bg-muted",
			children: [/* @__PURE__ */ jsx(MoreHorizontal, {}), /* @__PURE__ */ jsx("span", {
				className: "sr-only",
				children: "Open menu"
			})]
		})
	}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
		align: "end",
		className: "w-[160px]",
		children: [
			/* @__PURE__ */ jsx(DropdownMenuItem, {
				onClick: () => navigate({
					to: "/issues/$id",
					params: { id: issue.id }
				}),
				children: "View Details"
			}),
			transitions.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(DropdownMenuSeparator, {}), /* @__PURE__ */ jsxs(DropdownMenuSub, { children: [/* @__PURE__ */ jsx(DropdownMenuSubTrigger, { children: "Transition" }), /* @__PURE__ */ jsx(DropdownMenuSubContent, { children: transitions.map((t) => /* @__PURE__ */ jsx(DropdownMenuItem, {
				onClick: () => handleTransition(t.action),
				children: t.label
			}, t.action)) })] })] }),
			/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
			/* @__PURE__ */ jsx(DropdownMenuItem, {
				className: "text-destructive",
				onClick: handleDelete,
				children: "Delete"
			})
		]
	})] });
}
//#endregion
//#region src/components/tasks/columns.tsx
var columns = [
	{
		id: "select",
		header: ({ table }) => /* @__PURE__ */ jsx(Checkbox$1, {
			checked: table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected() && "indeterminate",
			onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
			"aria-label": "Select all",
			className: "translate-y-[2px]"
		}),
		cell: ({ row }) => /* @__PURE__ */ jsx(Checkbox$1, {
			checked: row.getIsSelected(),
			onCheckedChange: (value) => row.toggleSelected(!!value),
			"aria-label": "Select row",
			className: "translate-y-[2px]"
		}),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: "id",
		header: ({ column }) => /* @__PURE__ */ jsx(DataTableColumnHeader, {
			column,
			title: "Issue"
		}),
		cell: ({ row }) => /* @__PURE__ */ jsx(Link, {
			to: "/issues/$id",
			params: { id: row.getValue("id") },
			className: "w-[80px] truncate font-mono text-xs hover:underline",
			children: row.getValue("id").slice(0, 8)
		}),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: "title",
		header: ({ column }) => /* @__PURE__ */ jsx(DataTableColumnHeader, {
			column,
			title: "Title"
		}),
		cell: ({ row }) => {
			const issueType = types.find((t) => t.value === row.original.type);
			return /* @__PURE__ */ jsxs("div", {
				className: "flex gap-2",
				children: [issueType && /* @__PURE__ */ jsx(Badge, {
					variant: "outline",
					children: issueType.label
				}), /* @__PURE__ */ jsx(Link, {
					to: "/issues/$id",
					params: { id: row.original.id },
					className: "max-w-[500px] truncate font-medium hover:underline",
					children: row.getValue("title")
				})]
			});
		}
	},
	{
		accessorKey: "status",
		header: ({ column }) => /* @__PURE__ */ jsx(DataTableColumnHeader, {
			column,
			title: "Status"
		}),
		cell: ({ row }) => {
			const status = statuses.find((s) => s.value === row.getValue("status"));
			if (!status) return /* @__PURE__ */ jsx("span", { children: row.getValue("status") });
			return /* @__PURE__ */ jsxs("div", {
				className: "flex w-[120px] items-center gap-2",
				children: [status.icon && /* @__PURE__ */ jsx(status.icon, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ jsx("span", { children: status.label })]
			});
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		}
	},
	{
		accessorKey: "type",
		header: ({ column }) => /* @__PURE__ */ jsx(DataTableColumnHeader, {
			column,
			title: "Type"
		}),
		cell: ({ row }) => {
			const issueType = types.find((t) => t.value === row.getValue("type"));
			if (!issueType) return /* @__PURE__ */ jsx("span", { children: row.getValue("type") });
			return /* @__PURE__ */ jsxs("div", {
				className: "flex w-[100px] items-center gap-2",
				children: [issueType.icon && /* @__PURE__ */ jsx(issueType.icon, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ jsx("span", { children: issueType.label })]
			});
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		}
	},
	{
		accessorKey: "priority",
		header: ({ column }) => /* @__PURE__ */ jsx(DataTableColumnHeader, {
			column,
			title: "Priority"
		}),
		cell: ({ row }) => {
			const priority = priorities.find((p) => p.value === row.getValue("priority"));
			if (!priority) return /* @__PURE__ */ jsx("span", { children: row.getValue("priority") });
			return /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [priority.icon && /* @__PURE__ */ jsx(priority.icon, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ jsx("span", { children: priority.label })]
			});
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		}
	},
	{
		id: "actions",
		cell: ({ row }) => /* @__PURE__ */ jsx(DataTableRowActions, { row })
	}
];
//#endregion
//#region src/components/ui/table.tsx
function Table({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "table-container",
		className: "relative w-full overflow-x-auto",
		children: /* @__PURE__ */ jsx("table", {
			"data-slot": "table",
			className: cn("w-full caption-bottom text-sm", className),
			...props
		})
	});
}
function TableHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx("thead", {
		"data-slot": "table-header",
		className: cn("[&_tr]:border-b", className),
		...props
	});
}
function TableBody({ className, ...props }) {
	return /* @__PURE__ */ jsx("tbody", {
		"data-slot": "table-body",
		className: cn("[&_tr:last-child]:border-0", className),
		...props
	});
}
function TableRow({ className, ...props }) {
	return /* @__PURE__ */ jsx("tr", {
		"data-slot": "table-row",
		className: cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className),
		...props
	});
}
function TableHead({ className, ...props }) {
	return /* @__PURE__ */ jsx("th", {
		"data-slot": "table-head",
		className: cn("h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0", className),
		...props
	});
}
function TableCell({ className, ...props }) {
	return /* @__PURE__ */ jsx("td", {
		"data-slot": "table-cell",
		className: cn("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", className),
		...props
	});
}
//#endregion
//#region src/components/ui/select.tsx
var Select$1 = Select.Root;
function SelectValue({ className, ...props }) {
	return /* @__PURE__ */ jsx(Select.Value, {
		"data-slot": "select-value",
		className: cn("flex flex-1 text-left", className),
		...props
	});
}
function SelectTrigger({ className, size = "default", children, ...props }) {
	return /* @__PURE__ */ jsxs(Select.Trigger, {
		"data-slot": "select-trigger",
		"data-size": size,
		className: cn("flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
		...props,
		children: [children, /* @__PURE__ */ jsx(Select.Icon, { render: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "pointer-events-none size-4 text-muted-foreground" }) })]
	});
}
function SelectContent({ className, children, side = "bottom", sideOffset = 4, align = "center", alignOffset = 0, alignItemWithTrigger = true, ...props }) {
	return /* @__PURE__ */ jsx(Select.Portal, { children: /* @__PURE__ */ jsx(Select.Positioner, {
		side,
		sideOffset,
		align,
		alignOffset,
		alignItemWithTrigger,
		className: "isolate z-50",
		children: /* @__PURE__ */ jsxs(Select.Popup, {
			"data-slot": "select-content",
			"data-align-trigger": alignItemWithTrigger,
			className: cn("relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className),
			...props,
			children: [
				/* @__PURE__ */ jsx(SelectScrollUpButton, {}),
				/* @__PURE__ */ jsx(Select.List, { children }),
				/* @__PURE__ */ jsx(SelectScrollDownButton, {})
			]
		})
	}) });
}
function SelectItem({ className, children, ...props }) {
	return /* @__PURE__ */ jsxs(Select.Item, {
		"data-slot": "select-item",
		className: cn("relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", className),
		...props,
		children: [/* @__PURE__ */ jsx(Select.ItemText, {
			className: "flex flex-1 shrink-0 gap-2 whitespace-nowrap",
			children
		}), /* @__PURE__ */ jsx(Select.ItemIndicator, {
			render: /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute right-2 flex size-4 items-center justify-center" }),
			children: /* @__PURE__ */ jsx(CheckIcon, { className: "pointer-events-none" })
		})]
	});
}
function SelectScrollUpButton({ className, ...props }) {
	return /* @__PURE__ */ jsx(Select.ScrollUpArrow, {
		"data-slot": "select-scroll-up-button",
		className: cn("top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4", className),
		...props,
		children: /* @__PURE__ */ jsx(ChevronUpIcon, {})
	});
}
function SelectScrollDownButton({ className, ...props }) {
	return /* @__PURE__ */ jsx(Select.ScrollDownArrow, {
		"data-slot": "select-scroll-down-button",
		className: cn("bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4", className),
		...props,
		children: /* @__PURE__ */ jsx(ChevronDownIcon, {})
	});
}
//#endregion
//#region src/components/tasks/data-table-pagination.tsx
function DataTablePagination({ table }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between px-2",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex-1 text-sm text-muted-foreground",
			children: [
				table.getFilteredSelectedRowModel().rows.length,
				" of",
				" ",
				table.getFilteredRowModel().rows.length,
				" row(s) selected."
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center space-x-6 lg:space-x-8",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center space-x-2",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-sm font-medium",
						children: "Rows per page"
					}), /* @__PURE__ */ jsxs(Select$1, {
						value: `${table.getState().pagination.pageSize}`,
						onValueChange: (value) => {
							table.setPageSize(Number(value));
						},
						children: [/* @__PURE__ */ jsx(SelectTrigger, {
							className: "h-8 w-[70px]",
							children: /* @__PURE__ */ jsx(SelectValue, { placeholder: table.getState().pagination.pageSize })
						}), /* @__PURE__ */ jsx(SelectContent, {
							side: "top",
							children: [
								10,
								20,
								25,
								30,
								40,
								50
							].map((pageSize) => /* @__PURE__ */ jsx(SelectItem, {
								value: `${pageSize}`,
								children: pageSize
							}, pageSize))
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex w-[100px] items-center justify-center text-sm font-medium",
					children: [
						"Page ",
						table.getState().pagination.pageIndex + 1,
						" of",
						" ",
						table.getPageCount()
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center space-x-2",
					children: [
						/* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							size: "icon",
							className: "hidden size-8 lg:flex",
							onClick: () => table.setPageIndex(0),
							disabled: !table.getCanPreviousPage(),
							children: [/* @__PURE__ */ jsx("span", {
								className: "sr-only",
								children: "Go to first page"
							}), /* @__PURE__ */ jsx(ChevronsLeft, {})]
						}),
						/* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							size: "icon",
							className: "size-8",
							onClick: () => table.previousPage(),
							disabled: !table.getCanPreviousPage(),
							children: [/* @__PURE__ */ jsx("span", {
								className: "sr-only",
								children: "Go to previous page"
							}), /* @__PURE__ */ jsx(ChevronLeft, {})]
						}),
						/* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							size: "icon",
							className: "size-8",
							onClick: () => table.nextPage(),
							disabled: !table.getCanNextPage(),
							children: [/* @__PURE__ */ jsx("span", {
								className: "sr-only",
								children: "Go to next page"
							}), /* @__PURE__ */ jsx(ChevronRight, {})]
						}),
						/* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							size: "icon",
							className: "hidden size-8 lg:flex",
							onClick: () => table.setPageIndex(table.getPageCount() - 1),
							disabled: !table.getCanNextPage(),
							children: [/* @__PURE__ */ jsx("span", {
								className: "sr-only",
								children: "Go to last page"
							}), /* @__PURE__ */ jsx(ChevronsRight, {})]
						})
					]
				})
			]
		})]
	});
}
//#endregion
//#region src/components/tasks/data-table-view-options.tsx
function DataTableViewOptions({ table }) {
	return /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsxs(Button, {
			variant: "outline",
			size: "sm",
			className: "ml-auto hidden h-8 lg:flex",
			children: [/* @__PURE__ */ jsx(Settings2, {}), "View"]
		})
	}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
		align: "end",
		className: "w-[150px]",
		children: [
			/* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Toggle columns" }),
			/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
			table.getAllColumns().filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide()).map((column) => {
				return /* @__PURE__ */ jsx(DropdownMenuCheckboxItem, {
					className: "capitalize",
					checked: column.getIsVisible(),
					onCheckedChange: (value) => column.toggleVisibility(!!value),
					children: column.id
				}, column.id);
			})
		]
	})] });
}
//#endregion
//#region src/components/ui/textarea.tsx
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ jsx("textarea", {
		"data-slot": "textarea",
		className: cn("flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40", className),
		...props
	});
}
//#endregion
//#region src/components/ui/input-group.tsx
function InputGroup({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "input-group",
		role: "group",
		className: cn("group/input-group relative flex h-8 w-full min-w-0 items-center rounded-lg border border-input transition-colors outline-none in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-disabled:bg-input/50 has-disabled:opacity-50 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto dark:bg-input/30 dark:has-disabled:bg-input/80 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5", className),
		...props
	});
}
var inputGroupAddonVariants = cva("flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4", {
	variants: { align: {
		"inline-start": "order-first pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem]",
		"inline-end": "order-last pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem]",
		"block-start": "order-first w-full justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
		"block-end": "order-last w-full justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2"
	} },
	defaultVariants: { align: "inline-start" }
});
function InputGroupAddon({ className, align = "inline-start", ...props }) {
	return /* @__PURE__ */ jsx("div", {
		role: "group",
		"data-slot": "input-group-addon",
		"data-align": align,
		className: cn(inputGroupAddonVariants({ align }), className),
		onClick: (e) => {
			if (e.target.closest("button")) return;
			e.currentTarget.parentElement?.querySelector("input")?.focus();
		},
		...props
	});
}
cva("flex items-center gap-2 text-sm shadow-none", {
	variants: { size: {
		xs: "h-6 gap-1 rounded-[calc(var(--radius)-3px)] px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
		sm: "",
		"icon-xs": "size-6 rounded-[calc(var(--radius)-3px)] p-0 has-[>svg]:p-0",
		"icon-sm": "size-8 p-0 has-[>svg]:p-0"
	} },
	defaultVariants: { size: "xs" }
});
//#endregion
//#region src/components/ui/command.tsx
function Command$1({ className, ...props }) {
	return /* @__PURE__ */ jsx(Command, {
		"data-slot": "command",
		className: cn("flex size-full flex-col overflow-hidden rounded-xl! bg-popover p-1 text-popover-foreground", className),
		...props
	});
}
function CommandInput({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "command-input-wrapper",
		className: "p-1 pb-0",
		children: /* @__PURE__ */ jsxs(InputGroup, {
			className: "h-8! rounded-lg! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-2!",
			children: [/* @__PURE__ */ jsx(Command.Input, {
				"data-slot": "command-input",
				className: cn("w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50", className),
				...props
			}), /* @__PURE__ */ jsx(InputGroupAddon, { children: /* @__PURE__ */ jsx(SearchIcon, { className: "size-4 shrink-0 opacity-50" }) })]
		})
	});
}
function CommandList({ className, ...props }) {
	return /* @__PURE__ */ jsx(Command.List, {
		"data-slot": "command-list",
		className: cn("no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none", className),
		...props
	});
}
function CommandEmpty({ className, ...props }) {
	return /* @__PURE__ */ jsx(Command.Empty, {
		"data-slot": "command-empty",
		className: cn("py-6 text-center text-sm", className),
		...props
	});
}
function CommandGroup({ className, ...props }) {
	return /* @__PURE__ */ jsx(Command.Group, {
		"data-slot": "command-group",
		className: cn("overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground", className),
		...props
	});
}
function CommandSeparator({ className, ...props }) {
	return /* @__PURE__ */ jsx(Command.Separator, {
		"data-slot": "command-separator",
		className: cn("-mx-1 h-px bg-border", className),
		...props
	});
}
function CommandItem({ className, children, ...props }) {
	return /* @__PURE__ */ jsxs(Command.Item, {
		"data-slot": "command-item",
		className: cn("group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg! data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-muted data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-selected:*:[svg]:text-foreground", className),
		...props,
		children: [children, /* @__PURE__ */ jsx(CheckIcon, { className: "ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" })]
	});
}
//#endregion
//#region src/components/ui/popover.tsx
function Popover$1({ ...props }) {
	return /* @__PURE__ */ jsx(Popover.Root, {
		"data-slot": "popover",
		...props
	});
}
function PopoverTrigger({ ...props }) {
	return /* @__PURE__ */ jsx(Popover.Trigger, {
		"data-slot": "popover-trigger",
		...props
	});
}
function PopoverContent({ className, align = "center", alignOffset = 0, side = "bottom", sideOffset = 4, ...props }) {
	return /* @__PURE__ */ jsx(Popover.Portal, { children: /* @__PURE__ */ jsx(Popover.Positioner, {
		align,
		alignOffset,
		side,
		sideOffset,
		className: "isolate z-50",
		children: /* @__PURE__ */ jsx(Popover.Popup, {
			"data-slot": "popover-content",
			className: cn("z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className),
			...props
		})
	}) });
}
//#endregion
//#region src/components/tasks/data-table-faceted-filter.tsx
function DataTableFacetedFilter({ column, title, options }) {
	const facets = column?.getFacetedUniqueValues();
	const selectedValues = new Set(column?.getFilterValue());
	return /* @__PURE__ */ jsxs(Popover$1, { children: [/* @__PURE__ */ jsx(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsxs(Button, {
			variant: "outline",
			size: "sm",
			className: "h-8 border-dashed",
			children: [
				/* @__PURE__ */ jsx(PlusCircle, {}),
				title,
				selectedValues?.size > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsx(Separator, {
						orientation: "vertical",
						className: "mx-2 h-4"
					}),
					/* @__PURE__ */ jsx(Badge, {
						variant: "secondary",
						className: "rounded-sm px-1 font-normal lg:hidden",
						children: selectedValues.size
					}),
					/* @__PURE__ */ jsx("div", {
						className: "hidden gap-1 lg:flex",
						children: selectedValues.size > 2 ? /* @__PURE__ */ jsxs(Badge, {
							variant: "secondary",
							className: "rounded-sm px-1 font-normal",
							children: [selectedValues.size, " selected"]
						}) : options.filter((option) => selectedValues.has(option.value)).map((option) => /* @__PURE__ */ jsx(Badge, {
							variant: "secondary",
							className: "rounded-sm px-1 font-normal",
							children: option.label
						}, option.value))
					})
				] })
			]
		})
	}), /* @__PURE__ */ jsx(PopoverContent, {
		className: "w-[200px] p-0",
		align: "start",
		children: /* @__PURE__ */ jsxs(Command$1, { children: [/* @__PURE__ */ jsx(CommandInput, { placeholder: title }), /* @__PURE__ */ jsxs(CommandList, { children: [
			/* @__PURE__ */ jsx(CommandEmpty, { children: "No results found." }),
			/* @__PURE__ */ jsx(CommandGroup, { children: options.map((option) => {
				const isSelected = selectedValues.has(option.value);
				return /* @__PURE__ */ jsxs(CommandItem, {
					onSelect: () => {
						if (isSelected) selectedValues.delete(option.value);
						else selectedValues.add(option.value);
						const filterValues = Array.from(selectedValues);
						column?.setFilterValue(filterValues.length ? filterValues : void 0);
					},
					children: [
						/* @__PURE__ */ jsx("div", {
							className: cn("flex size-4 items-center justify-center rounded-[4px] border", isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input [&_svg]:invisible"),
							children: /* @__PURE__ */ jsx(Check, { className: "size-3.5 text-primary-foreground" })
						}),
						option.icon && /* @__PURE__ */ jsx(option.icon, { className: "size-4 text-muted-foreground" }),
						/* @__PURE__ */ jsx("span", { children: option.label }),
						facets?.get(option.value) && /* @__PURE__ */ jsx("span", {
							className: "ml-auto flex size-4 items-center justify-center font-mono text-xs text-muted-foreground",
							children: facets.get(option.value)
						})
					]
				}, option.value);
			}) }),
			selectedValues.size > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(CommandSeparator, {}), /* @__PURE__ */ jsx(CommandGroup, { children: /* @__PURE__ */ jsx(CommandItem, {
				onSelect: () => column?.setFilterValue(void 0),
				className: "justify-center text-center",
				children: "Clear filters"
			}) })] })
		] })] })
	})] });
}
//#endregion
//#region src/components/ui/drawer.tsx
function Drawer$1({ ...props }) {
	return /* @__PURE__ */ jsx(Drawer.Root, {
		"data-slot": "drawer",
		...props
	});
}
function DrawerPortal({ ...props }) {
	return /* @__PURE__ */ jsx(Drawer.Portal, {
		"data-slot": "drawer-portal",
		...props
	});
}
function DrawerClose({ ...props }) {
	return /* @__PURE__ */ jsx(Drawer.Close, {
		"data-slot": "drawer-close",
		...props
	});
}
function DrawerOverlay({ className, ...props }) {
	return /* @__PURE__ */ jsx(Drawer.Overlay, {
		"data-slot": "drawer-overlay",
		className: cn("fixed inset-0 z-50 bg-black/10 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0", className),
		...props
	});
}
function DrawerContent({ className, children, ...props }) {
	return /* @__PURE__ */ jsxs(DrawerPortal, {
		"data-slot": "drawer-portal",
		children: [/* @__PURE__ */ jsx(DrawerOverlay, {}), /* @__PURE__ */ jsxs(Drawer.Content, {
			"data-slot": "drawer-content",
			className: cn("group/drawer-content fixed z-50 flex h-auto flex-col bg-popover text-sm text-popover-foreground data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-xl data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:rounded-r-xl data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-l-xl data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-xl data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm", className),
			...props,
			children: [/* @__PURE__ */ jsx("div", { className: "mx-auto mt-4 hidden h-1 w-[100px] shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block" }), children]
		})]
	});
}
function DrawerHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "drawer-header",
		className: cn("flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-0.5 md:text-left", className),
		...props
	});
}
function DrawerFooter({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "drawer-footer",
		className: cn("mt-auto flex flex-col gap-2 p-4", className),
		...props
	});
}
function DrawerTitle({ className, ...props }) {
	return /* @__PURE__ */ jsx(Drawer.Title, {
		"data-slot": "drawer-title",
		className: cn("font-heading text-base font-medium text-foreground", className),
		...props
	});
}
function DrawerDescription({ className, ...props }) {
	return /* @__PURE__ */ jsx(Drawer.Description, {
		"data-slot": "drawer-description",
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
//#endregion
//#region src/components/CreateIssueDialog.tsx
function CreateIssueDrawer({ onClose }) {
	const queryClient = useQueryClient();
	const [form, setForm] = useState({
		title: "",
		type: "task",
		priority: "P2",
		description: ""
	});
	const mutation = useMutation({
		mutationFn: createIssue,
		onSuccess: () => {
			queryClient.invalidateQueries();
			setForm({
				title: "",
				type: "task",
				priority: "P2",
				description: ""
			});
			onClose();
		}
	});
	return /* @__PURE__ */ jsx(Drawer$1, {
		open: true,
		direction: "right",
		modal: false,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ jsx(DrawerContent, {
			className: "sm:max-w-md",
			children: /* @__PURE__ */ jsxs("div", {
				className: "mx-auto w-full max-w-lg",
				children: [
					/* @__PURE__ */ jsxs(DrawerHeader, { children: [/* @__PURE__ */ jsx(DrawerTitle, { children: "Create Issue" }), /* @__PURE__ */ jsx(DrawerDescription, { children: "Add a new issue to your tracker." })] }),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-4 px-4 pb-2",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium",
									children: "Title"
								}), /* @__PURE__ */ jsx(Input, {
									value: form.title,
									onChange: (e) => setForm({
										...form,
										title: e.target.value
									}),
									placeholder: "Issue title...",
									autoFocus: true
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ jsx("label", {
										className: "text-sm font-medium",
										children: "Type"
									}), /* @__PURE__ */ jsxs(Select$1, {
										value: form.type,
										onValueChange: (value) => setForm({
											...form,
											type: value
										}),
										children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsxs(SelectContent, { children: [
											/* @__PURE__ */ jsx(SelectItem, {
												value: "task",
												children: "Task"
											}),
											/* @__PURE__ */ jsx(SelectItem, {
												value: "bug",
												children: "Bug"
											}),
											/* @__PURE__ */ jsx(SelectItem, {
												value: "feature",
												children: "Feature"
											}),
											/* @__PURE__ */ jsx(SelectItem, {
												value: "epic",
												children: "Epic"
											}),
											/* @__PURE__ */ jsx(SelectItem, {
												value: "chore",
												children: "Chore"
											})
										] })]
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ jsx("label", {
										className: "text-sm font-medium",
										children: "Priority"
									}), /* @__PURE__ */ jsxs(Select$1, {
										value: form.priority,
										onValueChange: (value) => setForm({
											...form,
											priority: value
										}),
										children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsxs(SelectContent, { children: [
											/* @__PURE__ */ jsx(SelectItem, {
												value: "P0",
												children: "P0 — Critical"
											}),
											/* @__PURE__ */ jsx(SelectItem, {
												value: "P1",
												children: "P1 — High"
											}),
											/* @__PURE__ */ jsx(SelectItem, {
												value: "P2",
												children: "P2 — Medium"
											}),
											/* @__PURE__ */ jsx(SelectItem, {
												value: "P3",
												children: "P3 — Low"
											}),
											/* @__PURE__ */ jsx(SelectItem, {
												value: "P4",
												children: "P4 — Minimal"
											})
										] })]
									})]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium",
									children: "Description"
								}), /* @__PURE__ */ jsx(Textarea, {
									value: form.description,
									onChange: (e) => setForm({
										...form,
										description: e.target.value
									}),
									rows: 4,
									placeholder: "Optional description..."
								})]
							}),
							mutation.error && /* @__PURE__ */ jsx("p", {
								className: "text-sm text-destructive",
								children: mutation.error instanceof Error ? mutation.error.message : "Failed to create issue"
							})
						]
					}),
					/* @__PURE__ */ jsxs(DrawerFooter, { children: [/* @__PURE__ */ jsx(Button, {
						onClick: () => mutation.mutate(form),
						disabled: !form.title.trim() || mutation.isPending,
						children: mutation.isPending ? "Creating..." : "Create"
					}), /* @__PURE__ */ jsx(DrawerClose, {
						asChild: true,
						children: /* @__PURE__ */ jsx(Button, {
							variant: "outline",
							children: "Cancel"
						})
					})] })
				]
			})
		})
	});
}
//#endregion
//#region src/components/tasks/data-table-toolbar.tsx
function DataTableToolbar({ table }) {
	const isFiltered = table.getState().columnFilters.length > 0;
	const [showCreate, setShowCreate] = useState(false);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-1 items-center gap-2",
			children: [
				/* @__PURE__ */ jsx(Input, {
					placeholder: "Filter issues...",
					value: table.getColumn("title")?.getFilterValue() ?? "",
					onChange: (event) => table.getColumn("title")?.setFilterValue(event.target.value),
					className: "h-8 w-[150px] lg:w-[250px]"
				}),
				table.getColumn("status") && /* @__PURE__ */ jsx(DataTableFacetedFilter, {
					column: table.getColumn("status"),
					title: "Status",
					options: statuses
				}),
				table.getColumn("type") && /* @__PURE__ */ jsx(DataTableFacetedFilter, {
					column: table.getColumn("type"),
					title: "Type",
					options: types
				}),
				table.getColumn("priority") && /* @__PURE__ */ jsx(DataTableFacetedFilter, {
					column: table.getColumn("priority"),
					title: "Priority",
					options: priorities
				}),
				isFiltered && /* @__PURE__ */ jsxs(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => table.resetColumnFilters(),
					children: ["Reset", /* @__PURE__ */ jsx(X, {})]
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ jsx(DataTableViewOptions, { table }), /* @__PURE__ */ jsxs(Button, {
				size: "sm",
				onClick: () => setShowCreate(true),
				children: [/* @__PURE__ */ jsx(Plus, {}), "New Issue"]
			})]
		})]
	}), showCreate && /* @__PURE__ */ jsx(CreateIssueDrawer, { onClose: () => setShowCreate(false) })] });
}
//#endregion
//#region src/components/tasks/data-table.tsx
function DataTable({ columns, data }) {
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] = React.useState({});
	const [columnFilters, setColumnFilters] = React.useState([]);
	const [sorting, setSorting] = React.useState([]);
	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters
		},
		initialState: { pagination: { pageSize: 25 } },
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues()
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ jsx(DataTableToolbar, { table }),
			/* @__PURE__ */ jsx("div", {
				className: "overflow-hidden rounded-md border",
				children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx(TableRow, { children: headerGroup.headers.map((header) => {
					return /* @__PURE__ */ jsx(TableHead, {
						colSpan: header.colSpan,
						children: header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())
					}, header.id);
				}) }, headerGroup.id)) }), /* @__PURE__ */ jsx(TableBody, { children: table.getRowModel().rows?.length ? table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx(TableRow, {
					"data-state": row.getIsSelected() && "selected",
					children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx(TableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))
				}, row.id)) : /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
					colSpan: columns.length,
					className: "h-24 text-center",
					children: "No results."
				}) }) })] })
			}),
			/* @__PURE__ */ jsx(DataTablePagination, { table })
		]
	});
}
//#endregion
//#region src/routes/index.tsx?tsr-split=component
function collectIssues(data) {
	if (!data) return [];
	const map = /* @__PURE__ */ new Map();
	const add = (issue) => {
		if (issue && !map.has(issue.id)) map.set(issue.id, issue);
	};
	add(data.monitor.focused_issue);
	data.monitor.in_progress.forEach(add);
	const tl = data.monitor.task_list;
	tl.ready.forEach(add);
	tl.in_progress.forEach(add);
	tl.reviewable.forEach(add);
	tl.needs_rework.forEach(add);
	tl.pending_review.forEach(add);
	tl.blocked.forEach(add);
	tl.closed.forEach(add);
	return Array.from(map.values());
}
function Dashboard() {
	const monitor = useQuery({
		queryKey: ["monitor", true],
		queryFn: () => fetchMonitor({ include_closed: true }),
		refetchInterval: 3e4
	});
	const stats = useQuery({
		queryKey: ["stats"],
		queryFn: fetchStats,
		refetchInterval: 6e4
	});
	const issues = collectIssues(monitor.data);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-full flex-1 flex-col gap-8",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "flex items-center justify-between gap-2",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-semibold tracking-tight",
						children: "Issues"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-muted-foreground text-sm",
						children: stats.data ? `${stats.data.total} issues · ${Math.round(stats.data.completion_rate * 100)}% complete${stats.data.created_today > 0 ? ` · +${stats.data.created_today} today` : ""}` : "Loading..."
					})]
				})
			}),
			monitor.error && /* @__PURE__ */ jsxs("div", {
				className: "text-destructive text-sm py-12 text-center",
				children: [
					"Failed to load: ",
					monitor.error instanceof Error ? monitor.error.message : "Unknown error",
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx("span", {
						className: "text-muted-foreground",
						children: "Is `td serve` running?"
					})
				]
			}),
			/* @__PURE__ */ jsx(DataTable, {
				data: issues,
				columns
			})
		]
	});
}
//#endregion
export { Dashboard as component };
