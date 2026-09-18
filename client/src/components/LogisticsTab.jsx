import React, { useState, useRef, useEffect } from "react";
import Papa from "papaparse";

export default function LogisticsTab({
  containerSpecs,
  setContainerSpecs,
  maxLoad,
  setMaxLoad,
  strategy,
  setStrategy,
  wolfSize,
  setWolfSize,
  maxIter,
  setMaxIter,
  fragilityConstraint,
  setFragilityConstraint,
  rotationConstraint,
  setRotationConstraint,
  lifoConstraint,
  setLifoConstraint,
  itemsList,
  setItemsList,
  setIsCustomized,
  instanceItems,
  loadingList,
  selected,
  setSelected,
  groupedInstances,
  running,
  elapsed,
  handleStartRun,
  handleStopRun,
  handleBenchmarkRun,
  isBenchmarking,
  canRun,
  activeOption,
  setActiveOption
}) {
  const fileInputRef = useRef(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);

  // New Item Input states
  const [newItemId, setNewItemId] = useState("BOX-001");
  const [newItemL, setNewL] = useState("");
  const [newItemH, setNewH] = useState("");
  const [newItemD, setNewD] = useState("");
  const [newItemWeight, setNewWeight] = useState("");
  const [newItemQty, setNewQty] = useState("1");
  const [newItemType, setNewItemType] = useState("Standard");
  const [newItemStop, setNewItemStop] = useState("1");

  useEffect(() => {
    const nextNum = itemsList.length + 1;
    setNewItemId(`BOX-${String(nextNum).padStart(3, "0")}`);
  }, [itemsList]);

  const activeItems = activeOption === "A" ? itemsList : instanceItems;

  const totalManualItems = itemsList.reduce((acc, it) => acc + (it.quantity || 1), 0);
  const totalManualWeight = itemsList.reduce((acc, it) => acc + (it.weight * (it.quantity || 1)), 0);

  const totalInstanceItems = instanceItems.length;
  const totalInstanceWeight = instanceItems.reduce((acc, it) => acc + (it.Weight || 0), 0);

  const handleContainerChange = (field, val) => {
    setContainerSpecs(prev => ({ ...prev, [field]: Number(val) }));
    setIsCustomized(true);
  };

  const handleMaxLoadChange = (val) => {
    setMaxLoad(Number(val));
    setIsCustomized(true);
  };

  const handleAddItem = () => {
    if (!newItemL || !newItemH || !newItemD || !newItemWeight || !newItemQty) return;
    const qty = parseInt(newItemQty, 10);
    const stopVal = parseInt(newItemStop, 10);
    for (let i = 0; i < qty; i++) {
      const newItem = {
        id: `${newItemId}-${i + 1}`,
        length: Number(newItemL),
        height: Number(newItemH),
        depth: Number(newItemD),
        weight: Number(newItemWeight),
        Type: newItemType,
        quantity: 1,
        stop: stopVal,
        LBS: newItemType === "Standard" ? Number(newItemWeight) * 10 : (newItemType === "Fragile" ? 0 : Number(newItemWeight) * 20),
        fragile: newItemType === "Fragile" ? 1 : 0
      };
      setItemsList((prev) => [...prev, newItem]);
    }
    setNewL(""); setNewH(""); setNewD(""); setNewWeight(""); setNewQty("1"); setNewItemType("Standard"); setNewItemStop("1");
    setIsCustomized(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const parsed = res.data.map((r, i) => {
          const type = r.Type || "Standard";
          const weight = Number(r.Weight || r.weight || 0);
          return {
            id: r.Item_ID || `CSV-BOX-${i}`,
            length: Number(r.Length || r.length || 0),
            height: Number(r.Height || r.height || 0),
            depth: Number(r.Depth || r.depth || 0),
            weight: weight,
            quantity: Number(r.Quantity || 1),
            Type: type,
            stop: Number(r.Stop || 1),
            LBS: type === "Fragile" ? 0 : weight * 10,
            fragile: type === "Fragile" ? 1 : 0
          };
        });
        setItemsList((prev) => [...prev, ...parsed]);
        setIsCustomized(true);
      },
    });
    e.target.value = null;
  };

  const handleClearManual = () => {
    setItemsList([]);
    setIsCustomized(true);
  };

  const handleClearInstance = () => {
    setSelected("");
    setIsCustomized(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const goToStep = (n) => {
    setCurrentStep(n);
    if (n > maxStepReached) setMaxStepReached(n);
  };

  const isStepDone = (n) => n < currentStep;
  const isStepActive = (n) => n === currentStep;
  const isStepClickable = (n) => n <= maxStepReached;

  return (
    <>
      {/* Wizard step indicator */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <div 
            className={`wiz-step ${isStepActive(1) ? "active" : ""} ${isStepDone(1) ? "done" : ""}`} 
            style={{ flex: 1, opacity: isStepClickable(1) ? 1 : 0.55, cursor: isStepClickable(1) ? "pointer" : "default" }}
            onClick={() => isStepClickable(1) && goToStep(1)}
          >
            <div className="wiz-num">1</div>
            <div>
              <div className="wiz-label">Container</div>
              <div className="wiz-sub">Bin dimensions &amp; load limit</div>
            </div>
          </div>
          <div className="wiz-line"></div>
          <div 
            className={`wiz-step ${isStepActive(2) ? "active" : ""} ${isStepDone(2) ? "done" : ""}`} 
            style={{ flex: 1, opacity: isStepClickable(2) ? 1 : 0.55, cursor: isStepClickable(2) ? "pointer" : "default" }}
            onClick={() => isStepClickable(2) && goToStep(2)}
          >
            <div className="wiz-num">2</div>
            <div>
              <div className="wiz-label">Items</div>
              <div className="wiz-sub">Add boxes, or use a sample</div>
            </div>
          </div>
          <div className="wiz-line"></div>
          <div 
            className={`wiz-step ${isStepActive(3) ? "active" : ""} ${isStepDone(3) ? "done" : ""}`} 
            style={{ flex: 1, opacity: isStepClickable(3) ? 1 : 0.55, cursor: isStepClickable(3) ? "pointer" : "default" }}
            onClick={() => isStepClickable(3) && goToStep(3)}
          >
            <div className="wiz-num">3</div>
            <div>
              <div className="wiz-label">Method</div>
              <div className="wiz-sub">How to pack, and which rules apply</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .wiz-step{ display:flex; align-items:center; gap:12px; padding:4px; }
        .wiz-num{
          width:30px;height:30px;border-radius:50%;flex-shrink:0;
          background:var(--surface-sunken); color:var(--ink-faint);
          display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;
          border:1px solid var(--border);
        }
        .wiz-step.active .wiz-num{ background:var(--primary); color:#fff; border-color:var(--primary); }
        .wiz-step.done .wiz-num{ background:var(--safe); color:#fff; border-color:var(--safe); }
        .wiz-label{ font-size:13px; font-weight:700; color:var(--ink); }
        .wiz-step.active .wiz-label{ color:var(--primary-dark); }
        .wiz-sub{ font-size:11px; color:var(--ink-faint); }
        .wiz-line{ height:1px; width:40px; background:var(--border-strong); margin:0 6px; flex-shrink:0; }
      `}</style>

      {/* ============ STEP 1: CONTAINER ============ */}
      <div className={`wiz-panel ${currentStep === 1 ? "active" : ""}`}>
        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Container dimensions</div>
                <div className="card-desc">Width (X) × depth (Z) × height (Y), in centimeters</div>
              </div>
            </div>
            <div className="grid grid-3">
              <div>
                <label className="field-label">Width (cm)</label>
                <input type="number" value={containerSpecs.L} onChange={(e) => handleContainerChange("L", e.target.value)} />
              </div>
              <div>
                <label className="field-label">Depth (cm)</label>
                <input type="number" value={containerSpecs.D} onChange={(e) => handleContainerChange("D", e.target.value)} />
              </div>
              <div>
                <label className="field-label">Height (cm)</label>
                <input type="number" value={containerSpecs.H} onChange={(e) => handleContainerChange("H", e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: "16px" }}>
              <label className="field-label">Max load capacity (kg)</label>
              <input type="number" value={maxLoad} onChange={(e) => handleMaxLoadChange(e.target.value)} />
              <div className="field-hint">Used to enforce the Weight Capacity constraint (C1)</div>
            </div>
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <svg viewBox="0 0 120 100" width="140" height="110" style={{ marginBottom: "10px" }}>
              <g fill="none" stroke="var(--primary)" strokeWidth="2">
                <path d="M20 30 L60 15 L100 30 L100 75 L60 90 L20 75 Z"/>
                <path d="M20 30 L60 45 L100 30"/>
                <path d="M60 45 L60 90"/>
              </g>
            </svg>
            <div className="font-display" style={{ fontSize: "16px", fontWeight: 600 }}>{containerSpecs.L} × {containerSpecs.D} × {containerSpecs.H} cm</div>
            <div className="field-hint" style={{ marginTop: "2px" }}>{maxLoad.toLocaleString()} kg max load</div>
            <div className="badge badge-safe" style={{ marginTop: "12px" }}>Custom Profile</div>
          </div>
        </div>
      </div>

      {/* ============ STEP 2: ITEMS ============ */}
      <div className={`wiz-panel ${currentStep === 2 ? "active" : ""}`}>
        <div className="tabs-inline" style={{ marginBottom: "16px" }}>
          <button className={activeOption === "A" ? "active" : ""} onClick={() => setActiveOption("A")}>Add items myself</button>
          <button className={activeOption === "B" ? "active" : ""} onClick={() => setActiveOption("B")}>Use a sample dataset</button>
        </div>

        {/* Manual entry */}
        <div style={{ display: activeOption === "A" ? "block" : "none" }}>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Add items manually</div>
                <div className="card-desc">Define boxes one at a time, or import a CSV</div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="file" accept=".csv" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />
                <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>
                  Import CSV
                </button>
                <button className="btn btn-danger-ghost btn-sm" onClick={handleClearManual}>Clear Items</button>
              </div>
            </div>
            
            {/* Inline Add Box Form */}
            <div className="grid grid-4 add-box-form" style={{ background: "var(--surface-sunken)", padding: "16px", borderRadius: "var(--radius-sm)", marginBottom: "16px" }}>
              <div>
                <label className="field-label">Width (X)</label>
                <input type="number" placeholder="cm" value={newItemL} onChange={(e) => setNewL(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Depth (Z)</label>
                <input type="number" placeholder="cm" value={newItemD} onChange={(e) => setNewD(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Height (Y)</label>
                <input type="number" placeholder="cm" value={newItemH} onChange={(e) => setNewH(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Weight</label>
                <input type="number" placeholder="kg" value={newItemWeight} onChange={(e) => setNewWeight(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Type</label>
                <select value={newItemType} onChange={(e) => setNewItemType(e.target.value)}>
                  <option>Standard</option>
                  <option>Fragile</option>
                  <option>Heavy</option>
                </select>
              </div>
              <div>
                <label className="field-label">Stop</label>
                <input type="number" min="1" value={newItemStop} onChange={(e) => setNewItemStop(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Qty</label>
                <input type="number" min="1" value={newItemQty} onChange={(e) => setNewQty(e.target.value)} />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleAddItem}>+ Add</button>
              </div>
            </div>

            <table className="custom-table">
              <thead><tr><th>Item ID</th><th>Stop</th><th>W (cm)</th><th>D (cm)</th><th>H (cm)</th><th>Weight (kg)</th><th>Qty</th><th>Type</th></tr></thead>
              <tbody>
                {itemsList.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: "center", padding: "32px", color: "var(--ink-faint)" }}>No items added yet — use the form above or import a CSV.</td></tr>
                ) : (
                  itemsList.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.id || `BOX-${idx}`}</td>
                      <td>{item.stop || 1}</td>
                      <td>{item.length || item.L || item.l || 0}</td>
                      <td>{item.depth || item.D || item.d || 0}</td>
                      <td>{item.height || item.H || item.h || 0}</td>
                      <td>{item.weight || item.Weight || 0}</td>
                      <td>{item.quantity || 1}</td>
                      <td>
                        <span className={`badge ${item.Type === "Fragile" ? "badge-warn" : (item.Type === "Heavy" ? "badge-danger" : "badge-neutral")}`}>
                          {item.Type || "Standard"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Library dataset */}
        <div style={{ display: activeOption === "B" ? "block" : "none" }}>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">wtpack Validation Dataset</div>
                <div className="card-desc">Select a wtpack benchmark instance to load.</div>
              </div>
            </div>
            <div className="grid grid-2" style={{ alignItems: "end", marginBottom: "16px" }}>
              <div>
                <label className="field-label">Choose a sample</label>
                <select value={selected} onChange={(e) => setSelected(e.target.value)} disabled={loadingList}>
                  <option value="">-- Select an instance --</option>
                  {Object.entries(groupedInstances).map(([group, insts]) => (
                    <optgroup key={group} label={group}>
                      {insts.map((inst) => (
                        <option key={inst.path} value={inst.path}>{inst.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <div className="field-hint">Instances annotated with weights, LBS, and multi-drop stops</div>
              </div>
              <button className="btn btn-secondary" style={{ width: "fit-content" }} onClick={handleClearInstance}>Clear selection</button>
            </div>
            
            {instanceItems.length > 0 && (
              <>
                <div style={{ display: "flex", gap: "16px", marginBottom: "14px" }}>
                  <span className="badge badge-primary">{totalInstanceItems} items loaded</span>
                  <span className="badge badge-neutral">{totalInstanceWeight.toLocaleString()} kg total</span>
                </div>
                <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                  <table className="custom-table" style={{ border: "none" }}>
                    <thead style={{ position: "sticky", top: 0, background: "var(--surface)" }}>
                      <tr><th>Item ID</th><th>Stop</th><th>W (cm)</th><th>D (cm)</th><th>H (cm)</th><th>Weight (kg)</th><th>LBS</th><th>Type</th></tr>
                    </thead>
                    <tbody>
                      {instanceItems.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.id}</td>
                          <td>{item.stop || 1}</td>
                          <td>{item.length}</td>
                          <td>{item.depth}</td>
                          <td>{item.height}</td>
                          <td>{item.Weight || item.weight}</td>
                          <td>{item.LBS}</td>
                          <td>
                            <span className={`badge ${item.fragile ? "badge-warn" : "badge-neutral"}`}>
                              {item.fragile ? "Fragile" : "Standard"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============ STEP 3: ALGORITHM ============ */}
      <div className={`wiz-panel ${currentStep === 3 ? "active" : ""}`}>
        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Packing method</div>
                <div className="card-desc">Choose which approach the solver should use to arrange the items</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label className="strategy-opt">
                <input type="radio" name="strategy" checked={strategy === "DGWO"} onChange={() => setStrategy("DGWO")} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>Placement only <span className="field-hint" style={{ fontWeight: 400 }}>(DGWO)</span></div>
                  <div className="field-hint">Focuses purely on fitting items in tightly — doesn't balance safety rules against space</div>
                </div>
              </label>
              <label className="strategy-opt">
                <input type="radio" name="strategy" checked={strategy === "MOGWO"} onChange={() => setStrategy("MOGWO")} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>Rules only <span className="field-hint" style={{ fontWeight: 400 }}>(MOGWO)</span></div>
                  <div className="field-hint">Focuses purely on satisfying weight, fragility, and stop-order rules</div>
                </div>
              </label>
              <label className="strategy-opt">
                <input type="radio" name="strategy" checked={strategy === "Sequential"} onChange={() => setStrategy("Sequential")} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>Placement, then rules <span className="field-hint" style={{ fontWeight: 400 }}>(Sequential Hybrid)</span></div>
                  <div className="field-hint">Packs tightly first, then adjusts the layout to satisfy the rules</div>
                </div>
              </label>
              <label className="strategy-opt">
                <input type="radio" name="strategy" checked={strategy === "Repair-Based"} onChange={() => setStrategy("Repair-Based")} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>Fix as it goes <span className="field-hint" style={{ fontWeight: 400 }}>(Repair-Based Hybrid)</span></div>
                  <div className="field-hint">Checks and corrects each item's placement immediately as it's packed</div>
                </div>
              </label>
            </div>
            <style>{`
              .strategy-opt{ display:flex; gap:12px; align-items:flex-start; padding:11px 12px; border:1px solid var(--border); border-radius:var(--radius-md); cursor:pointer; }
              .strategy-opt:has(input:checked){ border-color:var(--primary); background:var(--primary-tint); }
              .strategy-opt input{ margin-top:3px; accent-color:var(--primary); }
            `}</style>

            <div className="divider"></div>
            <div className="grid grid-2">
              <div>
                <label className="field-label">Swarm size (pop)</label>
                <input type="number" value={wolfSize} onChange={(e) => setWolfSize(Number(e.target.value))} />
                <div className="field-hint">More can find better results, but takes longer</div>
              </div>
              <div>
                <label className="field-label">How many rounds to search</label>
                <input type="number" value={maxIter} onChange={(e) => setMaxIter(Number(e.target.value))} />
                <div className="field-hint">More rounds refine the result further</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Safety &amp; delivery rules</div>
                <div className="card-desc">Turn on the rules this packing plan needs to follow</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div className="constraint-row">
                <div>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>Stay under weight limit (C3)</div>
                  <div className="field-hint">Total load per container can't exceed its max weight</div>
                </div>
                <label className="switch"><input type="checkbox" checked disabled /><span className="slider"></span></label>
              </div>
              <div className="constraint-row">
                <div>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>Protect fragile items (C4)</div>
                  <div className="field-hint">Fragile boxes won't have heavy items stacked on top</div>
                </div>
                <label className="switch"><input type="checkbox" checked={fragilityConstraint} onChange={(e) => setFragilityConstraint(e.target.checked)} /><span className="slider"></span></label>
              </div>
              <div className="constraint-row">
                <div>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>Keep the load stable (C5)</div>
                  <div className="field-hint">Each item requires 80% base support so it won't tip</div>
                </div>
                <label className="switch"><input type="checkbox" checked disabled /><span className="slider"></span></label>
              </div>
              <div className="constraint-row">
                <div>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>Unload in the right order (C6)</div>
                  <div className="field-hint">Items for earlier stops are packed where they're reachable first (LIFO)</div>
                </div>
                <label className="switch"><input type="checkbox" checked={lifoConstraint} onChange={(e) => setLifoConstraint(e.target.checked)} /><span className="slider"></span></label>
              </div>
              <div className="constraint-row" style={{ borderBottom: "none" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>Allow items to be rotated (C1)</div>
                  <div className="field-hint">Lets the solver turn items sideways (3D Orthogonal) to fit more efficiently</div>
                </div>
                <label className="switch"><input type="checkbox" checked={rotationConstraint} onChange={(e) => setRotationConstraint(e.target.checked)} /><span className="slider"></span></label>
              </div>
            </div>
            <style>{`.constraint-row{ display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px 2px; border-bottom:1px solid var(--border); }`}</style>
          </div>
        </div>
      </div>

      {/* Persistent summary + nav */}
      <div className="card" style={{ marginTop: "20px", position: "sticky", bottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-2)", zIndex: 10 }}>
        <div style={{ display: "flex", gap: "22px", alignItems: "center" }}>
          <div>
            <span className="field-hint">Container</span>
            <div style={{ fontWeight: 700, fontSize: "13px" }}>{containerSpecs.L}×{containerSpecs.D}×{containerSpecs.H} cm</div>
          </div>
          <div style={{ width: "1px", height: "28px", background: "var(--border)" }}></div>
          <div>
            <span className="field-hint">Items</span>
            <div style={{ fontWeight: 700, fontSize: "13px" }}>
              {activeOption === "A" ? `${totalManualItems} ready · Manual` : `${totalInstanceItems} ready · wtpack`}
            </div>
          </div>
          <div style={{ width: "1px", height: "28px", background: "var(--border)" }}></div>
          <div>
            <span className="field-hint">Method</span>
            <div style={{ fontWeight: 700, fontSize: "13px" }}>{strategy}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {running ? (
            <>
              <span className="field-hint">Elapsed: {formatTime(elapsed)}</span>
              <button className="btn btn-danger-ghost" onClick={handleStopRun}>Stop</button>
            </>
          ) : (
            <>
              {currentStep > 1 && <button className="btn btn-secondary" onClick={() => goToStep(currentStep - 1)}>← Back</button>}
              {currentStep < 3 && <button className="btn btn-secondary" onClick={() => goToStep(currentStep + 1)}>Next step →</button>}
              {currentStep === 3 && (
                <>
                  <button className="btn btn-secondary" onClick={handleBenchmarkRun} disabled={!canRun}>Run Benchmark</button>
                  <button className="btn btn-primary" onClick={handleStartRun} disabled={!canRun}>
                    <svg viewBox="0 0 24 24" fill="currentColor" strokeWidth="2"><path d="M8 5v14l11-7z"/></svg>
                    Run optimizer
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
