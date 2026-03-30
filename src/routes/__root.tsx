/// <reference types="vite/client" />
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSSE } from "~/lib/sse";
import { ThemeProvider } from "~/lib/theme";
import { ThemeSwitcher } from "~/components/ThemeSwitcher";
import appCss from "~/styles.css?url";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: true,
    },
  },
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TD — Issue Tracker" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RootDocument>
          <SSEProvider />
          <div className="min-h-screen bg-background text-foreground">
            <nav className="border-b bg-card/60 backdrop-blur-sm sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-6 sm:px-8 h-12 flex items-center gap-6">
                <Link to="/" className="flex items-center gap-2">
                  <img src="/td-logo.png" alt="td" className="h-6" />
                </Link>
                <div className="h-4 w-px bg-border" />
                <Link
                  to="/"
                  className="text-[13px] text-muted-foreground hover:text-foreground transition-colors [&.active]:text-foreground"
                >
                  Issues
                </Link>
                <Link
                  to="/boards"
                  className="text-[13px] text-muted-foreground hover:text-foreground transition-colors [&.active]:text-foreground"
                >
                  Boards
                </Link>
                <Link
                  to="/epics"
                  className="text-[13px] text-muted-foreground hover:text-foreground transition-colors [&.active]:text-foreground"
                >
                  Epics
                </Link>
                <div className="ml-auto">
                  <ThemeSwitcher />
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
              <Outlet />
            </main>
          </div>
        </RootDocument>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function SSEProvider() {
  useSSE();
  return null;
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Inline script to apply stored theme before paint, avoiding FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('tdb-theme')||'dark';var m={'light':['',''],'light-hc':['','theme-light-hc'],'dark':['dark',''],'dark-dimmed':['dark','theme-dimmed'],'dark-hc':['dark','theme-dark-hc']};var c=m[t]||m['dark'];var h=document.documentElement;h.className=(''+c[0]+' '+c[1]).trim()||'';h.setAttribute('lang','en');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-background font-sans">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
