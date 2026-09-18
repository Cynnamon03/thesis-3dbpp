import React, { useState } from "react";

export default function CompareTab() {
  const [viewMode, setViewMode] = useState("single"); // 'single' or 'complexity'

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <div className="tabs-inline" id="compareViewTabs">
          <button 
            className={viewMode === "single" ? "active" : ""} 
            onClick={() => setViewMode("single")}
          >
            Compare on one dataset
          </button>
          <button 
            className={viewMode === "complexity" ? "active" : ""} 
            onClick={() => setViewMode("complexity")}
          >
            Compare as load size grows
          </button>
        </div>
        {viewMode === "single" && (
          <select style={{ width: "220px" }} id="compareDatasetSelect">
            <option>Load: Small (47 items)</option>
            <option>Load: Medium (129 items)</option>
          </select>
        )}
      </div>

      {viewMode === "single" ? (
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
                <tr>
                  <td style={{ fontWeight: 700 }}>Placement only <span className="field-hint" style={{ fontWeight: 400 }}>(DGWO)</span></td>
                  <td className="mono">28.1%</td>
                  <td><span className="badge badge-safe">0</span></td>
                  <td><span className="badge badge-neutral">—</span></td>
                  <td><span className="badge badge-neutral">—</span></td>
                  <td><span className="badge badge-neutral">—</span></td>
                  <td className="mono">71.2s</td>
                  <td className="mono">—</td>
                  <td><button className="btn btn-ghost btn-sm">View</button></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Rules only <span className="field-hint" style={{ fontWeight: 400 }}>(MOGWO)</span></td>
                  <td colSpan="6" style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>Not tested yet — this method isn't built into the tool yet</td>
                  <td><button className="btn btn-ghost btn-sm" disabled>View</button></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Placement, then rules <span className="field-hint" style={{ fontWeight: 400 }}>(Sequential Hybrid)</span></td>
                  <td className="mono" style={{ color: "var(--primary-dark)", fontWeight: 700 }}>33.3%</td>
                  <td><span className="badge badge-safe">Passed</span></td>
                  <td><span className="badge badge-safe">Passed</span></td>
                  <td><span className="badge badge-neutral">—</span></td>
                  <td><span className="badge badge-safe">Passed</span></td>
                  <td className="mono">96.8s</td>
                  <td className="mono">—</td>
                  <td><button className="btn btn-ghost btn-sm">View</button></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Fix as it goes <span className="field-hint" style={{ fontWeight: 400 }}>(Repair-Based Hybrid)</span></td>
                  <td colSpan="6" style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>Not tested yet — this method isn't built into the tool yet</td>
                  <td><button className="btn btn-ghost btn-sm" disabled>View</button></td>
                </tr>
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
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-soft)" }}>28.1%</div>
                  <div style={{ width: "100%", height: "84px", background: "var(--border-strong)", borderRadius: "6px 6px 0 0" }}></div>
                  <div style={{ fontSize: "11px", color: "var(--ink-faint)", textAlign: "center" }}>DGWO</div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-faint)" }}>—</div>
                  <div style={{ width: "100%", height: "4px", background: "var(--surface-sunken)", borderRadius: "6px 6px 0 0" }}></div>
                  <div style={{ fontSize: "11px", color: "var(--ink-faint)", textAlign: "center" }}>MOGWO</div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary-dark)" }}>33.3%</div>
                  <div style={{ width: "100%", height: "100px", background: "var(--primary)", borderRadius: "6px 6px 0 0" }}></div>
                  <div style={{ fontSize: "11px", color: "var(--ink-faint)", textAlign: "center" }}>Sequential</div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-faint)" }}>—</div>
                  <div style={{ width: "100%", height: "4px", background: "var(--surface-sunken)", borderRadius: "6px 6px 0 0" }}></div>
                  <div style={{ fontSize: "11px", color: "var(--ink-faint)", textAlign: "center" }}>Repair-Based</div>
                </div>
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
                <tr><td><span className="badge badge-safe">Small</span></td><td className="mono">47</td><td className="mono">612 kg</td><td className="mono" style={{ color: "var(--ink-faint)" }}>51.json</td></tr>
                <tr><td><span className="badge badge-neutral">Medium</span></td><td className="mono">129</td><td className="mono">1,692.5 kg</td><td className="mono" style={{ color: "var(--ink-faint)" }}>52.json</td></tr>
                <tr><td><span className="badge badge-warn">Large</span></td><td className="mono">286</td><td className="mono">3,845 kg</td><td className="mono" style={{ color: "var(--ink-faint)" }}>53.json</td></tr>
                <tr><td><span className="badge badge-danger">Very Large</span></td><td className="mono">512</td><td className="mono">7,220 kg</td><td className="mono" style={{ color: "var(--ink-faint)" }}>54.json</td></tr>
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
              <svg viewBox="0 0 400 190" style={{ width: "100%", height: "190px" }}>
                <line x1="40" y1="10" x2="40" y2="160" stroke="var(--border-strong)" strokeWidth="1"/>
                <line x1="40" y1="160" x2="380" y2="160" stroke="var(--border-strong)" strokeWidth="1"/>
                <polyline fill="none" stroke="var(--border-strong)" strokeWidth="2" points="70,140 160,120 250,95 340,60"/>
                <polyline fill="none" stroke="var(--primary)" strokeWidth="2.5" points="70,130 160,100 250,55 340,20"/>
                <circle cx="70" cy="140" r="3" fill="var(--border-strong)"/><circle cx="160" cy="120" r="3" fill="var(--border-strong)"/><circle cx="250" cy="95" r="3" fill="var(--border-strong)"/><circle cx="340" cy="60" r="3" fill="var(--border-strong)"/>
                <circle cx="70" cy="130" r="3.5" fill="var(--primary)"/><circle cx="160" cy="100" r="3.5" fill="var(--primary)"/><circle cx="250" cy="55" r="3.5" fill="var(--primary)"/><circle cx="340" cy="20" r="3.5" fill="var(--primary)"/>
                <text x="70" y="175" fontSize="9" fill="var(--ink-faint)" textAnchor="middle">47</text>
                <text x="160" y="175" fontSize="9" fill="var(--ink-faint)" textAnchor="middle">129</text>
                <text x="250" y="175" fontSize="9" fill="var(--ink-faint)" textAnchor="middle">286</text>
                <text x="340" y="175" fontSize="9" fill="var(--ink-faint)" textAnchor="middle">512</text>
                <text x="210" y="187" fontSize="9" fill="var(--ink-faint)" textAnchor="middle">Number of items</text>
              </svg>
              <div style={{ display: "flex", gap: "18px", fontSize: "11.5px", color: "var(--ink-faint)", marginTop: "4px" }}>
                <span><span style={{ display: "inline-block", width: "10px", height: "2px", background: "var(--border-strong)", marginRight: "5px" }}></span>Placement only <span className="field-hint" style={{ fontWeight: 400 }}>(DGWO)</span></span>
                <span><span style={{ display: "inline-block", width: "10px", height: "2px", background: "var(--primary)", marginRight: "5px" }}></span>Placement, then rules <span className="field-hint" style={{ fontWeight: 400 }}>(Sequential Hybrid)</span></span>
              </div>
              <div className="field-hint" style={{ marginTop: "10px" }}>MOGWO and Repair-Based Hybrid aren't shown — they haven't completed a run at any load size yet.</div>
            </div>

            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Does it use more memory with bigger loads?</div>
                  <div className="card-desc">Memory used to finish, as the number of items grows</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "190px", color: "var(--ink-faint)", textAlign: "center", gap: "8px" }}>
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 3H5a2 2 0 00-2 2v4m18 0V5a2 2 0 00-2-2h-4M3 15v4a2 2 0 002 2h4m10-6v4a2 2 0 01-2 2h-4"/></svg>
                <div style={{ fontSize: "12.5px" }}>No data yet — memory tracking isn't built into the tool yet.</div>
                <div className="field-hint">This chart will fill in the same way as the time chart once that's ready.</div>
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
                <tr><th>Method</th><th>47 items</th><th>129 items</th><th>286 items</th><th>512 items</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700 }}>Placement only <span className="field-hint" style={{ fontWeight: 400 }}>(DGWO)</span></td>
                  <td className="mono">38.4s / —</td><td className="mono">71.2s / —</td><td className="mono">142.0s / —</td><td className="mono">210.5s / —</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Rules only <span className="field-hint" style={{ fontWeight: 400 }}>(MOGWO)</span></td>
                  <td colSpan="4" style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>Not tested yet — this method isn't built into the tool yet</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Placement, then rules <span className="field-hint" style={{ fontWeight: 400 }}>(Sequential Hybrid)</span></td>
                  <td className="mono">44.1s / —</td><td className="mono">96.8s / —</td><td className="mono">178.9s / —</td><td className="mono">265.3s / —</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Fix as it goes <span className="field-hint" style={{ fontWeight: 400 }}>(Repair-Based Hybrid)</span></td>
                  <td colSpan="4" style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>Not tested yet — this method isn't built into the tool yet</td>
                </tr>
              </tbody>
            </table>
            <div className="field-hint" style={{ marginTop: "12px" }}>Each cell reads as: time taken / memory used. Memory shows "—" until that tracking is added.</div>
          </div>
        </div>
      )}
    </>
  );
}
