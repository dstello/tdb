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
  { value: "open", label: "Ready", icon: Circle, className: "status-open" },
  { value: "in_progress", label: "In Progress", icon: Clock, className: "status-in_progress" },
  { value: "in_review", label: "In Review", icon: Eye, className: "status-in_review" },
  { value: "blocked", label: "Blocked", icon: ShieldAlert, className: "status-blocked" },
  { value: "closed", label: "Closed", icon: CheckCircle2, className: "status-closed" },
]

export const types = [
  { value: "task", label: "Task", icon: ListChecks },
  { value: "bug", label: "Bug", icon: Bug },
  { value: "feature", label: "Feature", icon: Sparkles },
  { value: "epic", label: "Epic", icon: Mountain },
  { value: "chore", label: "Chore", icon: Wrench },
]

export const priorities = [
  { value: "p0", label: "Critical", icon: AlertTriangle, className: "priority-p0" },
  { value: "p1", label: "High", icon: ArrowUp, className: "priority-p1" },
  { value: "p2", label: "Medium", icon: ArrowRight, className: "priority-p2" },
  { value: "p3", label: "Low", icon: ArrowDown, className: "priority-p3" },
  { value: "p4", label: "Minimal", icon: Circle, className: "priority-p4" },
]
