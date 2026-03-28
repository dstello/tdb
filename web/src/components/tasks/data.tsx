import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  AlertTriangle,
  CheckCircle,
  Circle,
  Clock,
  Eye,
  Ban,
  Bug,
  Sparkles,
  ListChecks,
  Mountain,
  Wrench,
} from "lucide-react"

export const statuses = [
  { value: "open", label: "Ready", icon: Circle },
  { value: "in_progress", label: "In Progress", icon: Clock },
  { value: "in_review", label: "In Review", icon: Eye },
  { value: "blocked", label: "Blocked", icon: Ban },
  { value: "closed", label: "Closed", icon: CheckCircle },
]

export const types = [
  { value: "task", label: "Task", icon: ListChecks },
  { value: "bug", label: "Bug", icon: Bug },
  { value: "feature", label: "Feature", icon: Sparkles },
  { value: "epic", label: "Epic", icon: Mountain },
  { value: "chore", label: "Chore", icon: Wrench },
]

export const priorities = [
  { value: "p0", label: "Critical", icon: AlertTriangle },
  { value: "p1", label: "High", icon: ArrowUp },
  { value: "p2", label: "Medium", icon: ArrowRight },
  { value: "p3", label: "Low", icon: ArrowDown },
  { value: "p4", label: "Minimal", icon: Circle },
]
