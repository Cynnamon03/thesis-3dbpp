import React, { useState } from "react";

export default function RunHistoryTab({ runHistory, handleExportHistory, onLoadVisualization }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("All methods");

  const methodMapping = {
    "All methods": "All methods",
    "Placement only": "DGWO",
    "Rules only": "MOGWO",
    "Placement, then rules": "Sequential",
    "Fix as it goes": "Repair-Based"
  };

  const filteredHistory = runHistory.filter((run) => {
    if (searchTerm && !run.instance.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterMethod !== "All methods") {
      const internalMethod = methodMapping[filterMethod];
      if (internalMethod && !run.strategy.includes(internalMethod)) return false;
    }
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
            <option>Placement only</option>
            <option>Rules only</option>
            <option>Placement, then rules</option>
            <option>Fix as it goes</option>
          </select>
          <button className="btn btn-secondary btn-sm" onClick={handleExportHistory}>Export all</button>
        </div>
      </div>
      <table>
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
                  <span className={`badge ${run.strategy.includes("Repair") || run.strategy.includes("Sequential") ? "badge-primary" : "badge-neutral"}`}>
                    {run.strategy}
                  </span>
                </td>
                <td>{run.bins_used}</td>
                <td className="mono">{run.space_util?.toFixed(2)}%</td>
                <td className="mono">{run.runtime_s?.toFixed(2)}s</td>
                <td className="mono">{run.peak_memory_mb ? `${run.peak_memory_mb.toFixed(1)} MB` : '—'}</td>
                <td>{new Date(run.created_at || run.timestamp).toLocaleString()}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => onLoadVisualization(run)}>View</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
