import { type StatsData, type MonitorData } from "~/lib/api";
import { cn } from "~/lib/utils";
import {
  CheckCircle2,
  Clock,
  Eye,
  ShieldAlert,
  TrendingUp,
  Zap,
} from "lucide-react";

interface SummaryCardsProps {
  stats: StatsData | undefined;
  monitor: MonitorData | undefined;
}

const cards = [
  {
    key: "completion",
    label: "Completion",
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    getValue: (s: StatsData | undefined) =>
      s ? `${Math.round(s.completion_rate * 100)}%` : "—",
  },
  {
    key: "in_progress",
    label: "In Progress",
    icon: Clock,
    iconClass: "text-amber-500",
    getValue: (_s: StatsData | undefined, m: MonitorData | undefined) =>
      m ? String(m.monitor.task_list.in_progress.length) : "—",
  },
  {
    key: "in_review",
    label: "In Review",
    icon: Eye,
    iconClass: "text-purple-500",
    getValue: (_s: StatsData | undefined, m: MonitorData | undefined) =>
      m ? String(m.monitor.task_list.pending_review.length) : "—",
  },
  {
    key: "blocked",
    label: "Blocked",
    icon: ShieldAlert,
    iconClass: "text-red-500",
    getValue: (_s: StatsData | undefined, m: MonitorData | undefined) =>
      m ? String(m.monitor.task_list.blocked.length) : "—",
    accentWhen: (_s: StatsData | undefined, m: MonitorData | undefined) =>
      m ? m.monitor.task_list.blocked.length > 0 : false,
  },
  {
    key: "created_week",
    label: "Created This Week",
    icon: TrendingUp,
    iconClass: "text-blue-500",
    getValue: (s: StatsData | undefined) =>
      s ? String(s.created_this_week) : "—",
  },
  {
    key: "points",
    label: "Total Points",
    icon: Zap,
    iconClass: "text-yellow-500",
    getValue: (s: StatsData | undefined) =>
      s ? String(s.total_points) : "—",
  },
] as const;

export function SummaryCards({ stats, monitor }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = card.getValue(stats, monitor);
        const accent =
          "accentWhen" in card ? card.accentWhen(stats, monitor) : false;
        return (
          <div
            key={card.key}
            className={cn(
              "rounded-lg border border-border/60 bg-card p-3",
              accent && "border-red-500/40"
            )}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className={cn("size-3.5", card.iconClass)} />
              <span className="text-[11px] text-muted-foreground/70 uppercase tracking-wider">
                {card.label}
              </span>
            </div>
            <div
              className={cn(
                "text-xl font-semibold tabular-nums",
                accent && "text-red-400"
              )}
            >
              {value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
