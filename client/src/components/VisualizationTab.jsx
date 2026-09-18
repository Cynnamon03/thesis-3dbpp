import React, { useState, useMemo, useCallback } from "react";
import BinViewer from "../BinViewer";

export default function VisualizationTab({
  placements,
  itemsList,
  instanceInfo,
  binsUsed,
  running,
  isBenchmarking,
  benchmarkResults
}) {
  // Visualization Control states (encapsulated locally)
  const [viewportOrientation, setViewportOrientation] = useState("3D");
  const [viewportTrigger, setViewportTrigger] = useState(0);
  const [filterStandard, setFilterStandard] = useState(true);
  const [filterFragile, setFilterFragile] = useState(true);

  const [showLabels, setShowLabels] = useState(false);
  const [selectedStop, setSelectedStop] = useState("All");
  const [selectedItemInfo, setSelectedItemInfo] = useState(null);

  const triggerViewReset = useCallback((dir) => {
    setViewportOrientation(dir);
    setViewportTrigger((prev) => prev + 1);
  }, []);

  // Derived stops from placements
  const uniqueStops = useMemo(() => {
    if (!placements) return [1];
    const stopsSet = new Set();
    for (const p of placements) {
      if (p.stop !== undefined) stopsSet.add(p.stop);
    }
    const sortedStops = Array.from(stopsSet).sort((a, b) => a - b);
    return sortedStops.length > 0 ? sortedStops : [1];
  }, [placements]);

  // Filtered placements for viewport visualization
  const filteredPlacements = useMemo(() => {
    if (!placements) return null;
    return placements.filter((p) => {
      if (selectedStop !== "All" && p.stop !== Number(selectedStop)) return false;
      const origItem = itemsList.find((it) => it.id === p.id);
      const type = origItem ? origItem.Type : (p.type || "Standard");
      if (type === "Standard") return filterStandard;
      if (type === "Fragile") return filterFragile;
      return true;
    });
  }, [placements, itemsList, filterStandard, filterFragile, selectedStop]);

  return (
    <div className="grid" style={{ gridTemplateColumns: "260px 1fr", alignItems: "start" }}>
      <div className="card">
        <div className="section-tag">View controls</div>
        <div className="grid grid-2" style={{ marginBottom: "14px" }}>
          <button className={`btn btn-sm ${viewportOrientation === 'Front' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => triggerViewReset("Front")}>Front</button>
          <button className={`btn btn-sm ${viewportOrientation === 'Side' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => triggerViewReset("Side")}>Side</button>
          <button className={`btn btn-sm ${viewportOrientation === 'Top' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => triggerViewReset("Top")}>Top</button>
          <button className={`btn btn-sm ${viewportOrientation === '3D' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => triggerViewReset("3D")}>3D</button>
        </div>
        <div className="divider"></div>
        <div className="section-tag">Filter by type</div>
        <div className="constraint-row">
          <span style={{ fontSize: "12.5px", fontWeight: 600 }}>Standard</span>
          <label className="switch"><input type="checkbox" checked={filterStandard} onChange={(e) => setFilterStandard(e.target.checked)} /><span className="slider"></span></label>
        </div>
        <div className="constraint-row" style={{ borderBottom: "none" }}>
          <span style={{ fontSize: "12.5px", fontWeight: 600 }}>Fragile</span>
          <label className="switch"><input type="checkbox" checked={filterFragile} onChange={(e) => setFilterFragile(e.target.checked)} /><span className="slider"></span></label>
        </div>
        
        <div className="divider"></div>
        <div className="section-tag">Labels</div>
        <div className="constraint-row" style={{ borderBottom: "none" }}>
          <span style={{ fontSize: "12.5px", fontWeight: 600 }}>Item IDs</span>
          <label className="switch"><input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} /><span className="slider"></span></label>
        </div>

        <div className="divider"></div>
        <div className="section-tag">Stop Filter</div>
        <div style={{ marginTop: "10px" }}>
          <select value={selectedStop} onChange={(e) => setSelectedStop(e.target.value)}>
            <option value="All">All Stops</option>
            {uniqueStops.map(stop => (
              <option key={stop} value={stop}>Stop {stop}</option>
            ))}
          </select>
        </div>

        <div className="divider"></div>
        <div className="section-tag">Placement details</div>
        <table style={{ fontSize: "12px", border: "none" }}>
          <tbody>
            <tr>
              <td style={{ padding: "6px 0", border: "none" }}>Name</td>
              <td style={{ padding: "6px 0", border: "none", textAlign: "right", fontWeight: 700 }}>{selectedItemInfo ? selectedItemInfo.id : "—"}</td>
            </tr>
            <tr>
              <td style={{ padding: "6px 0", border: "none" }}>Coordinates</td>
              <td style={{ padding: "6px 0", border: "none", textAlign: "right" }} className="mono">{selectedItemInfo ? `(${selectedItemInfo.x},${selectedItemInfo.y},${selectedItemInfo.z})` : "—"}</td>
            </tr>
            <tr>
              <td style={{ padding: "6px 0", border: "none" }}>Size</td>
              <td style={{ padding: "6px 0", border: "none", textAlign: "right" }} className="mono">{selectedItemInfo ? `${selectedItemInfo.l}×${selectedItemInfo.d}×${selectedItemInfo.h}` : "—"}</td>
            </tr>
            <tr>
              <td style={{ padding: "6px 0", border: "none" }}>Weight</td>
              <td style={{ padding: "6px 0", border: "none", textAlign: "right" }}>{selectedItemInfo ? `${selectedItemInfo.weight} kg` : "—"}</td>
            </tr>
          </tbody>
        </table>
        <style>{`.constraint-row{ display:flex; align-items:center; justify-content:space-between; padding:9px 2px; border-bottom:1px solid var(--border); }`}</style>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">3D packing viewport</div>
            <div className="card-desc">Updates dynamically during iteration loops</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => triggerViewReset("3D")}>Reset view</button>
          </div>
        </div>
        <div style={{ minHeight: "450px", borderRadius: "var(--radius-md)", background: "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          {isBenchmarking ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ display: "inline-block", width: 40, height: 40, border: "4px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "16px" }} />
              <h4 style={{ color: "var(--text-main)", fontSize: "16px", fontWeight: "700" }}>Running Benchmark...</h4>
              <p style={{ color: "var(--text-dim)", fontSize: "13px", marginTop: "4px" }}>Please wait while all 4 strategies are being evaluated in parallel.</p>
            </div>
          ) : benchmarkResults ? (
            <div style={{ width: "100%", padding: "24px" }}>
              <h4 style={{ color: "var(--primary)", fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>Benchmark Results</h4>
              <table className="custom-table" style={{ width: "100%", textAlign: "left" }}>
                <thead>
                  <tr>
                    <th>Strategy</th>
                    <th>Bins Used</th>
                    <th>Space Utilization (%)</th>
                    <th>Constraint Satisfaction (%)</th>
                    <th>Runtime (s)</th>
                    <th>Peak Memory (MB)</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkResults.map((res, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: "700", color: "var(--text-main)" }}>{res.strategy}</td>
                      {res.error ? (
                        <td colSpan="5" style={{ color: "var(--danger)" }}>Error: {res.error}</td>
                      ) : (
                        <>
                          <td style={{ fontWeight: "700", color: "var(--primary)" }}>{res.bins_used}</td>
                          <td>{res.su_pct}%</td>
                          <td>{res.csr_pct}%</td>
                          <td>{res.runtime_s}s</td>
                          <td>{res.peak_mem_mb}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredPlacements && instanceInfo ? (
            <BinViewer
              placements={filteredPlacements}
              container={instanceInfo.container}
              binsUsed={binsUsed}
              showLabels={showLabels}
              running={running}
              orientation={viewportOrientation}
              resetTrigger={viewportTrigger}
              onResetView={() => triggerViewReset("3D")}
              onHoverItem={setSelectedItemInfo}
              onInteract={() => {
                if (viewportOrientation !== "3D") {
                  setViewportOrientation("3D");
                }
              }}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--ink-faint)", fontSize: "12px", textAlign: "center", padding: "16px" }}>
              <span style={{ fontSize: "24px", marginBottom: "8px" }}>📦</span>
              <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--ink)" }}>No Active Run Data</span>
              <span style={{ marginTop: "4px" }}>Start the optimizer from the Logistics tab to view output.</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="field-hint">Showing {filteredPlacements?.length || 0} items</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span className="badge badge-neutral">{binsUsed || 0} bins</span>
            <span className="badge badge-primary">{instanceInfo?.n_items || 0} items</span>
          </div>
        </div>
      </div>
    </div>
  );
}
