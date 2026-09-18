import React from "react";
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

  // Thesis scoring heuristic
  const isPerfectCompliance = m2 === 100;
  const isGoodSpace = m1 > 40;
  let scoreClass = isPerfectCompliance ? "badge-safe" : (m2 > 50 ? "badge-warn" : "badge-danger");
  let scoreText = isPerfectCompliance ? "Optimal" : (m2 > 50 ? "Acceptable" : "Critical Failure");

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <div className="card-desc" style={{ margin: 0 }}>Final optimization metrics based on thesis SOP requirements.</div>
        <span className="badge badge-primary">Current Run — {strategy}</span>
      </div>

      <div className="grid grid-4" style={{ marginBottom: "20px" }}>
        <div className="card">
          <div className="card-desc" style={{ margin: 0 }}>M-1: Space Utilization</div>
          <div className="font-display" style={{ fontSize: "26px", fontWeight: 600, marginTop: "6px" }}>{m1.toFixed(2)}%</div>
          <div className="field-hint">Percent of container volume filled</div>
        </div>
        <div className="card">
          <div className="card-desc" style={{ margin: 0 }}>M-2: Constraint Satisfaction</div>
          <div className="font-display" style={{ fontSize: "26px", fontWeight: 600, marginTop: "6px", color: isPerfectCompliance ? "var(--safe)" : "var(--danger)" }}>
            {m2.toFixed(2)}%
          </div>
          <div className="field-hint">Percentage of placement rules satisfied</div>
        </div>
        <div className="card">
          <div className="card-desc" style={{ margin: 0 }}>M-3: Execution Time</div>
          <div className="font-display" style={{ fontSize: "26px", fontWeight: 600, marginTop: "6px" }}>{m3.toFixed(2)}s</div>
          <div className="field-hint">{stats ? stats.iteration : maxIter} solver cycles</div>
        </div>
        <div className="card">
          <div className="card-desc" style={{ margin: 0 }}>M-4: Peak Memory</div>
          <div className="font-display" style={{ fontSize: "26px", fontWeight: 600, marginTop: "6px" }}>{m4.toFixed(2)} MB</div>
          <div className="field-hint">Maximum RAM footprint</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start", marginBottom: "20px" }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Safety &amp; delivery-order checks</div>
              <div className="card-desc">Does the packing plan follow the rules that keep cargo safe and easy to unload?</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div className="compliance-row">
              <span>Stays under weight limit (C3)</span>
              <span className={`badge ${metrics?.details?.C3_weight_pct === 100 ? "badge-safe" : "badge-danger"}`}>
                {metrics?.details?.C3_weight_pct === 100 ? "Passed" : "Failed"}
              </span>
            </div>
            <div className="compliance-row">
              <span>Fragile items protected (C4)</span>
              <span className={`badge ${metrics?.details?.C4_fragility_pct === 100 ? "badge-safe" : "badge-danger"}`}>
                {metrics?.details?.C4_fragility_pct === 100 ? "Passed" : "Failed"}
              </span>
            </div>
            <div className="compliance-row">
              <span>Load is stable, won't tip (C5)</span>
              <span className={`badge ${metrics?.details?.C5_balance_pct === 100 ? "badge-safe" : "badge-danger"}`}>
                {metrics?.details?.C5_balance_pct === 100 ? "Passed" : "Failed"}
              </span>
            </div>
            <div className="compliance-row" style={{ borderBottom: "none" }}>
              <span>Items unload in the right order (C6)</span>
              <span className={`badge ${metrics?.details?.C6_stop_order_pct === 100 ? "badge-safe" : "badge-danger"}`}>
                {metrics?.details?.C6_stop_order_pct === 100 ? "Passed" : "Failed"}
              </span>
            </div>
          </div>
          <style>{`.compliance-row{ display:flex; align-items:center; justify-content:space-between; padding:11px 2px; border-bottom:1px solid var(--border); font-size:12.5px; font-weight:600; }`}</style>
          <div className="field-hint" style={{ marginTop: "12px" }}>
            The Repair-Based Hybrid actively enforces these checks, whereas Standard heuristics do not guarantee safety.
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Score summary</div>
              <div className="card-desc">A quick read on how good this run was, all factors combined</div>
            </div>
          </div>
          <table>
            <tbody>
              <tr><td>Overall assessment</td><td style={{ textAlign: "right" }}><span className={`badge ${scoreClass}`}>{scoreText}</span></td></tr>
              <tr><td>Space efficiency (M-1)</td><td style={{ textAlign: "right" }} className="mono">{m1.toFixed(2)}%</td></tr>
              <tr><td>Constraint satisfaction (M-2)</td><td style={{ textAlign: "right" }} className="mono">{m2.toFixed(2)}%</td></tr>
              <tr><td>Result reliability (M-5)</td><td style={{ textAlign: "right" }} className="mono">Variance: {m5.toFixed(3)}</td></tr>
              <tr><td>Axis utilization (X / Y / Z)</td><td style={{ textAlign: "right" }} className="mono">{axisUtil.x}% / {axisUtil.y}% / {axisUtil.z}%</td></tr>
              <tr><td>Total Bins Used</td><td style={{ textAlign: "right" }} className="mono">{finalResult.bins_used}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Convergence History</div>
            <div className="card-desc">Fitness optimization trace across {stats?.iteration || maxIter} iterations</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExportResultsCSV}>Export CSV</button>
            <button className="btn btn-primary btn-sm" onClick={handleExportReport}>Export report</button>
          </div>
        </div>
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
        <div style={{ display: "flex", gap: "18px", fontSize: "11.5px", color: "var(--ink-faint)", marginTop: "14px" }}>
          <span><span style={{ display: "inline-block", width: "10px", height: "2px", background: "var(--primary)", marginRight: "5px" }}></span>Bins used (Left Axis)</span>
          <span><span style={{ display: "inline-block", width: "10px", height: "2px", background: "var(--blush)", marginRight: "5px" }}></span>Fitness score (Right Axis)</span>
        </div>
      </div>
    </>
  );
}
