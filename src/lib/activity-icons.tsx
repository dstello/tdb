import {
  XCircle,
  RotateCcw,
  Eye,
  CheckCircle2,
  Play,
  Pause,
  Ban,
  type LucideIcon,
  CircleDot,
} from "lucide-react";

const activityIconMap: Record<
  string,
  { icon: LucideIcon; className: string }
> = {
  closed: { icon: XCircle, className: "text-muted-foreground/50" },
  reopened: { icon: RotateCcw, className: "text-muted-foreground/50" },
  "submitted for review": { icon: Eye, className: "text-muted-foreground/50" },
  approved: { icon: CheckCircle2, className: "text-muted-foreground/50" },
  "started work": { icon: Play, className: "text-muted-foreground/50" },
  paused: { icon: Pause, className: "text-muted-foreground/50" },
  blocked: { icon: Ban, className: "text-muted-foreground/50" },
};

export function getActivityIcon(message: string): {
  icon: LucideIcon;
  className: string;
} {
  const key = message.toLowerCase().trim();
  return activityIconMap[key] ?? { icon: CircleDot, className: "text-muted-foreground/40" };
}
