# TD — Issue Tracker Front End

A Kanban-style issue tracker front end built with React, TanStack Router, TanStack Query, and Tailwind CSS. It connects to the `td serve` backend API and provides a real-time board view for managing issues through their lifecycle.

## Tech Stack

- **React 19** — UI framework
- **TanStack Start** — Full-stack React framework (SSR-capable via Vite plugin)
- **TanStack Router** — Type-safe file-based routing
- **TanStack Query** — Server state management with automatic caching and refetching
- **Tailwind CSS v4** — Utility-first styling
- **Vite 8** — Dev server and bundler
- **TypeScript 6** — Type safety throughout

## Getting Started

### Prerequisites

- **Node.js** (v20+)
- The `td` backend must be running (`td serve`) — by default it listens on `http://localhost:54321`

### Install & Run

```
cd web
npm install
npm run dev
```

The dev server starts at **http://localhost:5173**.

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

## Project Structure

```
web/
├── src/
│   ├── components/
│   │   ├── CreateIssueDialog.tsx   # Modal dialog for creating new issues
│   │   └── IssueCard.tsx           # Shared card, badge, and icon components
│   ├── lib/
│   │   ├── api.ts                  # API client, types, and all endpoint functions
│   │   └── sse.ts                  # Server-Sent Events hook for real-time updates
│   ├── routes/
│   │   ├── __root.tsx              # Root layout (nav bar, providers, global head)
│   │   ├── index.tsx               # Dashboard / Kanban board view
│   │   └── issues.$id.tsx          # Issue detail page
│   ├── router.tsx                  # TanStack Router setup
│   ├── routeTree.gen.ts            # Auto-generated route tree (do not edit)
│   └── styles.css                  # Tailwind CSS entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Features

### Kanban Board (`/`)

The main dashboard displays issues in a multi-column Kanban layout:

- **Ready** — Issues open and available to start
- **In Progress** — Actively being worked on
- **In Review** — Submitted for review (combines pending review and reviewable)
- **Needs Rework** — Rejected during review, needs changes
- **Blocked** — Waiting on dependencies or external factors
- **Closed** — Completed issues (toggled via checkbox)

Each column shows a count badge and renders issue cards with type icons, priority badges, labels, and truncated titles.

Additional board features:

- **Focused Issue** — A highlighted, pinned issue displayed at the top of the board
- **Search** — Filter issues by text in real time
- **Show Closed** — Toggle to include or hide closed issues
- **Quick Stats** — Total issues, completion rate, and issues created today
- **Create Issue** — Modal dialog with title, type, priority, and description fields

### Issue Detail (`/issues/:id`)

Clicking any issue card navigates to its detail page, which includes:

- **Header** — Type icon, ID, status badge, priority badge, and a delete action
- **Metadata** — Points, sprint, due date, labels, and creation date
- **Status Transitions** — Context-aware action buttons based on current status:
    - Open → Start, Submit for Review, Block, Close
    - In Progress → Submit for Review, Block, Close
    - In Review → Approve, Reject, Close
    - Blocked → Unblock, Close
    - Closed → Reopen
- **Dependencies** — Links to issues this one depends on or blocks
- **Activity Log** — Timestamped history of status changes and events
- **Comments** — Threaded comments with inline compose (Enter to send)

### Real-Time Updates (SSE)

The app maintains a persistent Server-Sent Events connection to the backend at `/v1/events`. When the server pushes a `refresh` event, all queries are automatically invalidated and re-fetched. The connection auto-reconnects with exponential backoff (1s → 10s max) on failure.

### Data Fetching Strategy

- **Monitor endpoint** (`/v1/monitor`) is polled every 30 seconds as a fallback
- **Stats endpoint** (`/v1/stats`) is polled every 60 seconds
- **Stale time** is set to 10 seconds globally
- **Window focus** triggers automatic refetching
- SSE events provide near-instant updates between poll intervals

## Issue Types & Priorities

### Types

| Icon | Type    |
| ---- | ------- |
| 📋   | Task    |
| 🐛   | Bug     |
| ✨   | Feature |
| 🏔️   | Epic    |
| 🔧   | Chore   |

### Priorities

| Level | Label    | Severity  |
| ----- | -------- | --------- |
| P0    | Critical | 🔴 Red    |
| P1    | High     | 🟠 Orange |
| P2    | Medium   | 🟡 Yellow |
| P3    | Low      | 🔵 Blue   |
| P4    | Minimal  | ⚪ Gray   |

## API

The front end communicates with the TD backend REST API. All requests go through a shared `request()` helper in `src/lib/api.ts` that handles JSON serialization, error extraction, and response unwrapping.

### Key Endpoints

| Method   | Path                                 | Description                                                                             |
| -------- | ------------------------------------ | --------------------------------------------------------------------------------------- |
| `GET`    | `/v1/monitor`                        | Fetch the full board state (supports `search`, `sort`, `include_closed`)                |
| `GET`    | `/v1/stats`                          | Aggregate statistics (counts, completion rate)                                          |
| `GET`    | `/v1/issues/:id`                     | Fetch issue detail with logs, comments, and dependencies                                |
| `POST`   | `/v1/issues`                         | Create a new issue                                                                      |
| `PATCH`  | `/v1/issues/:id`                     | Update an existing issue                                                                |
| `DELETE` | `/v1/issues/:id`                     | Delete an issue                                                                         |
| `POST`   | `/v1/issues/:id/:action`             | Transition issue status (start, review, approve, reject, block, unblock, close, reopen) |
| `POST`   | `/v1/issues/:id/comments`            | Add a comment                                                                           |
| `DELETE` | `/v1/issues/:id/comments/:commentId` | Delete a comment                                                                        |
| `GET`    | `/v1/events`                         | SSE stream for real-time push updates                                                   |

## Scripts

| Script          | Description                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start Vite dev server on port 5173 |
| `npm run build` | Build for production               |
| `npm run start` | Run production server              |

## Contributing

See [AGENTS.md](./AGENTS.md) for commit conventions, code quality expectations, and documentation guidelines.
