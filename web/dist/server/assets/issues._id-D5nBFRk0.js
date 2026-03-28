import { c as transitionIssue, i as fetchIssue, r as deleteIssue, t as addComment } from "./api-BtRJ_phB.js";
import { t as Route } from "./issues._id-bGYcuepA.js";
import { a as statuses, i as priorities, n as Input, o as types, r as Button, s as Badge, t as Separator } from "./separator-DGuHPZYZ.js";
import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
//#region src/routes/issues.$id.tsx?tsr-split=component
var transitionMap = {
	open: [
		{
			action: "start",
			label: "Start",
			variant: "default"
		},
		{
			action: "review",
			label: "Submit for Review",
			variant: "secondary"
		},
		{
			action: "block",
			label: "Block",
			variant: "destructive"
		},
		{
			action: "close",
			label: "Close",
			variant: "outline"
		}
	],
	in_progress: [
		{
			action: "review",
			label: "Submit for Review",
			variant: "default"
		},
		{
			action: "block",
			label: "Block",
			variant: "destructive"
		},
		{
			action: "close",
			label: "Close",
			variant: "outline"
		}
	],
	in_review: [
		{
			action: "approve",
			label: "Approve",
			variant: "default"
		},
		{
			action: "reject",
			label: "Reject",
			variant: "destructive"
		},
		{
			action: "close",
			label: "Close",
			variant: "outline"
		}
	],
	blocked: [{
		action: "unblock",
		label: "Unblock",
		variant: "default"
	}, {
		action: "close",
		label: "Close",
		variant: "outline"
	}],
	closed: [{
		action: "reopen",
		label: "Reopen",
		variant: "default"
	}]
};
function IssueDetailPage() {
	const { id } = Route.useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [commentText, setCommentText] = useState("");
	const { data, isLoading, error } = useQuery({
		queryKey: ["issue", id],
		queryFn: () => fetchIssue(id)
	});
	const transitionMut = useMutation({
		mutationFn: ({ action }) => transitionIssue(id, action),
		onSuccess: () => queryClient.invalidateQueries()
	});
	const commentMut = useMutation({
		mutationFn: () => addComment(id, commentText),
		onSuccess: () => {
			setCommentText("");
			queryClient.invalidateQueries({ queryKey: ["issue", id] });
		}
	});
	const deleteMut = useMutation({
		mutationFn: () => deleteIssue(id),
		onSuccess: () => {
			queryClient.invalidateQueries();
			router.navigate({ to: "/" });
		}
	});
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "text-muted-foreground py-12 text-center",
		children: "Loading..."
	});
	if (error || !data) return /* @__PURE__ */ jsxs("div", {
		className: "text-destructive py-12 text-center",
		children: ["Failed to load issue: ", error instanceof Error ? error.message : "Not found"]
	});
	const { issue, logs, comments, dependencies, blocked_by } = data;
	const transitions = transitionMap[issue.status] ?? [];
	const status = statuses.find((s) => s.value === issue.status);
	const issueType = types.find((t) => t.value === issue.type);
	const priority = priorities.find((p) => p.value === issue.priority);
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-3xl mx-auto",
		children: [
			/* @__PURE__ */ jsx(Link, {
				to: "/",
				className: "text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block",
				children: "← Back to issues"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-lg border bg-card p-6 mb-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-start justify-between gap-4 mb-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2 flex-wrap",
							children: [
								issueType && /* @__PURE__ */ jsxs(Badge, {
									variant: "outline",
									className: "gap-1",
									children: [/* @__PURE__ */ jsx(issueType.icon, { className: "size-3" }), issueType.label]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-xs font-mono text-muted-foreground",
									children: issue.id
								}),
								status && /* @__PURE__ */ jsxs(Badge, {
									variant: "secondary",
									className: "gap-1",
									children: [/* @__PURE__ */ jsx(status.icon, { className: "size-3" }), status.label]
								}),
								priority && /* @__PURE__ */ jsxs(Badge, {
									variant: "secondary",
									className: "gap-1",
									children: [/* @__PURE__ */ jsx(priority.icon, { className: "size-3" }), priority.label]
								})
							]
						}), /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "sm",
							className: "text-destructive hover:text-destructive",
							onClick: () => {
								if (confirm("Delete this issue?")) deleteMut.mutate();
							},
							children: "Delete"
						})]
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "text-xl font-bold mb-2",
						children: issue.title
					}),
					issue.description && /* @__PURE__ */ jsx("p", {
						className: "text-sm text-muted-foreground whitespace-pre-wrap",
						children: issue.description
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs text-muted-foreground",
						children: [
							issue.points && /* @__PURE__ */ jsxs("span", { children: [issue.points, " pts"] }),
							issue.sprint && /* @__PURE__ */ jsxs("span", { children: ["Sprint: ", issue.sprint] }),
							issue.due_date && /* @__PURE__ */ jsxs("span", { children: ["Due: ", issue.due_date] }),
							issue.labels?.length > 0 && /* @__PURE__ */ jsx("span", {
								className: "flex gap-1",
								children: issue.labels.map((l) => /* @__PURE__ */ jsx(Badge, {
									variant: "outline",
									className: "text-xs",
									children: l
								}, l))
							}),
							/* @__PURE__ */ jsxs("span", { children: ["Created: ", new Date(issue.created_at).toLocaleDateString()] })
						]
					}),
					transitions.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Separator, { className: "my-4" }), /* @__PURE__ */ jsxs("div", {
						className: "flex gap-2 flex-wrap",
						children: [transitions.map((t) => /* @__PURE__ */ jsx(Button, {
							variant: t.variant,
							size: "sm",
							onClick: () => transitionMut.mutate({ action: t.action }),
							disabled: transitionMut.isPending,
							children: t.label
						}, t.action)), transitionMut.error && /* @__PURE__ */ jsx("span", {
							className: "text-xs text-destructive self-center",
							children: transitionMut.error instanceof Error ? transitionMut.error.message : "Failed"
						})]
					})] })
				]
			}),
			(dependencies.length > 0 || blocked_by.length > 0) && /* @__PURE__ */ jsxs("div", {
				className: "rounded-lg border bg-card p-4 mb-4",
				children: [
					/* @__PURE__ */ jsx("h3", {
						className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2",
						children: "Dependencies"
					}),
					dependencies.length > 0 && /* @__PURE__ */ jsxs("div", {
						className: "mb-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs text-muted-foreground",
							children: "Depends on: "
						}), dependencies.map((d) => /* @__PURE__ */ jsx(Link, {
							to: "/issues/$id",
							params: { id: d.depends_on_id },
							className: "text-xs text-primary hover:underline mr-2",
							children: d.depends_on_id
						}, d.dep_id))]
					}),
					blocked_by.length > 0 && /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
						className: "text-xs text-muted-foreground",
						children: "Blocks: "
					}), blocked_by.map((d) => /* @__PURE__ */ jsx(Link, {
						to: "/issues/$id",
						params: { id: d.issue_id },
						className: "text-xs text-primary hover:underline mr-2",
						children: d.issue_id
					}, d.dep_id))] })
				]
			}),
			logs.length > 0 && /* @__PURE__ */ jsxs("div", {
				className: "rounded-lg border bg-card p-4 mb-4",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3",
					children: "Activity"
				}), /* @__PURE__ */ jsx("div", {
					className: "space-y-2",
					children: logs.map((log) => /* @__PURE__ */ jsxs("div", {
						className: "flex items-start gap-2 text-xs",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-muted-foreground shrink-0",
								children: new Date(log.created_at).toLocaleString()
							}),
							/* @__PURE__ */ jsx(Badge, {
								variant: "outline",
								className: "text-xs",
								children: log.entry_type
							}),
							/* @__PURE__ */ jsx("span", { children: log.summary })
						]
					}, log.id))
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-lg border bg-card p-4",
				children: [
					/* @__PURE__ */ jsxs("h3", {
						className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3",
						children: ["Comments ", comments.length > 0 && `(${comments.length})`]
					}),
					comments.length > 0 && /* @__PURE__ */ jsx("div", {
						className: "space-y-3 mb-4",
						children: comments.map((c) => /* @__PURE__ */ jsxs("div", {
							className: "bg-muted rounded-lg p-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex items-center justify-between mb-1",
								children: /* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-muted-foreground",
									children: new Date(c.created_at).toLocaleString()
								})
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm whitespace-pre-wrap",
								children: c.text
							})]
						}, c.id))
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ jsx(Input, {
							placeholder: "Add a comment...",
							value: commentText,
							onChange: (e) => setCommentText(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter" && commentText.trim()) commentMut.mutate();
							},
							className: "flex-1"
						}), /* @__PURE__ */ jsx(Button, {
							onClick: () => commentMut.mutate(),
							disabled: !commentText.trim() || commentMut.isPending,
							size: "sm",
							children: "Send"
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { IssueDetailPage as component };
