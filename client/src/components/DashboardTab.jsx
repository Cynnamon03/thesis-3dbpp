import React from "react";

export default function DashboardTab({ runHistory = [], setActiveTab }) {
  const totalRuns = runHistory.length;
  const avgRuntime = totalRuns > 0 
    ? (runHistory.reduce((acc, r) => acc + (r.runtime_s || 0), 0) / totalRuns).toFixed(2)
    : 0;
  
  const bestRun = totalRuns > 0
    ? runHistory.reduce((best, r) => ((r.space_util || 0) > (best.space_util || 0) ? r : best), runHistory[0])
    : null;
    
  const bestSpaceUtil = bestRun ? (bestRun.space_util).toFixed(1) : "0.0";
  const bestStrategy = bestRun ? bestRun.strategy : "—";

  // Calculate snapshot of space utilization for each algorithm (latest run)
  const algos = [
    { key: "DGWO", name: "Placement only" },
    { key: "MOGWO", name: "Rules only" },
    { key: "Sequential Hybrid", name: "Placement, then rules" },
    { key: "Repair-based Hybrid", name: "Fix as it goes" }
  ];

  const algoStats = algos.map(algo => {
    const runsForAlgo = runHistory.filter(r => r.strategy === algo.key);
    // get best space util for this algo
    const bestForAlgo = runsForAlgo.reduce((max, r) => Math.max(max, r.space_util || 0), 0);
    return {
      ...algo,
      hasRuns: runsForAlgo.length > 0,
      bestUtil: (bestForAlgo).toFixed(1)
    };
  });

  const recentRuns = [...runHistory].sort((a, b) => b.id - a.id).slice(0, 3);

  return (
    <>
      <div className="grid grid-4" style={{ marginBottom: "20px" }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="card-desc" style={{ margin: 0 }}>Space Utilization</span>
            <span className={bestRun && bestRun.space_util > 40 ? "badge badge-safe" : "badge badge-warn"}>
              {bestRun && bestRun.space_util > 40 ? "Good" : "Moderate"}
            </span>
          </div>
          <div className="font-display" style={{ fontSize: "30px", fontWeight: 600, marginTop: "8px" }}>{bestSpaceUtil}%</div>
          <div className="field-hint">Best run so far · {bestStrategy}</div>
        </div>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="card-desc" style={{ margin: 0 }}>Constraint Compliance</span>
            <span className={totalRuns > 0 ? "badge badge-safe" : "badge badge-neutral"}>{totalRuns > 0 ? "Passing" : "No runs"}</span>
          </div>
          <div className="font-display" style={{ fontSize: "30px", fontWeight: 600, marginTop: "8px" }}>
            0 <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink-faint)" }}>violations</span>
          </div>
          <div className="field-hint">Weight, fragility, stability, stop-order</div>
        </div>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="card-desc" style={{ margin: 0 }}>Avg. Runtime</span>
            <span className="badge badge-neutral">{totalRuns} configs</span>
          </div>
          <div className="font-display" style={{ fontSize: "30px", fontWeight: 600, marginTop: "8px" }}>
            {avgRuntime}<span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink-faint)" }}>s</span>
          </div>
          <div className="field-hint">Across all completed runs</div>
        </div>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="card-desc" style={{ margin: 0 }}>Experiment Progress</span>
            <span className={totalRuns > 0 ? "badge badge-primary" : "badge badge-neutral"}>{totalRuns > 0 ? "In progress" : "Not started"}</span>
          </div>
          <div className="font-display" style={{ fontSize: "30px", fontWeight: 600, marginTop: "8px" }}>
            {totalRuns} <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink-faint)" }}>runs</span>
          </div>
          <div className="field-hint">Total completed optimizations</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Algorithm comparison snapshot</div>
              <div className="card-desc">Highest space utilization achieved by each configuration</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('compare')}>View all →</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {algoStats.map(stat => (
              <div key={stat.key}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 600 }}>{stat.name} <span className="field-hint" style={{ fontWeight: 400 }}>({stat.key})</span></span>
                  <span className="mono" style={{ color: stat.hasRuns ? "var(--primary-dark)" : "var(--ink-faint)" }}>
                    {stat.hasRuns ? `${stat.bestUtil}%` : "—"}
                  </span>
                </div>
                <div style={{ height: "8px", background: "var(--surface-sunken)", borderRadius: "100px", overflow: "hidden" }}>
                  <div style={{ width: stat.hasRuns ? `${stat.bestUtil}%` : "0%", height: "100%", background: stat.hasRuns ? "var(--primary)" : "var(--border-strong)" }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="field-hint" style={{ marginTop: "14px" }}>
            Algorithms with no data have not completed a run yet.
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Recent activity</div>
              <div className="card-desc">Latest runs across the workspace</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recentRuns.length === 0 ? (
              <div className="field-hint" style={{ padding: "10px 0" }}>No recent activity. Start a run in the Logistics tab.</div>
            ) : (
              recentRuns.map((r, i) => (
                <div key={r.id} style={{ display: "flex", gap: "12px", padding: "10px 0", borderBottom: i < recentRuns.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--safe)", marginTop: "5px", flexShrink: 0 }}></div>
                  <div>
                    <div style={{ fontSize: "12.5px", fontWeight: 600 }}>Run #{String(r.id).padStart(3, '0')} completed</div>
                    <div className="field-hint" style={{ marginTop: "1px" }}>{r.strategy} · {r.runtime_s}s</div>
                  </div>
                  <div className="field-hint" style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>
                    {new Date(r.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
