import React, { useState } from "react";

export default function GuideTab({ finalResult }) {
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [configKey, setConfigKey] = useState("sequential");

  if (!finalResult || !finalResult.items || finalResult.items.length === 0) {
    return (
      <div id="guideUnavailable">
        <div className="card" style={{ textAlign: "center", padding: "48px 32px" }}>
          <div style={{ color: "var(--ink-faint)", fontStyle: "italic", fontSize: "13px" }}>
            This method hasn't been built into the tool yet, or no run has been completed.
            Run an optimization first to view the Loading Guide.
          </div>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div id="guideControls" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "18px" }}>
        <div>
          <label className="field-label">Viewing solution from</label>
          <select id="guideConfigSelect" style={{ width: "280px" }} value={configKey} onChange={(e) => setConfigKey(e.target.value)}>
            <option value="dgwo">Placement only (DGWO)</option>
            <option value="sequential">Placement, then rules (Sequential Hybrid) ★ Recommended</option>
          </select>
        </div>
        <button className="btn btn-primary" id="printGuideBtn" onClick={handlePrint}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
          Print / Export Guide
        </button>
      </div>

      <div id="guideContent">
        <div className="info-callout" id="guideRecommendedBanner" style={{ marginBottom: "18px", background: "var(--safe-tint)", borderColor: "var(--safe)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--safe)" strokeWidth="2" width="18" height="18" style={{ flexShrink: 0 }}><path d="M20 6L9 17l-5-5"/></svg>
          <div>
            <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "3px", color: "var(--safe)" }}>This is STACKR's recommended solution</div>
            <div style={{ fontSize: "12.5px", lineHeight: 1.6 }}>It packs tighter than the alternative that's currently built, while still satisfying the safety and delivery rules you turned on.</div>
          </div>
        </div>

        {/* ===== PAGE 1: Loading & Unloading Guide ===== */}
        <div className="card guide-page" style={{ marginBottom: "20px" }}>
          <div className="card-head">
            <div>
              <div className="section-tag">Page 1</div>
              <div className="card-title">Loading &amp; Unloading Guide</div>
              <div className="card-desc">Follow this order when loading the container, and in reverse-priority when unloading at each stop</div>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="custom-table" style={{ border: "none" }}>
              <thead>
                <tr><th>Stop</th><th>Load Order</th><th>Box ID</th><th>Dimensions (W×D×H cm)</th><th>Weight</th><th>Bin</th><th>Coordinates (X,Y,Z)</th></tr>
              </thead>
              <tbody>
                {finalResult.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.stop || 1}</td>
                    <td className="mono">{idx + 1}</td>
                    <td className="mono">{item.id || `BOX-${idx}`}</td>
                    <td className="mono">{item.l}×{item.d}×{item.h}</td>
                    <td className="mono">{item.weight || item.Weight || 0} kg</td>
                    <td>{item.bin_id}</td>
                    <td className="mono">({item.x},{item.y},{item.z})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== PAGE 2: Solution Summary ===== */}
        <div className="card guide-page">
          <div className="card-head">
            <div>
              <div className="section-tag">Page 2</div>
              <div className="card-title">Solution Summary</div>
              <div className="card-desc">Does this arrangement satisfy the requirements it needs to?</div>
            </div>
          </div>
          <div className="grid grid-2" style={{ marginBottom: "16px" }}>
            <div>
              <span className="field-hint">Space Utilization</span>
              <div style={{ fontWeight: 700, fontSize: "15px", marginTop: "2px" }}>{(finalResult.metrics?.M1_space_utilization_pct || 0).toFixed(1)}% of container volume</div>
            </div>
            <div>
              <span className="field-hint">Weight Capacity Status</span>
              <div style={{ marginTop: "2px" }}>
                <span className={`badge ${finalResult.metrics?.details?.C3_weight_pct === 100 ? "badge-safe" : "badge-danger"}`}>
                  {finalResult.metrics?.details?.C3_weight_pct === 100 ? "Within limit" : "Exceeds limit"}
                </span>
              </div>
            </div>
          </div>
          <div className="divider"></div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowTechDetails(!showTechDetails)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ transform: showTechDetails ? "rotate(180deg)" : "rotate(0deg)" }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
            {showTechDetails ? "Hide technical details" : "Show technical details (optional)"}
          </button>
          {showTechDetails && (
            <div id="guideTechDetails" style={{ marginTop: "14px" }}>
              <table>
                <tbody>
                  <tr><td>Algorithm configuration</td><td style={{ textAlign: "right" }}>{finalResult.strategy || "Unknown"}</td></tr>
                  <tr><td>Runtime</td><td style={{ textAlign: "right" }} className="mono">{finalResult.runtime_s || 0}s</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
