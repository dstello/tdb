import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type MonitorData, type Issue, transitionIssue } from "~/lib/api";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { types, priorities } from "~/components/tasks/data";
import { Play, Eye, AlertTriangle } from "lucide-react";

interface NextUpProps {
  monitor: MonitorData | undefined;
}

const priorityOrder = ["P0", "P1", "P2", "P3", "P4"];

function sortByPriority(issues: Issue[]): Issue[] {
  return [...issues].sort(
    (a, b) =>
      priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority),
  );
}

function TypeIcon({ type }: { type: string }) {
  const t = types.find((x) => x.value === type);
  if (!t) return null;
  const Icon = t.icon;
  return <Icon className={cn("size-3 shrink-0", t.iconClassName)} />;
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = priorities.find((x) => x.value === priority.toLowerCase());
  if (!p) return null;
  const Icon = p.icon;
  return (
    <span className={cn("inline-flex items-center gap-0.5", p.iconClassName)}>
      <Icon className="size-3" />
    </span>
  );
}

interface QueueSectionProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  issues: Issue[];
  action?: { label: string; action: string };
}

function QueueSection({
  label,
  icon: SectionIcon,
  iconClass,
  issues,
  action,
}: QueueSectionProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, act }: { id: string; act: string }) =>
      transitionIssue(id, act as Parameters<typeof transitionIssue>[1]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitor"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  if (issues.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <SectionIcon className={cn("size-3.5", iconClass)} />
        <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[11px] text-muted-foreground/40 tabular-nums">
          ({issues.length})
        </span>
      </div>
      <div className="space-y-0.5">
        {issues.slice(0, 8).map((issue) => (
          <div
            key={issue.id}
            className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors text-xs group"
          >
            <TypeIcon type={issue.type} />
            <PriorityBadge priority={issue.priority} />
            <Link
              to="/issues/$id"
              params={{ id: issue.id }}
              className="truncate flex-1 group-hover:text-foreground text-foreground/80 hover:underline"
            >
              {issue.title}
            </Link>
            {action && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={mutation.isPending}
                onClick={() =>
                  mutation.mutate({ id: issue.id, act: action.action })
                }
              >
                {action.label}
              </Button>
            )}
          </div>
        ))}
        {issues.length > 8 && (
          <span className="text-[11px] text-muted-foreground/50 pl-2">
            +{issues.length - 8} more
          </span>
        )}
      </div>
    </div>
  );
}

export function NextUp({ monitor }: NextUpProps) {
  const taskList = monitor?.monitor.task_list;
  if (!taskList) return null;

  const needsRework = sortByPriority(taskList.needs_rework);
  const reviewable = sortByPriority(
    taskList.reviewable ?? taskList.pending_review,
  );
  const ready = sortByPriority(taskList.ready);
  const blocked = sortByPriority(taskList.blocked);

  const hasContent =
    needsRework.length > 0 ||
    reviewable.length > 0 ||
    ready.length > 0 ||
    blocked.length > 0;

  if (!hasContent) {
    return (
      <div className="rounded-lg border border-border/60 bg-card p-4">
        <h3 className="text-[14px] font-medium text-muted-foreground/90 uppercase tracking-widest mb-3">
          Next Up
        </h3>
        <p className="text-sm text-muted-foreground/60">
          All clear — nothing queued.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <h3 className="text-[14px] font-medium text-muted-foreground/90 uppercase tracking-widest mb-3">
        Next Up
      </h3>
      <div className="space-y-4">
        <QueueSection
          label="Needs Rework"
          icon={AlertTriangle}
          iconClass="text-red-400"
          issues={needsRework}
          action={{ label: "Start", action: "start" }}
        />
        <QueueSection
          label="Ready for Review"
          icon={Eye}
          iconClass="text-purple-400"
          issues={reviewable}
          action={{ label: "Approve", action: "approve" }}
        />
        <QueueSection
          label="Ready to Start"
          icon={Play}
          iconClass="text-emerald-400"
          issues={ready}
          action={{ label: "Start", action: "start" }}
        />
        <QueueSection
          label="Blocked"
          icon={AlertTriangle}
          iconClass="text-red-400/60"
          issues={blocked}
        />
      </div>
    </div>
  );
}
