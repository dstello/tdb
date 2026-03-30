# tdb - td in the browser

[td](https://td.haplab.com) is a minimalist CLI for tracking tasks across AI coding sessions. It acts as external memory for your project -- so the next agent session picks up exactly where the last one left off, without pasting context or re-explaining state.

tdb connects to the `td serve` backend API and provides a filterable, sortable data table for managing issues through their lifecycle.

## Getting Started

### Prerequisites

- **Node.js** (v20+)
- The `td` backend must be running (`td serve`) — by default it listens on `http://localhost:54321`

### Install & Run

**In your project using TD — start the backend server**

```
td serve --port 54321 --cors http://localhost:5173
```

**In your tdb repo — start the frontend:**

```
npm install
npm run dev
```

The backend API runs at **http://localhost:54321** and the dev server starts at **http://localhost:5173**.

### Environment Variables

| Variable          | Default                  | Description                    |
| ----------------- | ------------------------ | ------------------------------ |
| `VITE_TD_API_URL` | `http://localhost:54321` | Base URL of the TD backend API |

Override the API URL if your backend is running elsewhere:

```
VITE_TD_API_URL=http://192.168.1.50:54321 npm run dev
```

### Build for Production

```
npm run build
npm run start
```

The production server runs from `.output/server/index.mjs`.

## How TD Works

TD manages the full lifecycle of issues — from creation through review — with structured handoffs between AI sessions to prevent context loss.

### Issue Lifecycle

```
open → in_progress → in_review → closed
            |
         blocked
```

### Quick Reference

```bash
# Create issues
td create "Add user auth" --type feature --priority P1

# Start work
td start td-a1b2          # Begin work on an issue
td next                    # Show highest-priority open issue

# Log progress
td log "OAuth callback working"
td log --decision "Using JWT for stateless auth"
td log --blocker "Unclear on refresh token rotation"

# Hand off to the next session
td handoff td-a1b2 \
  --done "OAuth flow, token storage" \
  --remaining "Refresh token rotation" \
  --decision "Using JWT for stateless auth"

# Review workflow
td review td-a1b2          # Submit for review
td approve td-a1b2         # Close the issue (different session required)
td reject td-a1b2 --reason "Missing error handling"
```

**Types:** `bug` · `feature` · `task` · `epic` · `chore`
**Priorities:** `P0` (critical) through `P4` (lowest), defaults to P2

### Key Concepts

- **Handoffs** capture what was done, what remains, decisions made, and open questions — so the next session picks up without guessing.
- **Session isolation** ensures the implementing session cannot approve its own work, mirroring real code review.
- **Balanced review** lets task creators approve work done by a different session (with a reason), while still blocking self-approval by implementers.

See the [full workflow docs](https://td.haplab.com/docs/core-workflow) for details.

## Tech Stack

- **React 19** — UI framework
- **TanStack Start** — Full-stack React framework (SSR-capable via Vite plugin)
- **TanStack Router** — Type-safe file-based routing
- **TanStack Query** — Server state management with automatic caching and refetching
- **TanStack Table** — Headless data table with sorting, filtering, and pagination
- **shadcn/ui** — Accessible component primitives (table, badge, button, dialog, command, etc.)
- **Tailwind CSS v4** — Utility-first styling
- **Vite 8** — Dev server and bundler

## Scripts

| Script          | Description                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start Vite dev server on port 5173 |
| `npm run build` | Build for production               |
| `npm run start` | Run production server              |
