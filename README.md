# tdb

**td in the browser** — a visual interface for [td](https://td.haplab.com), the task tracker built for AI coding sessions.

AI agents are ephemeral. Each session starts fresh with no memory of what came before — what was tried, what was decided, what's left to do. Context gets lost, work gets repeated, and decisions get revisited.

**td** fixes this. It's external memory for your project: a minimalist CLI that tracks issues, logs decisions, and structures handoffs between sessions so the next agent picks up exactly where the last one left off.

**tdb** puts that same system in a browser — a swimlane board, filterable data table, and quick-view drawer for managing your issues visually alongside the CLI.

## What td does

Every issue follows a clear lifecycle:

```
open → in_progress → in_review → closed
            ↓
         blocked
```

Along the way, td captures the things that matter:

- **Decisions** — why you chose JWT over sessions, why you picked Postgres over SQLite
- **Blockers** — what's stuck and why, so the next session doesn't hit the same wall
- **Handoffs** — a structured summary of done, remaining, and open questions

When a session ends, it hands off. When the next session starts, it picks up. No copy-pasting chat logs. No re-explaining state.

### Session isolation

The session that implements a task can't approve its own work. This mirrors real code review — a different session (or a human) reviews and closes the issue, catching things the implementing session might have missed.

## Getting Started

You need [td](https://td.haplab.com) installed and running as a backend server.

```bash
# In your project — start the td server
td serve --port 54321 --cors http://localhost:5173

# In the tdb repo — start the frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and connects to the td API at `http://localhost:54321` by default. Override with:

```
VITE_TD_API_URL=http://your-host:54321 npm run dev
```

### Production

```bash
npm run build
npm run start
```

## Learn more

- [td documentation](https://td.haplab.com/docs/core-workflow) — core workflow, CLI reference, and configuration
- [td on GitHub](https://github.com/haplab/td) — the CLI and backend
