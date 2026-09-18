import React, { useState } from "react";

export default function RunHistoryTab({ runHistory, handleExportHistory, onLoadVisualization }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("All methods");

  const filteredHistory = runHistory.filter((run) => {
    if (searchTerm && !run.instance.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterMethod !== "All methods" && run.strategy !== filterMethod) return false;
    return true;
  });

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Past runs</div>
          <div className="card-desc">Every packing attempt you've run, saved automatically</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input 
            type="text" 
            placeholder="Search past runs..." 
            style={{ width: "180px" }} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select style={{ width: "170px" }} value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
            <option>All methods</option>
            <option>DGWO</option>
            <option>MOGWO</option>
            <option>Sequential</option>
            <option>Repair-Based</option>
          </select>
          <button className="btn btn-secondary btn-sm" onClick={handleExportHistory}>Export all</button>
        </div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Load used</th>
            <th>Method</th>
            <th>Containers used</th>
            <th>Space used</th>
            <th>Time taken</th>
            <th>Memory used</th>
            <th>Finished</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: "center", padding: "32px", color: "var(--ink-faint)" }}>
                No run history found. Run an optimization first!
              </td>
            </tr>
          ) : (
            filteredHistory.map((run, idx) => (
              <tr key={idx}>
                <td className="mono">#{String(idx + 1).padStart(3, "0")}</td>
                <td>{run.instance} ({run.n_items} items)</td>
                <td>
                  <span className={`badge ${run.strategy === "Repair-Based" || run.strategy === "Sequential" ? "badge-primary" : "badge-neutral"}`}>
                    {run.strategy}
                  </span>
                </td>
                <td>{run.bins_used}</td>
                <td className="mono">{run.space_util?.toFixed(2)}%</td>
                <td className="mono">{run.runtime_s?.toFixed(2)}s</td>
                <td className="mono">—</td>
                <td>{new Date(run.timestamp).toLocaleString()}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => onLoadVisualization(run)}>View</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="field-hint" style={{ marginTop: "14px" }}>The Memory used column will fill in once memory tracking is fully propagated in DB.</div>
    </div>
  );
}
