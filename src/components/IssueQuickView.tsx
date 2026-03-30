import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchIssue,
  fetchIssues,
  transitionIssue,
  addComment,
  deleteIssue,
  updateIssue,
  type Issue,
} from "~/lib/api";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "~/components/ui/drawer";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";
import { statuses, types, priorities } from "~/components/tasks/data";
import {
  ExternalLink,
  X,
  CalendarClock,
  CalendarCheck,
  AlertCircle,
  Pencil,
  Play,
  Eye,
  ShieldBan,
  XCircle,
  Check,
  RotateCcw,
  LockOpen,
  Mountain,
} from "lucide-react";
import { cn } from "~/lib/utils";

const typeOptions = [
  { value: "task", label: "Task" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "epic", label: "Epic" },
  { value: "chore", label: "Chore" },
];

const priorityOptions = [
  { value: "P0", label: "P0" },
  { value: "P1", label: "P1" },
  { value: "P2", label: "P2" },
  { value: "P3", label: "P3" },
  { value: "P4", label: "P4" },
];

const transitionMap: Record<
  string,
  {
    actions: string[];
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }[]
> = {
  open: [
    {
      actions: ["start"],
      label: "Start",
      icon: Play,
      className: "text-emerald-400 hover:bg-emerald-400/10",
    },
    {
      actions: ["review"],
      label: "Review",
      icon: Eye,
      className: "text-blue-400 hover:bg-blue-400/10",
    },
    {
      actions: ["block"],
      label: "Block",
      icon: ShieldBan,
      className: "text-amber-400 hover:bg-amber-400/10",
    },
    {
      actions: ["close"],
      label: "Close",
      icon: XCircle,
      className: "text-muted-foreground hover:bg-muted-foreground/10",
    },
  ],
  in_progress: [
    {
      actions: ["review"],
      label: "Review",
      icon: Eye,
      className: "text-blue-400 hover:bg-blue-400/10",
    },
    {
      actions: ["close", "reopen"],
      label: "Back to Ready",
      icon: RotateCcw,
      className: "text-muted-foreground hover:bg-muted-foreground/10",
    },
    {
      actions: ["block"],
      label: "Block",
      icon: ShieldBan,
      className: "text-amber-400 hover:bg-amber-400/10",
    },
    {
      actions: ["close"],
      label: "Close",
      icon: XCircle,
      className: "text-muted-foreground hover:bg-muted-foreground/10",
    },
  ],
  in_review: [
    {
      actions: ["approve"],
      label: "Approve",
      icon: Check,
      className: "text-emerald-400 hover:bg-emerald-400/10",
    },
    {
      actions: ["reject"],
      label: "Back to Ready",
      icon: RotateCcw,
      className: "text-muted-foreground hover:bg-muted-foreground/10",
    },
    {
      actions: ["close"],
      label: "Close",
      icon: XCircle,
      className: "text-muted-foreground hover:bg-muted-foreground/10",
    },
  ],
  blocked: [
    {
      actions: ["unblock"],
      label: "Unblock",
      icon: LockOpen,
      className: "text-emerald-400 hover:bg-emerald-400/10",
    },
    {
      actions: ["close"],
      label: "Close",
      icon: XCircle,
      className: "text-muted-foreground hover:bg-muted-foreground/10",
    },
  ],
  closed: [
    {
      actions: ["reopen"],
      label: "Reopen",
      icon: RotateCcw,
      className: "text-blue-400 hover:bg-blue-400/10",
    },
  ],
};

interface IssueQuickViewProps {
  issueId: string;
  onClose: () => void;
}

export function IssueQuickView({ issueId, onClose }: IssueQuickViewProps) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [editingDefer, setEditingDefer] = useState(false);
  const [editingDue, setEditingDue] = useState(false);
  const [deferValue, setDeferValue] = useState("");
  const [dueValue, setDueValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    type: string;
    priority: string;
  } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["issue", issueId],
    queryFn: () => fetchIssue(issueId),
  });

  const issue = data?.issue;

  // Fetch parent issue if this issue has a parent_id
  const parentQuery = useQuery({
    queryKey: ["issue", issue?.parent_id],
    queryFn: () => fetchIssue(issue!.parent_id!),
    enabled: !!issue?.parent_id,
  });

  // Fetch child count if this is an epic
  const childrenQuery = useQuery({
    queryKey: ["issues", "children", issueId],
    queryFn: () => fetchIssues({ limit: 500 }),
    enabled: issue?.type === "epic",
    select: (data) => data.issues.filter((i) => i.parent_id === issueId),
  });

  const transitionMut = useMutation({
    mutationFn: async ({ actions }: { actions: string[] }) => {
      let result;
      for (const action of actions) {
        result = await transitionIssue(issueId, action as any);
      }
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const commentMut = useMutation({
    mutationFn: () => addComment(issueId, commentText),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteIssue(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries();
      onClose();
    },
  });

  const deferMut = useMutation({
    mutationFn: (date: string | null) =>
      updateIssue(issueId, { defer_until: date === "" ? null : date }),
    onSuccess: () => {
      setEditingDefer(false);
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });

  const dueMut = useMutation({
    mutationFn: (date: string | null) =>
      updateIssue(issueId, { due_date: date === "" ? null : date }),
    onSuccess: () => {
      setEditingDue(false);
      queryClient.invalidateQueries({ queryKey: ["issue", issueId] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });

  const editMut = useMutation({
    mutationFn: (fields: {
      title?: string;
      description?: string;
      type?: string;
      priority?: string;
    }) => updateIssue(issueId, fields),
    onSuccess: () => {
      setIsEditing(false);
      setEditForm(null);
      queryClient.invalidateQueries();
    },
  });

  const startEditing = (issue: Issue) => {
    setEditForm({
      title: issue.title,
      description: issue.description ?? "",
      type: issue.type,
      priority: issue.priority,
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editForm) return;
    editMut.mutate(editForm);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const transitions = issue ? (transitionMap[issue.status] ?? []) : [];
  const status = issue ? statuses.find((s) => s.value === issue.status) : null;
  const issueType = issue ? types.find((t) => t.value === issue.type) : null;
  const priority = issue
    ? priorities.find((p) => p.value === issue.priority)
    : null;
  const parentIssue = parentQuery.data?.issue;
  const children = childrenQuery.data ?? [];

  return (
    <Drawer
      open
      direction="right"
      modal={false}
      onOpenChange={(open) => !open && onClose()}
    >
      <DrawerContent className="sm:max-w-md overflow-y-auto border-l border-border/60">
        <DrawerHeader className="flex flex-row items-start justify-between gap-2 pb-3">
          <div className="flex flex-col gap-1 min-w-0">
            <DrawerTitle className="truncate text-[15px] font-medium">
              {isLoading ? "Loading..." : (issue?.title ?? "Issue")}
            </DrawerTitle>
            <DrawerDescription className="font-mono text-[11px]">
              {issueId.slice(0, 8)}
            </DrawerDescription>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {issue && !isEditing && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={() => startEditing(issue)}
              >
                <Pencil className="size-3.5" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link to="/issues/$id" params={{ id: issueId }}>
                <ExternalLink className="size-3.5" />
                <span className="sr-only">Full page</span>
              </Link>
            </Button>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {isLoading && (
          <div className="text-muted-foreground text-sm text-center py-8">
            Loading...
          </div>
        )}

        {error && (
          <div className="text-destructive text-sm text-center py-8">
            {error instanceof Error ? error.message : "Failed to load"}
          </div>
        )}

        {issue && (
          <div className="flex flex-col gap-4 px-4 pb-4">
            {/* Edit mode */}
            {isEditing && editForm ? (
              <div className="flex flex-col gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">
                    Title
                  </label>
                  <Input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        e.stopPropagation();
                        saveEdit();
                      }
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">
                      Type
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {typeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setEditForm({ ...editForm, type: opt.value })
                          }
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-md transition-colors",
                            editForm.type === opt.value
                              ? "bg-foreground/10 text-foreground font-medium"
                              : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-foreground/5",
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">
                      Priority
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {priorityOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setEditForm({ ...editForm, priority: opt.value })
                          }
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-md transition-colors",
                            editForm.priority === opt.value
                              ? "bg-foreground/10 text-foreground font-medium"
                              : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-foreground/5",
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest">
                    Description
                  </label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        e.stopPropagation();
                        saveEdit();
                      }
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                </div>
                {editMut.error && (
                  <p className="text-sm text-destructive">
                    {editMut.error instanceof Error
                      ? editMut.error.message
                      : "Failed to save"}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={saveEdit}
                    disabled={!editForm.title.trim() || editMut.isPending}
                  >
                    {editMut.isPending ? "Saving..." : "Save"}
                    <span className="ml-1 text-[10px] opacity-50">⌘↵</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Parent epic link */}
                {parentIssue && (
                  <Link
                    to="/epics/$id"
                    params={{ id: parentIssue.id }}
                    className="inline-flex items-center gap-1.5 text-xs text-purple-400/80 hover:text-purple-400 transition-colors"
                  >
                    <Mountain className="size-3" />
                    {parentIssue.title}
                  </Link>
                )}

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {issueType && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <issueType.icon className="size-3.5" />
                      {issueType.label}
                    </span>
                  )}
                  {status && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                    >
                      <status.icon className="size-3" />
                      {status.label}
                    </span>
                  )}
                  {priority && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${priority.className}`}
                    >
                      <priority.icon className="size-3" />
                      {priority.label}
                    </span>
                  )}
                </div>

                {/* Description */}
                {issue.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {issue.description}
                  </p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {issue.points != null && <span>{issue.points} pts</span>}
                  {issue.sprint && <span>Sprint: {issue.sprint}</span>}
                  {issue.labels?.length > 0 &&
                    issue.labels.map((l) => (
                      <Badge key={l} variant="outline" className="text-xs">
                        {l}
                      </Badge>
                    ))}
                  <span>
                    Created: {new Date(issue.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Epic children link */}
                {issue.type === "epic" && children.length > 0 && (
                  <Link
                    to="/epics/$id"
                    params={{ id: issue.id }}
                    className="inline-flex items-center gap-1.5 text-xs text-purple-400/80 hover:text-purple-400 transition-colors"
                  >
                    <Mountain className="size-3" />
                    {children.length} subtask{children.length !== 1 ? "s" : ""}{" "}
                    — View epic board →
                  </Link>
                )}
              </>
            )}

            {/* Deferral & Due Dates — commented out for now
            <DeferralSection
              issue={issue}
              editingDefer={editingDefer}
              editingDue={editingDue}
              deferValue={deferValue}
              dueValue={dueValue}
              onEditDefer={() => { setEditingDefer(true); setDeferValue(issue.defer_until ?? '') }}
              onEditDue={() => { setEditingDue(true); setDueValue(issue.due_date ?? '') }}
              onDeferChange={setDeferValue}
              onDueChange={setDueValue}
              onDeferSave={() => deferMut.mutate(deferValue || null)}
              onDueSave={() => dueMut.mutate(dueValue || null)}
              onDeferClear={() => deferMut.mutate(null)}
              onDueClear={() => dueMut.mutate(null)}
              onDeferCancel={() => setEditingDefer(false)}
              onDueCancel={() => setEditingDue(false)}
              isSaving={deferMut.isPending || dueMut.isPending}
            />
            */}

            {/* Transitions */}
            {transitions.length > 0 && (
              <>
                <Separator />
                <div className="flex gap-1 flex-wrap">
                  {transitions.map((t) => (
                    <Button
                      key={t.actions.join("-")}
                      variant="ghost"
                      size="sm"
                      className={cn("gap-1.5", t.className)}
                      onClick={() =>
                        transitionMut.mutate({ actions: t.actions })
                      }
                      disabled={transitionMut.isPending}
                    >
                      <t.icon className="size-3.5" />
                      {t.label}
                    </Button>
                  ))}
                </div>
              </>
            )}

            {/* Dependencies */}
            {data &&
              (data.dependencies.length > 0 || data.blocked_by.length > 0) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest mb-1">
                      Dependencies
                    </h4>
                    {data.dependencies.length > 0 && (
                      <div className="text-xs mb-1">
                        <span className="text-muted-foreground">
                          Depends on:{" "}
                        </span>
                        {data.dependencies.map((d) => (
                          <span
                            key={d.dep_id}
                            className="text-primary cursor-pointer hover:underline mr-2"
                          >
                            {d.depends_on_id.slice(0, 8)}
                          </span>
                        ))}
                      </div>
                    )}
                    {data.blocked_by.length > 0 && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Blocks: </span>
                        {data.blocked_by.map((d) => (
                          <span
                            key={d.dep_id}
                            className="text-primary cursor-pointer hover:underline mr-2"
                          >
                            {d.issue_id.slice(0, 8)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

            {/* Activity */}
            {data && data.logs.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest mb-2">
                    Activity
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {data.logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 text-xs"
                      >
                        <span className="text-muted-foreground/60 shrink-0 tabular-nums">
                          {new Date(log.timestamp).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="truncate">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Comments */}
            <Separator />
            <div>
              <h4 className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-widest mb-2">
                Comments{" "}
                {data &&
                  data.comments.length > 0 &&
                  `(${data.comments.length})`}
              </h4>
              {data && data.comments.length > 0 && (
                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                  {data.comments.map((c) => (
                    <div key={c.id} className="bg-muted rounded-md p-2">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                      <p className="text-sm whitespace-pre-wrap">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && commentText.trim())
                      commentMut.mutate();
                  }}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => commentMut.mutate()}
                  disabled={!commentText.trim() || commentMut.isPending}
                >
                  Send
                </Button>
              </div>
            </div>

            {/* Delete */}
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive/60 hover:text-destructive w-fit"
              onClick={() => {
                if (confirm("Delete this issue?")) deleteMut.mutate();
              }}
            >
              Delete issue
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

// --- Deferral & Due Date Section ---

interface DeferralSectionProps {
  issue: { defer_until: string | null; due_date: string | null };
  editingDefer: boolean;
  editingDue: boolean;
  deferValue: string;
  dueValue: string;
  onEditDefer: () => void;
  onEditDue: () => void;
  onDeferChange: (v: string) => void;
  onDueChange: (v: string) => void;
  onDeferSave: () => void;
  onDueSave: () => void;
  onDeferClear: () => void;
  onDueClear: () => void;
  onDeferCancel: () => void;
  onDueCancel: () => void;
  isSaving: boolean;
}

function DeferralSection({
  issue,
  editingDefer,
  editingDue,
  deferValue,
  dueValue,
  onEditDefer,
  onEditDue,
  onDeferChange,
  onDueChange,
  onDeferSave,
  onDueSave,
  onDeferClear,
  onDueClear,
  onDeferCancel,
  onDueCancel,
  isSaving,
}: DeferralSectionProps) {
  const now = new Date();
  const deferUntil = issue.defer_until ? new Date(issue.defer_until) : null;
  const dueDate = issue.due_date ? new Date(issue.due_date) : null;
  const isDeferred = deferUntil && deferUntil > now;
  const isOverdue = dueDate && dueDate < now;
  const isDueSoon =
    dueDate && !isOverdue && dueDate.getTime() - now.getTime() < 3 * 86400000;

  return (
    <div className="flex flex-col gap-2">
      {/* Defer */}
      <div className="flex items-center gap-2 text-xs">
        <CalendarClock className="size-3.5 text-muted-foreground shrink-0" />
        {editingDefer ? (
          <div className="flex items-center gap-1.5 flex-1">
            <Input
              type="date"
              value={deferValue}
              onChange={(e) => onDeferChange(e.target.value)}
              className="h-6 text-xs flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") onDeferSave();
                if (e.key === "Escape") onDeferCancel();
              }}
            />
            <Button size="xs" onClick={onDeferSave} disabled={isSaving}>
              Save
            </Button>
            <Button size="xs" variant="ghost" onClick={onDeferCancel}>
              ✕
            </Button>
          </div>
        ) : (
          <span className="flex items-center gap-1.5">
            {isDeferred ? (
              <span className="text-muted-foreground">
                Deferred until {deferUntil.toLocaleDateString()}
              </span>
            ) : issue.defer_until ? (
              <span className="text-muted-foreground">
                Was deferred until{" "}
                {new Date(issue.defer_until).toLocaleDateString()}
              </span>
            ) : (
              <span className="text-muted-foreground/60">No deferral</span>
            )}
            <Button
              size="xs"
              variant="ghost"
              className="h-4 px-1 text-[10px]"
              onClick={onEditDefer}
            >
              {issue.defer_until ? "Edit" : "Set"}
            </Button>
            {issue.defer_until && (
              <Button
                size="xs"
                variant="ghost"
                className="h-4 px-1 text-[10px] text-destructive"
                onClick={onDeferClear}
                disabled={isSaving}
              >
                Clear
              </Button>
            )}
          </span>
        )}
      </div>

      {/* Due */}
      <div className="flex items-center gap-2 text-xs">
        {isOverdue ? (
          <AlertCircle className="size-3.5 text-destructive shrink-0" />
        ) : (
          <CalendarCheck
            className={`size-3.5 shrink-0 ${isDueSoon ? "text-amber-500" : "text-muted-foreground"}`}
          />
        )}
        {editingDue ? (
          <div className="flex items-center gap-1.5 flex-1">
            <Input
              type="date"
              value={dueValue}
              onChange={(e) => onDueChange(e.target.value)}
              className="h-6 text-xs flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") onDueSave();
                if (e.key === "Escape") onDueCancel();
              }}
            />
            <Button size="xs" onClick={onDueSave} disabled={isSaving}>
              Save
            </Button>
            <Button size="xs" variant="ghost" onClick={onDueCancel}>
              ✕
            </Button>
          </div>
        ) : (
          <span className="flex items-center gap-1.5">
            {dueDate ? (
              <span
                className={
                  isOverdue
                    ? "text-destructive font-medium"
                    : isDueSoon
                      ? "text-amber-500 font-medium"
                      : "text-muted-foreground"
                }
              >
                Due {dueDate.toLocaleDateString()}
                {isOverdue && " (overdue)"}
                {isDueSoon && " (due soon)"}
              </span>
            ) : (
              <span className="text-muted-foreground/60">No due date</span>
            )}
            <Button
              size="xs"
              variant="ghost"
              className="h-4 px-1 text-[10px]"
              onClick={onEditDue}
            >
              {issue.due_date ? "Edit" : "Set"}
            </Button>
            {issue.due_date && (
              <Button
                size="xs"
                variant="ghost"
                className="h-4 px-1 text-[10px] text-destructive"
                onClick={onDueClear}
                disabled={isSaving}
              >
                Clear
              </Button>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
