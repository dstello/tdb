# TDB - TD in the browser

It connects to the `td serve` backend API and provides a filterable, sortable data table for managing issues through their lifecycle.

## Getting Started

### Prerequisites

- **Node.js** (v20+)
- The `td` backend must be running (`td serve`) — by default it listens on `http://localhost:54321`

### Install & Run

**Terminal 1 — Start the backend:**

```
td serve --port 54321 --cors http://localhost:5173
```

**Terminal 2 — Start the frontend:**

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

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── tasks/
│   │   │   ├── columns.tsx               # Column definitions for the issue data table
│   │   │   ├── data.tsx                  # Status, type, and priority definitions with icons
│   │   │   ├── data-table.tsx            # Generic data table component
│   │   │   ├── data-table-column-header.tsx  # Sortable column header
│   │   │   ├── data-table-faceted-filter.tsx # Multi-select faceted filter popover
│   │   │   ├── data-table-pagination.tsx     # Pagination controls
│   │   │   ├── data-table-row-actions.tsx    # Row action dropdown (view, transition, delete)
│   │   │   ├── data-table-toolbar.tsx        # Toolbar with search, filters, and create button
│   │   │   └── data-table-view-options.tsx   # Column visibility toggle
│   │   ├── ui/                           # shadcn/ui component primitives
│   │   └── CreateIssueDialog.tsx         # Modal dialog for creating new issues
│   ├── lib/
│   │   ├── api.ts                        # API client, types, and all endpoint functions
│   │   ├── sse.ts                        # Server-Sent Events hook for real-time updates
│   │   └── utils.ts                      # Utility functions (cn class merger)
│   ├── routes/
│   │   ├── __root.tsx                    # Root layout (nav bar, providers, global head)
│   │   ├── index.tsx                     # Issue list / data table view
│   │   └── issues.$id.tsx               # Issue detail page
│   ├── router.tsx                        # TanStack Router setup
│   ├── routeTree.gen.ts                  # Auto-generated route tree (do not edit)
│   └── styles.css                        # Tailwind CSS entry point with shadcn theme
├── components.json                       # shadcn/ui configuration
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Features

### Issue Data Table (`/`)

The main view displays all issues in a sortable, filterable data table (inspired by the [shadcn/ui tasks example](https://ui.shadcn.com/examples/tasks)):

- **Columns** — Issue ID, title (with type badge), status, type, priority
- **Sorting** — Click column headers to sort ascending/descending
- **Faceted filters** — Filter by status, type, or priority with multi-select popovers
- **Text search** — Filter issues by title
- **Pagination** — Configurable rows per page (10–50), page navigation
- **Row selection** — Checkbox selection for future batch operations
- **Column visibility** — Toggle which columns are shown via the View menu
- **Row actions** — Each row has a dropdown with View Details, status transitions, and Delete
- **Create issue** — "New Issue" button opens a dialog with title, type, priority, and description fields

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
