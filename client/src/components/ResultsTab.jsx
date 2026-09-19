import React, { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function ResultsTab({
  finalResult,
  runHistory,
  strategy,
  stats,
  axisUtil,
  chartData,
  maxIter,
  handleExportResultsCSV,
  handleExportReport
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!finalResult) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh", color: "var(--ink-faint)" }}>
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: "16px" }}>
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        </svg>
        <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink)" }}>No results to display</div>
        <div style={{ fontSize: "13px", marginTop: "4px" }}>Run an optimization in the Logistics tab to see results here.</div>
      </div>
    );
  }

  const { metrics } = finalResult;
  const m1 = metrics?.M1_space_utilization_pct || 0;
  const m2 = metrics?.M2_constraint_satisfaction_pct || 0;
  const m3 = metrics?.M3_execution_time_s || finalResult.runtime_s || 0;
  const m4 = metrics?.M4_peak_memory_mb || 0;
  const m5 = metrics?.M5_robustness || 0;

  const totalItems = finalResult.items?.length || 0;
  const binsUsed = finalResult.bins_used || 1;

  const c3WeightPassed = metrics?.constraint_detail?.C3_weight_pct === 100;
  const c4FragilityPassed = metrics?.constraint_detail?.C4_fragility_pct === 100;
  const c5BalancePassed = metrics?.constraint_detail?.C5_balance_pct === 100;
  const c6StopPassed = metrics?.constraint_detail?.C6_stop_order_pct === 100;

  const numPassed = [c3WeightPassed, c4FragilityPassed, c5BalancePassed, c6StopPassed].filter(Boolean).length;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <div className="card-desc" style={{ margin: 0 }}>Here's how your items fit, and whether the plan is safe to load</div>
        <span className="badge badge-primary">Current Run — {strategy}</span>
      </div>

      {/* Headline result, in plain language */}
      <div className="card" style={{ marginBottom: "20px", padding: "28px", textAlign: "center", background: "linear-gradient(155deg, var(--primary-tint), var(--surface))" }}>
        <div className="field-hint" style={{ marginBottom: "6px" }}>Your container is</div>
        <div className="font-display" style={{ fontSize: "44px", fontWeight: 700, color: "var(--primary-dark)" }}>{m1.toFixed(1)}% full</div>
        <div style={{ color: "var(--ink-soft)", fontSize: "13px", maxWidth: "440px", margin: "10px auto 0 auto" }}>
          {totalItems} items were packed across {binsUsed} containers. There's still room to tighten this further — a fuller container means fewer trips.
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "18px" }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportResultsCSV}>Export CSV</button>
          <button className="btn btn-primary btn-sm" onClick={handleExportReport}>Export report</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-head">
          <div>
            <div className="card-title">Is this load safe to ship?</div>
            <div className="card-desc">Does the packing plan follow the rules that keep cargo safe and easy to unload?</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div className="compliance-row">
            <span>Stays under weight limit</span>
            <span className={`badge ${c3WeightPassed ? "badge-safe" : "badge-danger"}`}>{c3WeightPassed ? "Passed" : "Failed"}</span>
          </div>
          <div className="compliance-row">
            <span>Fragile items protected</span>
            <span className={`badge ${c4FragilityPassed ? "badge-safe" : "badge-danger"}`}>{c4FragilityPassed ? "Passed" : "Failed"}</span>
          </div>
          <div className="compliance-row">
            <span>Load is stable, won't tip</span>
            <span className={`badge ${c5BalancePassed ? "badge-safe" : "badge-danger"}`}>{c5BalancePassed ? "Passed" : "Failed"}</span>
          </div>
          <div className="compliance-row" style={{ borderBottom: "none" }}>
            <span>Items unload in the right order</span>
            <span className={`badge ${c6StopPassed ? "badge-safe" : "badge-danger"}`}>{c6StopPassed ? "Passed" : "Failed"}</span>
          </div>
        </div>
        <style>{`.compliance-row{ display:flex; align-items:center; justify-content:space-between; padding:11px 2px; border-bottom:1px solid var(--border); font-size:12.5px; font-weight:600; }`}</style>
      </div>

      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-head">
          <div>
            <div className="card-title">Current Solution Analysis</div>
            <div className="card-desc">Detailed metrics for the {strategy} packing configuration</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "22px", flexWrap: "wrap", marginBottom: "16px" }}>
          <div><span className="field-hint">Space Utilization</span><div style={{ fontWeight: 700, fontSize: "14px", marginTop: "2px" }}>{m1.toFixed(1)}% <span className={m1 > 40 ? "badge badge-safe" : "badge badge-neutral"} style={{ marginLeft: "4px" }}>{m1 > 40 ? "Good" : "Moderate"}</span></div></div>
          <div><span className="field-hint">Constraint Satisfaction</span><div style={{ fontWeight: 700, fontSize: "14px", marginTop: "2px" }}>{numPassed} of 4 checked rules passed</div></div>
          <div><span className="field-hint">Computational Cost</span><div style={{ fontWeight: 700, fontSize: "14px", marginTop: "2px" }}>{m3.toFixed(1)}s</div></div>
          <div><span className="field-hint">Robustness</span><div style={{ fontWeight: 700, fontSize: "14px", marginTop: "2px" }}>Variance: {m5.toFixed(3)}</div></div>
        </div>

        <div className="divider"></div>

        <div className="card-desc" style={{ marginBottom: "10px" }}>Convergence History (Fitness optimization trace across {stats?.iteration || maxIter} iterations)</div>
        <div style={{ width: "100%", height: "200px" }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="iter" tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px", color: "var(--ink)" }}
                itemStyle={{ color: "var(--ink)" }}
              />
              <Line yAxisId="left" type="stepAfter" dataKey="bins" stroke="var(--primary)" strokeWidth={2} dot={false} name="Bins Used" />
              <Line yAxisId="right" type="monotone" dataKey="composite" stroke="var(--blush)" strokeWidth={2} dot={false} name="Fitness" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <button className="btn btn-secondary btn-sm" onClick={() => setShowAdvanced(!showAdvanced)} style={{ marginBottom: "14px" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
        {showAdvanced ? "Hide advanced / technical details" : "Show advanced / technical details"}
      </button>

      {showAdvanced && (
        <div id="advancedDetailsPanel">
          <div className="grid grid-4" style={{ marginBottom: "20px" }}>
            <div className="card">
              <div className="card-desc" style={{ margin: 0 }}>Space Used (NAB)</div>
              <div className="font-display" style={{ fontSize: "26px", fontWeight: 600, marginTop: "6px" }}>{m1.toFixed(1)}%</div>
              <div className="field-hint">Percent of container volume filled</div>
            </div>
            <div className="card">
              <div className="card-desc" style={{ margin: 0 }}>Optimality Gap</div>
              <div className="font-display" style={{ fontSize: "26px", fontWeight: 600, marginTop: "6px", color: "var(--warn)" }}>{Math.max(0, 100 - m1).toFixed(1)}%</div>
              <div className="field-hint">How far this is from the theoretical lower bound</div>
            </div>
            <div className="card">
              <div className="card-desc" style={{ margin: 0 }}>Runtime</div>
              <div className="font-display" style={{ fontSize: "26px", fontWeight: 600, marginTop: "6px" }}>{m3.toFixed(1)}s</div>
              <div className="field-hint">{stats ? stats.iteration : maxIter} solver iterations</div>
            </div>
            <div className="card">
              <div className="card-desc" style={{ margin: 0 }}>Memory Used</div>
              <div className="font-display" style={{ fontSize: "26px", fontWeight: 600, marginTop: "6px" }}>{m4 > 0 ? `${m4.toFixed(2)} MB` : "—"}</div>
              <div className="field-hint">{m4 > 0 ? "Measured peak memory" : "Not measured yet in this build"}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Score summary</div>
                <div className="card-desc">The full mathematical breakdown behind the headline number above</div>
              </div>
            </div>
            <table>
              <tbody>
                <tr><td>Composite score (M2 - Constraints)</td><td style={{ textAlign: "right" }}><span className="badge badge-safe">{m2.toFixed(1)}% — Good</span></td></tr>
                <tr><td>NAB (space fill)</td><td style={{ textAlign: "right" }} className="mono">{(m1/100).toFixed(3)}</td></tr>
                <tr><td>Dissipation D(X) (C1=C2=0.5)</td><td style={{ textAlign: "right" }} className="mono">{finalResult.dissipation ? finalResult.dissipation.toFixed(3) : "—"}</td></tr>
                <tr><td>Consistency across repeat runs (CV)</td><td style={{ textAlign: "right" }} className="mono">{m5.toFixed(3)}</td></tr>
                <tr><td>Axis utilization (X / Y / Z)</td><td style={{ textAlign: "right" }} className="mono">{axisUtil.x}% / {axisUtil.y}% / {axisUtil.z}%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
