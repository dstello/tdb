# TDB - TD in the browser

It connects to the `td serve` backend API and provides a filterable, sortable data table for managing issues through their lifecycle.

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

## Tech Stack

- **React 19** — UI framework
- **TanStack Start** — Full-stack React framework (SSR-capable via Vite plugin)
- **TanStack Router** — Type-safe file-based routing
- **TanStack Query** — Server state management with automatic caching and refetching
- **TanStack Table** — Headless data table with sorting, filtering, and pagination
- **shadcn/ui** — Accessible component primitives (table, badge, button, dialog, command, etc.)
- **Tailwind CSS v4** — Utility-first styling
- **Vite 8** — Dev server and bundler
- **TypeScript 6** — Type safety throughout

## Scripts

| Script          | Description                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start Vite dev server on port 5173 |
| `npm run build` | Build for production               |
| `npm run start` | Run production server              |
