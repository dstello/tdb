/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSSE } from '~/lib/sse'
import appCss from '~/styles.css?url'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: true,
    },
  },
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'TD — Issue Tracker' },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>
        <SSEProvider />
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
          <nav className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
              <Link to="/" className="font-bold text-lg tracking-tight text-white">
                td
              </Link>
              <Link
                to="/"
                className="text-sm text-zinc-400 hover:text-white transition-colors [&.active]:text-white"
              >
                Board
              </Link>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 py-6">
            <Outlet />
          </main>
        </div>
      </RootDocument>
    </QueryClientProvider>
  )
}

function SSEProvider() {
  useSSE()
  return null
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-zinc-950 font-[Inter,system-ui,sans-serif]">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
