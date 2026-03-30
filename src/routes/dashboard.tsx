import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
  fetchMonitor,
  fetchStats,
  fetchBoards,
  fetchBoard,
  fetchIssues,
  getSafeErrorMessage,
  type Board,
  type BoardDetail,
} from "~/lib/api";
import { SummaryCards } from "~/components/dashboard/summary-cards";
import { ActiveWork } from "~/components/dashboard/active-work";
import { MetricsSnapshot } from "~/components/dashboard/metrics-snapshot";
import { NextUp } from "~/components/dashboard/next-up";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 60_000,
  });

  const monitorQuery = useQuery({
    queryKey: ["monitor", true],
    queryFn: () => fetchMonitor({ include_closed: true }),
    refetchInterval: 60_000,
  });

  const boardsQuery = useQuery({
    queryKey: ["boards"],
    queryFn: fetchBoards,
    refetchInterval: 60_000,
  });

  const epicsQuery = useQuery({
    queryKey: ["issues", "epics"],
    queryFn: () => fetchIssues({ type: "epic", limit: 100 }),
    refetchInterval: 60_000,
  });

  const allIssuesQuery = useQuery({
    queryKey: ["issues", "all-for-dashboard"],
    queryFn: () => fetchIssues({ limit: 1000 }),
    refetchInterval: 60_000,
  });

  // Fetch details for non-builtin boards
  const nonBuiltinBoards = (boardsQuery.data?.boards ?? []).filter((b) => !b.is_builtin);
  const boardDetailResults = useQueries({
    queries: nonBuiltinBoards.map((board) => ({
      queryKey: ["board", board.id],
      queryFn: () => fetchBoard(board.id),
      refetchInterval: 60_000,
    })),
  });

  const boardDetails = new Map<string, BoardDetail>();
  nonBuiltinBoards.forEach((board, i) => {
    const data = boardDetailResults[i]?.data;
    if (data) boardDetails.set(board.id, data);
  });

  const isLoading =
    statsQuery.isLoading || monitorQuery.isLoading;

  const error = statsQuery.error || monitorQuery.error;

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {getSafeErrorMessage(error)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-medium">Dashboard</h1>

      {isLoading ? (
        <div className="text-sm text-muted-foreground/60">Loading…</div>
      ) : (
        <>
          <SummaryCards stats={statsQuery.data} monitor={monitorQuery.data} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <ActiveWork
                monitor={monitorQuery.data}
                epics={epicsQuery.data?.issues}
                allIssues={allIssuesQuery.data?.issues}
                boards={boardsQuery.data?.boards}
                boardDetails={boardDetails}
              />
              <NextUp monitor={monitorQuery.data} />
            </div>
            <div>
              <MetricsSnapshot
                stats={statsQuery.data}
                monitor={monitorQuery.data}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
