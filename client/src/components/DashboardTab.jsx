import React from "react";

export default function DashboardTab({ runHistory = [], setActiveTab }) {
  return (
    <>
      <div className="card" style={{ textAlign: "center", padding: "40px 32px", marginBottom: "20px", background: "linear-gradient(155deg, var(--primary-tint), var(--surface))" }}>
        <div className="font-display" style={{ fontSize: "26px", fontWeight: 600, marginBottom: "10px" }}>Fit more into every container</div>
        <div style={{ maxWidth: "520px", margin: "0 auto 24px auto", color: "var(--ink-soft)", fontSize: "13.5px", lineHeight: 1.6 }}>
          STACKR takes a list of boxes and a container, works out the tightest way to arrange them, and shows you exactly where each box goes. Answer three quick questions and STACKR does the rest.
        </div>
        <button className="btn btn-primary" style={{ padding: "11px 26px", fontSize: "14px" }} onClick={() => setActiveTab('logistics')}>Start Analysis &rarr;</button>
      </div>

      <div className="grid grid-3" style={{ marginBottom: "20px" }}>
        <div className="card">
          <div className="badge badge-primary" style={{ marginBottom: "10px" }}>Step 1</div>
          <div className="card-title" style={{ marginBottom: "4px" }}>Give it your items</div>
          <div className="card-desc">Pick a ready-made sample load, or add your own boxes and container size.</div>
        </div>
        <div className="card">
          <div className="badge badge-primary" style={{ marginBottom: "10px" }}>Step 2</div>
          <div className="card-title" style={{ marginBottom: "4px" }}>Confirm a few settings</div>
          <div className="card-desc">Choose which safety rules apply &mdash; STACKR explains each one in plain terms.</div>
        </div>
        <div className="card">
          <div className="badge badge-primary" style={{ marginBottom: "10px" }}>Step 3</div>
          <div className="card-title" style={{ marginBottom: "4px" }}>See your results</div>
          <div className="card-desc">STACKR packs the container and shows how much space you saved, in a 3D view.</div>
        </div>
      </div>

      <div className="field-hint" style={{ textAlign: "center", marginTop: "6px" }}>New here? Just click "Start Analysis" above &mdash; STACKR will walk you through everything you need.</div>
    </>
  );
}
