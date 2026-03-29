import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  ShieldAlert,
  Bug,
  Sparkles,
  ListChecks,
  Mountain,
  Wrench,
} from "lucide-react"

export const statuses = [
  { value: "open", label: "Ready", icon: Circle, className: "status-open", iconClassName: "text-blue-500" },
  { value: "in_progress", label: "In Progress", icon: Clock, className: "status-in_progress", iconClassName: "text-amber-500" },
  { value: "in_review", label: "In Review", icon: Eye, className: "status-in_review", iconClassName: "text-purple-500" },
  { value: "blocked", label: "Blocked", icon: ShieldAlert, className: "status-blocked", iconClassName: "text-red-500" },
  { value: "closed", label: "Closed", icon: CheckCircle2, className: "status-closed", iconClassName: "text-emerald-500" },
]

export const filterStatuses = statuses.filter((s) => s.value !== "closed")

export const types = [
  { value: "task", label: "Task", icon: ListChecks, iconClassName: "text-blue-500" },
  { value: "bug", label: "Bug", icon: Bug, iconClassName: "text-red-500" },
  { value: "feature", label: "Feature", icon: Sparkles, iconClassName: "text-amber-500" },
  { value: "epic", label: "Epic", icon: Mountain, iconClassName: "text-purple-500" },
  { value: "chore", label: "Chore", icon: Wrench, iconClassName: "text-zinc-400" },
]

export const priorities = [
  { value: "p0", label: "Critical", icon: AlertTriangle, className: "priority-p0", iconClassName: "text-red-500" },
  { value: "p1", label: "High", icon: ArrowUp, className: "priority-p1", iconClassName: "text-orange-500" },
  { value: "p2", label: "Medium", icon: ArrowRight, className: "priority-p2", iconClassName: "text-yellow-500" },
  { value: "p3", label: "Low", icon: ArrowDown, className: "priority-p3", iconClassName: "text-blue-500" },
  { value: "p4", label: "Minimal", icon: Circle, className: "priority-p4", iconClassName: "text-zinc-400" },
]
