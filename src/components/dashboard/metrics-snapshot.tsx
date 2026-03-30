import { type StatsData, type MonitorData } from "~/lib/api";
import { cn } from "~/lib/utils";
import { statuses } from "~/components/tasks/data";

interface MetricsSnapshotProps {
  stats: StatsData | undefined;
  monitor: MonitorData | undefined;
}

const statusOrder = ["open", "in_progress", "in_review", "blocked", "closed"];

const statusColors: Record<string, string> = {
  open: "bg-blue-500",
  in_progress: "bg-amber-500",
  in_review: "bg-purple-500",
  blocked: "bg-red-500",
  closed: "bg-emerald-500",
};

const priorityColors: Record<string, string> = {
  P0: "bg-red-500",
  P1: "bg-orange-500",
  P2: "bg-yellow-500",
  P3: "bg-blue-500",
  P4: "bg-zinc-400",
};

export function MetricsSnapshot({ stats, monitor }: MetricsSnapshotProps) {
  return (
    <div className="space-y-3">
      <StatusDistribution stats={stats} />
      <PriorityBreakdown stats={stats} />
    </div>
  );
}

function StatusDistribution({ stats }: { stats: StatsData | undefined }) {
  if (!stats) return null;
  const total = statusOrder.reduce(
    (sum, s) => sum + (stats.by_status[s] ?? 0),
    0,
  );
  if (total === 0) return null;

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <h4 className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest mb-3">
        Status Distribution
      </h4>
      <div className="h-2.5 flex rounded-full overflow-hidden bg-muted mb-3">
        {statusOrder.map((s) => {
          const count = stats.by_status[s] ?? 0;
          if (count === 0) return null;
          const pct = (count / total) * 100;
          return (
            <div
              key={s}
              className={cn("h-full transition-all", statusColors[s])}
              style={{ width: `${pct}%` }}
              title={`${statuses.find((x) => x.value === s)?.label}: ${count}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {statusOrder.map((s) => {
          const count = stats.by_status[s] ?? 0;
          if (count === 0) return null;
          const label = statuses.find((x) => x.value === s)?.label ?? s;
          return (
            <div
              key={s}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
            >
              <div className={cn("size-2 rounded-full", statusColors[s])} />
              <span>{label}</span>
              <span className="tabular-nums font-medium text-foreground/70">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PriorityBreakdown({ stats }: { stats: StatsData | undefined }) {
  if (!stats) return null;
  const prios = ["P0", "P1", "P2", "P3", "P4"];
  const max = Math.max(...prios.map((p) => stats.by_priority[p] ?? 0), 1);

  const hasAny = prios.some((p) => (stats.by_priority[p] ?? 0) > 0);
  if (!hasAny) return null;

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <h4 className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest mb-3">
        Priority Breakdown
      </h4>
      <div className="space-y-1.5">
        {prios.map((p) => {
          const count = stats.by_priority[p] ?? 0;
          const pct = (count / max) * 100;
          return (
            <div key={p} className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground w-5 text-right tabular-nums">
                {p}
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    priorityColors[p],
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] tabular-nums text-muted-foreground w-6 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
