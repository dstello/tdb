import { Link } from "@tanstack/react-router";
import {
  type Issue,
  type MonitorData,
  type Board,
  type BoardDetail,
} from "~/lib/api";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { statuses, types, priorities } from "~/components/tasks/data";
import { Mountain } from "lucide-react";

interface ActiveWorkProps {
  monitor: MonitorData | undefined;
  epics: Issue[] | undefined;
  allIssues: Issue[] | undefined;
  boards: Board[] | undefined;
  boardDetails: Map<string, BoardDetail>;
}

function StatusBadge({ status }: { status: string }) {
  const s = statuses.find((x) => x.value === status);
  if (!s) return null;
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px]",
        s.iconClassName,
      )}
    >
      <Icon className="size-3" />
      {s.label}
    </span>
  );
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

function TypeIcon({ type }: { type: string }) {
  const t = types.find((x) => x.value === type);
  if (!t) return null;
  const Icon = t.icon;
  return <Icon className={cn("size-3 shrink-0", t.iconClassName)} />;
}

function IssueRow({ issue }: { issue: Issue }) {
  return (
    <Link
      to="/issues/$id"
      params={{ id: issue.id }}
      className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors text-xs group"
    >
      <TypeIcon type={issue.type} />
      <PriorityBadge priority={issue.priority} />
      <span className="truncate flex-1 group-hover:text-foreground text-foreground/80">
        {issue.title}
      </span>
      <StatusBadge status={issue.status} />
    </Link>
  );
}

export function ActiveWork({
  monitor,
  epics,
  allIssues,
  boards,
  boardDetails,
}: ActiveWorkProps) {
  const activeEpics =
    epics?.filter(
      (e) => e.status === "in_progress" || e.status === "in_review",
    ) ?? [];

  const epicChildStats = new Map<
    string,
    { total: number; closed: number; active: Issue[] }
  >();
  if (allIssues) {
    for (const issue of allIssues) {
      if (!issue.parent_id) continue;
      const stat = epicChildStats.get(issue.parent_id) ?? {
        total: 0,
        closed: 0,
        active: [],
      };
      stat.total++;
      if (issue.status === "closed") stat.closed++;
      if (issue.status === "in_progress" || issue.status === "in_review") {
        stat.active.push(issue);
      }
      epicChildStats.set(issue.parent_id, stat);
    }
  }

  // Per-board active issues
  const activeBoards = (boards ?? [])
    .filter((b) => !b.is_builtin)
    .map((b) => {
      const detail = boardDetails.get(b.id);
      const activeIssues =
        detail?.issues
          .filter(
            (bi) =>
              bi.issue.status === "in_progress" ||
              bi.issue.status === "in_review",
          )
          .map((bi) => bi.issue) ?? [];
      return { board: b, activeIssues };
    })
    .filter((b) => b.activeIssues.length > 0);

  const hasContent = activeEpics.length > 0 || activeBoards.length > 0;

  if (!hasContent) {
    return (
      <div className="rounded-lg border border-border/60 bg-card p-4">
        <h3 className="text-[14px] font-medium text-muted-foreground/90 uppercase tracking-widest mb-3">
          In Progress
        </h3>
        <p className="text-sm text-muted-foreground/60">
          No active epics or board items.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <h3 className="text-[14px] font-medium text-muted-foreground/90 uppercase tracking-widest mb-3">
        In Progress
      </h3>
      <div className="space-y-4">
        {activeEpics.length > 0 && (
          <div className="space-y-3">
            {activeEpics.map((epic) => {
              const stats = epicChildStats.get(epic.id) ?? {
                total: 0,
                closed: 0,
                active: [],
              };
              const pct =
                stats.total > 0
                  ? Math.round((stats.closed / stats.total) * 100)
                  : 0;
              return (
                <div key={epic.id} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Mountain className="size-3.5 text-purple-500" />
                    <Link
                      to="/epics/$id"
                      params={{ id: epic.id }}
                      className="text-sm font-medium hover:underline truncate flex-1"
                    >
                      {epic.title}
                    </Link>
                    <PriorityBadge priority={epic.priority} />
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 font-normal"
                    >
                      {pct}%
                    </Badge>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500/70 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {stats.active.length > 0 && (
                    <div className="pl-5">
                      {stats.active.slice(0, 5).map((child) => (
                        <IssueRow key={child.id} issue={child} />
                      ))}
                      {stats.active.length > 5 && (
                        <span className="text-[11px] text-muted-foreground/50 pl-2">
                          +{stats.active.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeBoards.length > 0 && (
          <div className="space-y-3">
            {activeBoards.map(({ board, activeIssues }) => (
              <div key={board.id}>
                <div className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-1">
                  {board.name}
                </div>
                <div>
                  {activeIssues.slice(0, 8).map((issue) => (
                    <IssueRow key={issue.id} issue={issue} />
                  ))}
                  {activeIssues.length > 8 && (
                    <span className="text-[11px] text-muted-foreground/50 pl-2">
                      +{activeIssues.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
