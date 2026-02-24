"use client";

interface AnalyticsRow {
  id: string;
  project_id: string;
  step_key: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  skipped: boolean;
}

interface StepStats {
  step_key: string;
  avgDuration: number;
  totalStarted: number;
  totalCompleted: number;
  totalSkipped: number;
  dropOffRate: number;
}

export function QuestionnaireStepAnalytics({ data }: { data: AnalyticsRow[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        <p>No questionnaire analytics data yet.</p>
        <p className="text-sm mt-1">Data will appear once clients start filling out briefs.</p>
      </div>
    );
  }

  // Group by step_key
  const byStep = new Map<string, AnalyticsRow[]>();
  for (const row of data) {
    const arr = byStep.get(row.step_key) || [];
    arr.push(row);
    byStep.set(row.step_key, arr);
  }

  // Unique projects
  const uniqueProjects = new Set(data.map((r) => r.project_id));
  const totalStarted = uniqueProjects.size;

  // Projects that have a "review" step completed
  const completedProjects = new Set(
    data
      .filter((r) => r.step_key === "review" && r.completed_at)
      .map((r) => r.project_id)
  );
  const completionRate = totalStarted > 0 ? (completedProjects.size / totalStarted) * 100 : 0;

  // Average total completion time (sum of durations per project, then average)
  const projectDurations = new Map<string, number>();
  for (const row of data) {
    if (row.duration_seconds) {
      projectDurations.set(
        row.project_id,
        (projectDurations.get(row.project_id) || 0) + row.duration_seconds
      );
    }
  }
  const durations = Array.from(projectDurations.values());
  const avgTotalTime = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  // Build ordered step stats
  // Determine step order from first project's data chronologically
  const stepOrder: string[] = [];
  const seen = new Set<string>();
  const sorted = [...data].sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
  for (const row of sorted) {
    if (!seen.has(row.step_key)) {
      seen.add(row.step_key);
      stepOrder.push(row.step_key);
    }
  }

  const stepStats: StepStats[] = stepOrder.map((key) => {
    const rows = byStep.get(key) || [];
    const completed = rows.filter((r) => r.completed_at);
    const skipped = rows.filter((r) => r.skipped);
    const withDuration = rows.filter((r) => r.duration_seconds != null);
    const avg = withDuration.length > 0
      ? Math.round(withDuration.reduce((a, r) => a + (r.duration_seconds || 0), 0) / withDuration.length)
      : 0;
    return {
      step_key: key,
      avgDuration: avg,
      totalStarted: rows.length,
      totalCompleted: completed.length,
      totalSkipped: skipped.length,
      dropOffRate: rows.length > 0 ? ((rows.length - completed.length) / rows.length) * 100 : 0,
    };
  });

  const maxDuration = Math.max(...stepStats.map((s) => s.avgDuration), 1);

  function formatDuration(seconds: number) {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }

  function formatStepName(key: string) {
    return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Started</p>
          <p className="text-2xl font-bold">{totalStarted}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold">{completedProjects.size}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completion Rate</p>
          <p className="text-2xl font-bold">{completionRate.toFixed(0)}%</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg Total Time</p>
          <p className="text-2xl font-bold">{formatDuration(avgTotalTime)}</p>
        </div>
      </div>

      {/* Step duration bar chart */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-4">Average Time Per Step</h3>
        <div className="space-y-3">
          {stepStats.map((s) => (
            <div key={s.step_key} className="flex items-center gap-3">
              <div className="w-36 text-sm text-right truncate shrink-0">
                {formatStepName(s.step_key)}
              </div>
              <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.max((s.avgDuration / maxDuration) * 100, 8)}%` }}
                >
                  <span className="text-xs font-medium text-white whitespace-nowrap">
                    {formatDuration(s.avgDuration)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drop-off table */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-4">Drop-off & Skip Rates</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Step</th>
                <th className="pb-2 font-medium text-right">Started</th>
                <th className="pb-2 font-medium text-right">Completed</th>
                <th className="pb-2 font-medium text-right">Skipped</th>
                <th className="pb-2 font-medium text-right">Drop-off</th>
              </tr>
            </thead>
            <tbody>
              {stepStats.map((s) => (
                <tr key={s.step_key} className="border-b last:border-0">
                  <td className="py-2 font-medium">{formatStepName(s.step_key)}</td>
                  <td className="py-2 text-right">{s.totalStarted}</td>
                  <td className="py-2 text-right">{s.totalCompleted}</td>
                  <td className="py-2 text-right">{s.totalSkipped}</td>
                  <td className="py-2 text-right">
                    <span
                      className={
                        s.dropOffRate > 20
                          ? "text-red-600 font-semibold"
                          : s.dropOffRate > 10
                            ? "text-amber-600 font-medium"
                            : "text-green-600"
                      }
                    >
                      {s.dropOffRate.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
