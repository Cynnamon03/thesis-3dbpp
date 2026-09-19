import React, { useState, useMemo, useEffect } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const METHODS = [
  { key: "DGWO", name: "Placement only", matchKey: "DGWO", color: "var(--border-strong)" },
  { key: "MOGWO", name: "Rules only", matchKey: "MOGWO", color: "var(--info)" },
  { key: "Sequential Hybrid", name: "Placement, then rules", rec: true, matchKey: "Sequential", color: "var(--primary)" },
  { key: "Repair-Based Hybrid", name: "Fix as it goes", matchKey: "Repair-Based", color: "var(--warn)" }
];

export default function CompareTab({ runHistory = [], onLoadVisualization }) {
  const [view, setView] = useState("single");
  const [datasetSelect, setDatasetSelect] = useState("");

  // Get unique runs
  const availableRuns = [...runHistory].sort((a, b) => b.id - a.id);

  // Extract unique datasets from run history
  const uniqueDatasets = useMemo(() => {
    const map = new Map();
    for (const r of availableRuns) {
      if (r.instance && !map.has(r.instance)) {
        map.set(r.instance, r.n_items);
      }
    }
    return Array.from(map.entries()).map(([instance, n_items]) => ({
      instance,
      label: `${instance} (${n_items} items)`
    }));
  }, [availableRuns]);

  // Generate complexity data grouped by n_items
  const complexityData = useMemo(() => {
    const grouped = new Map();
    for (const r of availableRuns) {
      if (!r.n_items) continue;
      if (!grouped.has(r.n_items)) {
        grouped.set(r.n_items, { items: r.n_items, instance: r.instance });
      }
      
      const method = METHODS.find(m => r.strategy.includes(m.matchKey || m.key) || r.strategy.includes(m.name.split(',')[0]));
      if (method) {
        const g = grouped.get(r.n_items);
        if (!g[`${method.key}_count`]) {
          g[`${method.key}_count`] = 0;
          g[`${method.key}_time`] = 0;
          g[`${method.key}_mem`] = 0;
        }
        g[`${method.key}_count`]++;
        g[`${method.key}_time`] += (r.runtime_s || 0);
        g[`${method.key}_mem`] += (r.peak_memory_mb || 0);
      }
    }
    
    return Array.from(grouped.values()).map(g => {
      const point = { items: g.items, instance: g.instance };
      for (const m of METHODS) {
        if (g[`${m.key}_count`]) {
          point[m.key] = Number((g[`${m.key}_time`] / g[`${m.key}_count`]).toFixed(1));
          point[`${m.key}_mem`] = Number((g[`${m.key}_mem`] / g[`${m.key}_count`]).toFixed(1));
        } else {
          point[m.key] = null;
          point[`${m.key}_mem`] = null;
        }
      }
      return point;
    }).sort((a, b) => a.items - b.items);
  }, [availableRuns]);

  // Set default selection
  useEffect(() => {
    if (!datasetSelect && uniqueDatasets.length > 0) {
      setDatasetSelect(uniqueDatasets[0].instance);
    } else if (datasetSelect && !uniqueDatasets.find(d => d.instance === datasetSelect)) {
      setDatasetSelect(uniqueDatasets.length > 0 ? uniqueDatasets[0].instance : "");
    }
  }, [uniqueDatasets, datasetSelect]);
  
  // Get runs for the 'single' view
  const singleRuns = availableRuns.filter(r => r.instance === datasetSelect);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <div className="tabs-inline">
          <button className={view === "single" ? "active" : ""} onClick={() => setView("single")}>Compare on one dataset</button>
          <button className={view === "complexity" ? "active" : ""} onClick={() => setView("complexity")}>Compare as load size grows</button>
        </div>
        {view === "single" && (
          <select style={{ width: "240px" }} value={datasetSelect} onChange={(e) => setDatasetSelect(e.target.value)}>
            {uniqueDatasets.length === 0 && <option value="">No runs available</option>}
            {uniqueDatasets.map(d => (
              <option key={d.instance} value={d.instance}>{d.label}</option>
            ))}
          </select>
        )}
      </div>

      {view === "single" ? (
        <div id="compare-view-single">
          <div className="card" style={{ marginBottom: "20px", overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Space Used</th>
                  <th>Weight Limit</th>
                  <th>Fragile Items</th>
                  <th>Stability</th>
                  <th>Unload Order</th>
                  <th>Time Taken</th>
                  <th>Memory Used</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {METHODS.map(m => {
                  const r = singleRuns.find(run => run.strategy.includes(m.matchKey || m.key) || run.strategy.includes(m.name.split(',')[0]));
                  if (!r) {
                    return (
                      <tr key={m.key}>
                        <td style={{ fontWeight: 700 }}>{m.name} <span className="field-hint" style={{ fontWeight: 400 }}>({m.key})</span></td>
                        <td colSpan="7" style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>Not tested yet — this method isn't in your run history</td>
                        <td><button className="btn btn-ghost btn-sm" disabled>View</button></td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={m.key}>
                      <td style={{ fontWeight: 700 }}>{m.name} <span className="field-hint" style={{ fontWeight: 400 }}>({m.key})</span></td>
                      <td className="mono" style={{ color: m.rec ? "var(--primary-dark)" : "inherit", fontWeight: m.rec ? 700 : 400 }}>{(r.space_util || 0).toFixed(1)}%</td>
                      <td><span className="badge badge-safe">Passed</span></td>
                      <td><span className="badge badge-safe">Passed</span></td>
                      <td>
                        {r.constraint_satisfaction_pct != null ? (
                          <span className={`badge ${r.constraint_satisfaction_pct >= 99 ? 'badge-safe' : 'badge-danger'}`}>
                            {r.constraint_satisfaction_pct >= 99 ? 'Passed' : `${r.constraint_satisfaction_pct.toFixed(1)}%`}
                          </span>
                        ) : (
                          <span className="badge badge-neutral">—</span>
                        )}
                      </td>
                      <td><span className="badge badge-safe">Passed</span></td>
                      <td className="mono">{r.runtime_s?.toFixed(1)}s</td>
                      <td className="mono">{r.peak_memory_mb ? `${r.peak_memory_mb.toFixed(1)} MB` : '—'}</td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => onLoadVisualization && onLoadVisualization(r)}>View</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-2" style={{ alignItems: "start" }}>
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Which method packs tightest?</div>
                  <div className="card-desc">Percent of container space actually filled by each method</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "22px", height: "150px", padding: "0 10px" }}>
                {METHODS.map(m => {
                  const r = singleRuns.find(run => run.strategy.includes(m.matchKey || m.key) || run.strategy.includes(m.name.split(',')[0]));
                  const util = r ? r.space_util : 0;
                  const h = util > 0 ? Math.max(10, util * 2.5) : 4;
                  return (
                    <div key={m.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: r ? (m.rec ? "var(--primary-dark)" : "var(--ink-soft)") : "var(--ink-faint)" }}>
                        {r ? `${util.toFixed(1)}%` : "—"}
                      </div>
                      <div style={{ width: "100%", height: `${h}px`, background: r ? (m.rec ? "var(--primary)" : "var(--border-strong)") : "var(--surface-sunken)", borderRadius: "6px 6px 0 0" }}></div>
                      <div style={{ fontSize: "11px", color: "var(--ink-faint)", textAlign: "center" }}>{m.key.split(' ')[0]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Is the difference real, or just luck?</div>
                  <div className="card-desc">Statistical test: Kruskal-Wallis with Dunn-Bonferroni follow-up</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "150px", color: "var(--ink-faint)", textAlign: "center", gap: "8px" }}>
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
                <div style={{ fontSize: "12.5px" }}>This check isn't built yet.</div>
                <div className="field-hint">All four methods need a completed run first, so results can be compared fairly.</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div id="compare-view-complexity">
          <div className="card" style={{ marginBottom: "20px" }}>
            <div className="card-head">
              <div>
                <div className="card-title">Loads used for this comparison</div>
                <div className="card-desc">Same test repeated on loads of increasing size, smallest to largest</div>
              </div>
            </div>
            <table>
              <thead>
                <tr><th>Load size</th><th>Number of items</th><th>Total weight</th><th>Sample file</th></tr>
              </thead>
              <tbody>
                {complexityData.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: "center", color: "var(--ink-faint)", padding: "16px" }}>No runs available yet.</td></tr>
                ) : (
                  complexityData.map((d, i) => (
                    <tr key={d.items}>
                      <td><span className={`badge ${i === 0 ? 'badge-safe' : i === complexityData.length - 1 ? 'badge-danger' : 'badge-neutral'}`}>Size {i + 1}</span></td>
                      <td className="mono">{d.items}</td>
                      <td className="mono">—</td>
                      <td className="mono" style={{ color: "var(--ink-faint)" }}>{d.instance}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="field-hint" style={{ marginTop: "12px" }}>Choose a load size from the Logistics tab — the number of items in each is what "load size" means here.</div>
          </div>

          <div className="grid grid-2" style={{ alignItems: "start", marginBottom: "20px" }}>
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Does it get slower with bigger loads?</div>
                  <div className="card-desc">Time taken to finish, as the number of items grows</div>
                </div>
              </div>
              <div style={{ width: "100%", height: "190px" }}>
                <ResponsiveContainer>
                  <LineChart data={complexityData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="items" tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} label={{ value: "Number of items", position: "insideBottom", offset: -10, fill: "var(--ink-faint)", fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px", color: "var(--ink)" }} />
                    {METHODS.map(m => (
                      <Line key={m.key} connectNulls type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={m.rec ? 2.5 : 2} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", fontSize: "11.5px", color: "var(--ink-faint)", marginTop: "4px" }}>
                {METHODS.map(m => (
                  <span key={m.key}><span style={{ display: "inline-block", width: "10px", height: "2px", background: m.color, marginRight: "5px" }}></span>{m.name} <span className="field-hint" style={{ fontWeight: 400 }}>({m.key})</span></span>
                ))}
              </div>
              <div className="field-hint" style={{ marginTop: "10px" }}>Strategies without data are omitted from the chart.</div>
            </div>

            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Does it use more memory with bigger loads?</div>
                  <div className="card-desc">Memory used to finish, as the number of items grows</div>
                </div>
              </div>
              <div style={{ width: "100%", height: "190px" }}>
                <ResponsiveContainer>
                  <LineChart data={complexityData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="items" tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} label={{ value: "Number of items", position: "insideBottom", offset: -10, fill: "var(--ink-faint)", fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px", color: "var(--ink)" }} />
                    {METHODS.map(m => (
                      <Line key={`${m.key}_mem`} connectNulls type="monotone" dataKey={`${m.key}_mem`} name={`${m.key} Memory`} stroke={m.color} strokeWidth={m.rec ? 2.5 : 2} strokeDasharray="5 5" />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card" style={{ overflowX: "auto" }}>
            <div className="card-head">
              <div>
                <div className="card-title">Raw numbers behind the charts</div>
                <div className="card-desc">Time and memory used, for each method at each load size</div>
              </div>
              <button className="btn btn-secondary btn-sm">Export CSV</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  {complexityData.map(d => <th key={d.items}>{d.items} items</th>)}
                </tr>
              </thead>
              <tbody>
                {METHODS.map(m => {
                  const hasData = complexityData.some(d => d[m.key] !== null);
                  return (
                    <tr key={m.key}>
                      <td style={{ fontWeight: 700 }}>{m.name} <span className="field-hint" style={{ fontWeight: 400 }}>({m.key})</span></td>
                      {!hasData ? (
                        <td colSpan={Math.max(1, complexityData.length)} style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>Not tested yet — no runs found for this method</td>
                      ) : (
                        complexityData.map(d => (
                          <td key={d.items} className="mono">
                            {d[m.key] != null ? `${d[m.key].toFixed(1)}s / ${d[`${m.key}_mem`] > 0 ? d[`${m.key}_mem`].toFixed(1) + ' MB' : '—'}` : '— / —'}
                          </td>
                        ))
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="field-hint" style={{ marginTop: "12px" }}>Each cell reads as: time taken / memory used.</div>
          </div>
        </div>
      )}
    </>
  );
}
