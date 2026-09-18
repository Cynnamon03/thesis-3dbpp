import React from "react";

export default function DashboardTab() {
  return (
    <>
      <div className="grid grid-4" style={{ marginBottom: "20px" }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="card-desc" style={{ margin: 0 }}>Space Utilization</span>
            <span className="badge badge-warn">Moderate</span>
          </div>
          <div className="font-display" style={{ fontSize: "30px", fontWeight: 600, marginTop: "8px" }}>33.3%</div>
          <div className="field-hint">Best run so far · Sequential Hybrid</div>
        </div>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="card-desc" style={{ margin: 0 }}>Constraint Compliance</span>
            <span className="badge badge-safe">Passing</span>
          </div>
          <div className="font-display" style={{ fontSize: "30px", fontWeight: 600, marginTop: "8px" }}>
            0 <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink-faint)" }}>violations</span>
          </div>
          <div className="field-hint">Weight, fragility, stability, stop-order</div>
        </div>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="card-desc" style={{ margin: 0 }}>Avg. Runtime</span>
            <span className="badge badge-neutral">4 configs</span>
          </div>
          <div className="font-display" style={{ fontSize: "30px", fontWeight: 600, marginTop: "8px" }}>
            96.8<span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink-faint)" }}>s</span>
          </div>
          <div className="field-hint">Across all completed runs</div>
        </div>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="card-desc" style={{ margin: 0 }}>Experiment Progress</span>
            <span className="badge badge-primary">In progress</span>
          </div>
          <div className="font-display" style={{ fontSize: "30px", fontWeight: 600, marginTop: "8px" }}>
            1 <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink-faint)" }}>/ 3,600 runs</span>
          </div>
          <div className="field-hint">Full experiment not yet launched</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Algorithm comparison snapshot</div>
              <div className="card-desc">Space utilization by configuration, most recent run of each</div>
            </div>
            <button className="btn btn-ghost btn-sm" data-tab="compare">View all →</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600 }}>Placement only <span className="field-hint" style={{ fontWeight: 400 }}>(DGWO)</span></span>
                <span className="mono" style={{ color: "var(--ink-faint)" }}>28.1%</span>
              </div>
              <div style={{ height: "8px", background: "var(--surface-sunken)", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ width: "28.1%", height: "100%", background: "var(--border-strong)" }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600 }}>Rules only <span className="field-hint" style={{ fontWeight: 400 }}>(MOGWO)</span></span>
                <span className="mono" style={{ color: "var(--ink-faint)" }}>—</span>
              </div>
              <div style={{ height: "8px", background: "var(--surface-sunken)", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ width: "0%", height: "100%", background: "var(--border-strong)" }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600 }}>Placement, then rules <span className="field-hint" style={{ fontWeight: 400 }}>(Sequential Hybrid)</span></span>
                <span className="mono" style={{ color: "var(--primary-dark)" }}>33.3%</span>
              </div>
              <div style={{ height: "8px", background: "var(--surface-sunken)", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ width: "33.3%", height: "100%", background: "var(--primary)" }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600 }}>Fix as it goes <span className="field-hint" style={{ fontWeight: 400 }}>(Repair-Based Hybrid)</span></span>
                <span className="mono" style={{ color: "var(--ink-faint)" }}>—</span>
              </div>
              <div style={{ height: "8px", background: "var(--surface-sunken)", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ width: "0%", height: "100%", background: "var(--border-strong)" }}></div>
              </div>
            </div>
          </div>
          <div className="field-hint" style={{ marginTop: "14px" }}>
            MOGWO and Repair-Based Hybrid have not completed a run yet on this dataset.
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Recent activity</div>
              <div className="card-desc">Latest actions across the workspace</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: "12px", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--safe)", marginTop: "5px", flexShrink: 0 }}></div>
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: 600 }}>Run #001 completed</div>
                <div className="field-hint" style={{ marginTop: "1px" }}>Placement, then rules — Medium load · 96.8s</div>
              </div>
              <div className="field-hint" style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>9/11, 11:13 AM</div>
            </div>
            <div style={{ display: "flex", gap: "12px", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)", marginTop: "5px", flexShrink: 0 }}></div>
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: 600 }}>Dataset loaded</div>
                <div className="field-hint" style={{ marginTop: "1px" }}>Sample load: Medium (129 items)</div>
              </div>
              <div className="field-hint" style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>9/11, 11:02 AM</div>
            </div>
            <div style={{ display: "flex", gap: "12px", padding: "10px 0" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ink-faint)", marginTop: "5px", flexShrink: 0 }}></div>
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: 600 }}>Account created</div>
                <div className="field-hint" style={{ marginTop: "1px" }}>Signed up as Researcher</div>
              </div>
              <div className="field-hint" style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>9/9, 3:41 PM</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "20px" }}>
        <div className="card-head">
          <div>
            <div className="card-title">What's built so far</div>
            <div className="card-desc">The numbers elsewhere on this page only mean something once these are finished</div>
          </div>
        </div>
        <div className="grid grid-4">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
              <span>Fitting items in</span>
              <span className="mono">10%</span>
            </div>
            <div style={{ height: "6px", background: "var(--surface-sunken)", borderRadius: "100px" }}>
              <div style={{ width: "10%", height: "100%", background: "var(--warn)", borderRadius: "100px" }}></div>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
              <span>Checking the rules</span>
              <span className="mono">0%</span>
            </div>
            <div style={{ height: "6px", background: "var(--surface-sunken)", borderRadius: "100px" }}>
              <div style={{ width: "2%", height: "100%", background: "var(--danger)", borderRadius: "100px" }}></div>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
              <span>Fixing rule breaks</span>
              <span className="mono">5%</span>
            </div>
            <div style={{ height: "6px", background: "var(--surface-sunken)", borderRadius: "100px" }}>
              <div style={{ width: "5%", height: "100%", background: "var(--danger)", borderRadius: "100px" }}></div>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
              <span>Comparing results fairly</span>
              <span className="mono">0%</span>
            </div>
            <div style={{ height: "6px", background: "var(--surface-sunken)", borderRadius: "100px" }}>
              <div style={{ width: "2%", height: "100%", background: "var(--danger)", borderRadius: "100px" }}></div>
            </div>
          </div>
        </div>
        <div className="field-hint" style={{ marginTop: "14px" }}>
          Everything shown in this prototype is example data — the real numbers depend on these pieces being finished.
        </div>
      </div>
    </>
  );
}
