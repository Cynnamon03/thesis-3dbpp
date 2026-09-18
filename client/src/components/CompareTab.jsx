import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export default function CompareTab({ runHistory = [] }) {
  const [selectedRunIds, setSelectedRunIds] = useState([]);
  
  // Get unique runs to populate the dropdowns
  const availableRuns = [...runHistory].sort((a, b) => b.id - a.id);
  
  const toggleRunSelection = (id) => {
    if (selectedRunIds.includes(id)) {
      setSelectedRunIds(selectedRunIds.filter(runId => runId !== id));
    } else {
      if (selectedRunIds.length < 4) {
        setSelectedRunIds([...selectedRunIds, id]);
      } else {
        alert("You can compare up to 4 runs at a time.");
      }
    }
  };

  const selectedRuns = availableRuns.filter(r => selectedRunIds.includes(r.id));
  
  // Format data for recharts
  const chartData = selectedRuns.map(r => ({
    name: `Run ${String(r.id).padStart(3, '0')}`,
    spaceUtil: parseFloat((r.space_util).toFixed(1)),
    runtime: parseFloat(r.runtime_s.toFixed(1)),
    strategy: r.strategy,
    items: r.n_items
  }));

  const colors = ['var(--primary)', 'var(--safe)', 'var(--warn)', 'var(--blush)'];

  return (
    <>
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-head">
          <div>
            <div className="card-title">Select Runs to Compare</div>
            <div className="card-desc">Choose up to 4 runs to compare their performance metrics side-by-side.</div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {availableRuns.length === 0 ? (
            <div className="field-hint">No completed runs available. Please complete a run in the Logistics tab first.</div>
          ) : (
            availableRuns.map((run) => {
              const isSelected = selectedRunIds.includes(run.id);
              return (
                <button 
                  key={run.id}
                  type="button"
                  onClick={() => toggleRunSelection(run.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-strong)",
                    background: isSelected ? "var(--primary-tint)" : "var(--surface)",
                    color: isSelected ? "var(--primary)" : "var(--ink-soft)",
                    fontWeight: isSelected ? "700" : "500",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  Run #{String(run.id).padStart(3, '0')} ({run.n_items} items, {run.strategy})
                </button>
              );
            })
          )}
        </div>
        {selectedRunIds.length > 0 && (
          <div style={{ marginTop: "14px" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedRunIds([])}>Clear selection</button>
          </div>
        )}
      </div>

      {selectedRuns.length > 0 ? (
        <>
          <div className="card" style={{ marginBottom: "20px", overflowX: "auto" }}>
            <div className="card-head">
              <div>
                <div className="card-title">Metrics Comparison</div>
                <div className="card-desc">Detailed metrics for selected runs</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Method</th>
                  <th>Items Packed</th>
                  <th>Space Used</th>
                  <th>Containers Used</th>
                  <th>Time Taken</th>
                  <th>Constraint Violations</th>
                </tr>
              </thead>
              <tbody>
                {selectedRuns.map(run => (
                  <tr key={run.id}>
                    <td style={{ fontWeight: 700 }}>#{String(run.id).padStart(3, '0')}</td>
                    <td>{run.strategy}</td>
                    <td className="mono">{run.n_items}</td>
                    <td className="mono" style={{ color: "var(--primary-dark)", fontWeight: 700 }}>{(run.space_util).toFixed(1)}%</td>
                    <td className="mono">{run.bins_used}</td>
                    <td className="mono">{run.runtime_s.toFixed(1)}s</td>
                    <td><span className="badge badge-safe">0</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-2" style={{ alignItems: "start" }}>
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Space Utilization Comparison</div>
                  <div className="card-desc">Percent of container space actually filled by each method (higher is better)</div>
                </div>
              </div>
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--ink-soft)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--ink-faint)" }} domain={[0, 100]} />
                    <Tooltip cursor={{ fill: 'var(--surface-sunken)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
                    <Bar dataKey="spaceUtil" name="Space Utilization (%)" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Execution Time Comparison</div>
                  <div className="card-desc">Time taken to finish the optimization run (lower is better)</div>
                </div>
              </div>
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--ink-soft)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--ink-faint)" }} />
                    <Tooltip cursor={{ fill: 'var(--surface-sunken)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
                    <Bar dataKey="runtime" name="Runtime (seconds)" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card" style={{ padding: "40px 20px", textAlign: "center" }}>
          <div style={{ color: "var(--ink-faint)", fontSize: "14px" }}>Select runs from above to see comparison charts.</div>
        </div>
      )}
    </>
  );
}
