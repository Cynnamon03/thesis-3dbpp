// client/src/Shell.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "./auth/AuthContext";
import logoImg from "./logo.png";

import DashboardTab from "./components/DashboardTab";
import LogisticsTab from "./components/LogisticsTab";
import ResultsTab from "./components/ResultsTab";
import CompareTab from "./components/CompareTab";
import VisualizationTab from "./components/VisualizationTab";
import RunHistoryTab from "./components/RunHistoryTab";
import AccountTab from "./components/AccountTab";

import { instancesApi, runsApi } from "./services/api";

export default function Shell() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Profile dropdown state
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Dataset selection & Loader states
  const [instances, setInstances] = useState([]);
  const [selected, setSelected] = useState("");
  const [loadingList, setLoadingList] = useState(true);

  // Dynamic Custom Configurations
  const [containerSpecs, setContainerSpecs] = useState({ L: 587, H: 233, D: 220 });
  const [maxLoad, setMaxLoad] = useState(28000);
  const [itemsList, setItemsList] = useState([]);       
  const [instanceItems, setInstanceItems] = useState([]); 
  const [isCustomized, setIsCustomized] = useState(false);

  // Algorithm Settings & Constraints
  const [strategy, setStrategy] = useState("Sequential");
  const [maxTime] = useState(90);
  const [wolfSize, setWolfSize] = useState(30);
  const [maxIter, setMaxIter] = useState(500);

  const [fragilityConstraint, setFragilityConstraint] = useState(false);
  const [rotationConstraint, setRotationConstraint] = useState(true);
  const [lifoConstraint, setLifoConstraint] = useState(false);

  // Track which option is active: "A" = manual, "B" = OR-Library
  const [activeOption, setActiveOption] = useState("A");

  // WebSocket & Live optimization run states
  const [wsConnected, setWsConnected] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Stream metrics
  const [instanceInfo, setInstanceInfo] = useState(null);
  const [placements, setPlacements] = useState(null);
  const [binsUsed, setBinsUsed] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState(null);

  // Run History
  const [runHistory, setRunHistory] = useState([]);

  // Benchmark State
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState(null);

  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Theme synchronization
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Load instances list
  useEffect(() => {
    instancesApi
      .getAll()
      .then((data) => {
        const list = data.instances || [];
        setInstances(list);
        setLoadingList(false);
      })
      .catch(() => {
        setError("Cannot reach backend server. Please verify the port 3001.");
        setLoadingList(false);
      });
  }, []);

  // Load selected instance details
  useEffect(() => {
    if (!selected) {
      setInstanceItems([]);
      return;
    }
    instancesApi
      .getDetails(selected)
      .then((data) => {
        if (data.container) {
          setContainerSpecs({ L: data.container.L, H: data.container.H, D: data.container.D });
        }
        if (data.items) {
          setInstanceItems(data.items);
        }
        setIsCustomized(false);
      })
      .catch(() => {});
  }, [selected]);

  // Fetch Run History
  const fetchRunHistory = useCallback(() => {
    runsApi
      .getHistory()
      .then((data) => setRunHistory(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchRunHistory();
  }, [fetchRunHistory]);

  // WebSocket message dispatcher
  const handleMessage = useCallback((msg) => {
    switch (msg.type) {
      case "instance_info":
        setInstanceInfo({ container: msg.container, n_items: msg.n_items, lower_bound: msg.lower_bound });
        break;

      case "iteration_update":
        setPlacements(msg.solution);
        setBinsUsed(msg.best_bins);
        setChartData((prev) => {
          const next = [...prev, { iter: msg.iteration, bins: msg.best_bins, composite: msg.best_composite }];
          return next.length > 150 ? next.slice(-150) : next;
        });
        setStats({
          iteration: msg.iteration,
          maxIter: msg.max_iter,
          bins: msg.best_bins,
          dissipation: msg.best_dissipation,
          composite: msg.best_composite,
          temperature: msg.temperature,
          lastUdhc: msg.last_udhc,
          udhcAccepted: msg.udhc_accepted,
        });
        break;

      case "instance_complete":
        setPlacements(msg.items);
        setBinsUsed(msg.bins_used);
        setFinalResult(msg);
        setRunning(false);
        // Persist run details
        runsApi.saveRun({
          strategy: strategy,
          instance: isCustomized ? "custom.json" : msg.instance.split(/[\\/]/).pop(),
          n_items: msg.n_items,
          space_util: msg.metrics?.M1_space_utilization_pct || msg.volume_util_pct,
          dissipation: msg.dissipation,
          runtime_s: msg.runtime_s,
          bins_used: msg.bins_used,
          placements: msg.items,
          container: msg.container
        }).then(() => fetchRunHistory()).catch(() => {});
        break;

      case "benchmark_start":
        setIsBenchmarking(true);
        setBenchmarkResults(null);
        setActiveTab("visualization");
        break;

      case "benchmark_complete":
        setIsBenchmarking(false);
        setBenchmarkResults(msg.results);
        break;

      case "benchmark_closed":
        setIsBenchmarking(false);
        if (msg.code !== 0) setError(`Benchmark process exited with code ${msg.code}`);
        break;

      case "stopped":
        setRunning(false);
        setIsBenchmarking(false);
        break;

      case "run_closed":
        if (msg.code !== 0) setError(`Optimizer process exited with code ${msg.code}`);
        setRunning(false);
        break;

      case "error":
        setError(msg.error);
        setRunning(false);
        break;

      default:
        break;
    }
  }, [strategy, isCustomized, fetchRunHistory]);

  const connect = useCallback(() => {
    const ws = new WebSocket("ws://localhost:3002");
    wsRef.current = ws;

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => {
      setWsConnected(false);
      reconnectRef.current = setTimeout(connect, 3000);
    };
    ws.onerror = () => {};
    ws.onmessage = (e) => {
      try {
        handleMessage(JSON.parse(e.data));
      } catch {}
    };
  }, [handleMessage]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  // Keep WebSocket message callback fresh
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.onmessage = (e) => {
        try {
          handleMessage(JSON.parse(e.data));
        } catch {}
      };
    }
  }, [handleMessage]);

  // Run timer
  useEffect(() => {
    if (!running) {
      setElapsed(0);
      return;
    }
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  // Run handler
  const handleStartRun = useCallback(async () => {
    if (running || !wsConnected) return;
    setRunning(true);
    setInstanceInfo(null);
    setPlacements(null);
    setBinsUsed(0);
    setChartData([]);
    setStats(null);
    setFinalResult(null);
    setError(null);

    let runPath = selected;

    if (isCustomized || !selected) {
      try {
        const data = await instancesApi.saveCustom({
          container: containerSpecs,
          items: activeOption === "A" ? itemsList : instanceItems
        });
        if (data.path) {
          runPath = data.path;
        } else {
          throw new Error(data.error || "Failed to compile custom configuration");
        }
      } catch (err) {
        setError(err.message);
        setRunning(false);
        return;
      }
    }

    wsRef.current.send(JSON.stringify({ action: "run", instancePath: runPath, maxTime, strategy }));
    setActiveTab("visualization");
  }, [selected, running, wsConnected, maxTime, isCustomized, containerSpecs, itemsList, instanceItems, activeOption, strategy]);

  const handleBenchmarkRun = useCallback(async () => {
    if (isBenchmarking || !wsConnected) return;
    setIsBenchmarking(true);
    setBenchmarkResults(null);
    setError(null);

    let runPath = selected;
    if (isCustomized || !selected) {
      try {
        const data = await instancesApi.saveCustom({ 
          container: containerSpecs, 
          items: activeOption === "A" ? itemsList : instanceItems 
        });
        if (data.path) runPath = data.path;
        else throw new Error(data.error || "Failed to compile custom configuration");
      } catch (err) {
        setError(err.message);
        setIsBenchmarking(false);
        return;
      }
    }
    wsRef.current.send(JSON.stringify({ action: "benchmark", instancePath: runPath, maxTime }));
    setActiveTab("visualization");
  }, [selected, isBenchmarking, wsConnected, maxTime, isCustomized, containerSpecs, itemsList, instanceItems, activeOption]);

  const handleStopRun = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ action: "stop" }));
  }, []);

  // Exporters
  const handleExportResultsCSV = () => {
    if (!finalResult || !finalResult.items) return;
    const headers = "Sequence,Item ID,Bin ID,X,Y,Z,Length,Height,Depth\n";
    const rows = finalResult.items.map((item, idx) => 
      `${idx + 1},${item.id},Bin ${item.bin_id},${item.x},${item.y},${item.z},${item.l},${item.h},${item.d}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `STACKR-Packing-Results-${isCustomized ? "custom" : finalResult.instance.split(/[\\/]/).pop().replace('.json', '')}.csv`;
    link.click();
  };

  const handleExportReport = () => {
    window.print();
  };

  const handleExportHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(runHistory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "STACKR-optimization-history.json");
    downloadAnchor.click();
  };

  const handleLoadVisualization = useCallback((run) => {
    if (!run || !run.placements || !run.container) return;
    setPlacements(run.placements);
    setInstanceInfo({
      container: run.container,
      n_items: run.placements.length,
      lower_bound: 1
    });
    setBinsUsed(run.bins_used || 1);
    setActiveTab("visualization");
  }, []);

  // Group dataset instances
  const groupedInstances = useMemo(() => {
    const g = {};
    for (const inst of instances) {
      if (!g[inst.set]) g[inst.set] = [];
      g[inst.set].push(inst);
    }
    return g;
  }, [instances]);

  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "US";

  // Calculate actual X, Y, Z axis utilization dynamically
  const axisUtil = useMemo(() => {
    if (!finalResult || !finalResult.items || !finalResult.container) return { x: 91, y: 84, z: 78 };
    const { L, H, D } = finalResult.container;
    let maxX = 0, maxY = 0, maxZ = 0;
    for (const item of finalResult.items) {
      if (item.x + item.l > maxX) maxX = item.x + item.l;
      if (item.y + item.h > maxY) maxY = item.y + item.h;
      if (item.z + item.d > maxZ) maxZ = item.z + item.d;
    }
    return {
      x: Math.round(Math.min(100, (maxX / L) * 100)),
      y: Math.round(Math.min(100, (maxY / H) * 100)),
      z: Math.round(Math.min(100, (maxZ / D) * 100)),
    };
  }, [finalResult]);

  const canRun = wsConnected && !running && (itemsList.length > 0 || instanceItems.length > 0);

  const activeItemsCount = activeOption === "A" ? itemsList.length : instanceItems.length;

  const tabTitles = {
    dashboard: "Dashboard",
    logistics: "Logistics",
    results: "Results",
    compare: "Compare Runs",
    visualization: "Visualization",
    history: "Run History",
    account: "Account Settings"
  };

  return (
    <div className="app">
      
      {/* ============ SIDEBAR ============ */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} id="sidebar">
        <div className="sidebar-brand">
          <img src={logoImg} alt="STACKR Logo" style={{ width: "34px", height: "34px", borderRadius: "9px", objectFit: "contain", flexShrink: 0 }} />
          <div>
            <div className="brand-text">STACKR</div>
            <div className="brand-sub">3D Bin Packing Optimizer</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Overview</div>
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
            <span>Dashboard</span>
          </button>

          <div className="nav-section-label">Workspace</div>
          <button className={`nav-item ${activeTab === 'logistics' ? 'active' : ''}`} onClick={() => setActiveTab('logistics')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>
            <span>Logistics</span>
          </button>
          <button className={`nav-item ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>
            <span>Results</span>
          </button>
          <button className={`nav-item ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="10" width="4" height="11"/><rect x="10" y="5" width="4" height="16"/><rect x="17" y="13" width="4" height="8"/></svg>
            <span>Compare Runs</span>
          </button>
          <button className={`nav-item ${activeTab === 'visualization' ? 'active' : ''}`} onClick={() => setActiveTab('visualization')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12l8.73-5.04"/><path d="M12 22.08V12"/></svg>
            <span>Visualization</span>
          </button>
          <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 106 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
            <span>Run History</span>
          </button>

          <div className="nav-section-label">Account</div>
          <button className={`nav-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>
            <span>Account Settings</span>
          </button>
        </nav>

        <div className="sidebar-foot">
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M15 18l-6-6 6-6"/></svg>
            <span>Collapse</span>
          </button>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <div className="crumb">STACKR / <b>{tabTitles[activeTab]}</b></div>
            <div className="page-title">{tabTitles[activeTab]}</div>
          </div>
          <div className="topbar-right">
            <span className="chip"><span className="chip-dot"></span>Sample load: Medium ({activeItemsCount} items)</span>
            <button className="icon-btn" title="Toggle dark mode" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
              {theme === "light" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button className="avatar-btn" onClick={() => setProfileOpen((o) => !o)} title="Account">
                {initials}
              </button>
              {profileOpen && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: "46px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  width: "220px",
                  boxShadow: "var(--shadow-lg)",
                  padding: "16px",
                  zIndex: 1000
                }}>
                  <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "12px" }}>
                    <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-main)" }}>{user?.name || "User"}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-dim)", textTransform: "capitalize" }}>{user?.role || "Researcher"}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "1px solid var(--red)",
                      borderRadius: "6px",
                      color: "var(--red)",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer",
                      textAlign: "center"
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── ERROR DISPLAY ── */}
        {error && (
          <div style={{ margin: "16px 28px 0", background: "var(--danger-tint)", border: "1px solid var(--danger)", borderRadius: "8px", padding: "12px 18px", color: "var(--danger)", fontSize: "14px" }}>
            ⚠ {error}
          </div>
        )}

        <main className="content">
          <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
            <DashboardTab runHistory={runHistory} setActiveTab={setActiveTab} />
          </div>

          <div style={{ display: activeTab === 'logistics' ? 'block' : 'none' }}>
            <LogisticsTab
              containerSpecs={containerSpecs}
              setContainerSpecs={setContainerSpecs}
              maxLoad={maxLoad}
              setMaxLoad={setMaxLoad}
              strategy={strategy}
              setStrategy={setStrategy}
              wolfSize={wolfSize}
              setWolfSize={setWolfSize}
              maxIter={maxIter}
              setMaxIter={setMaxIter}
              fragilityConstraint={fragilityConstraint}
              setFragilityConstraint={setFragilityConstraint}
              rotationConstraint={rotationConstraint}
              setRotationConstraint={setRotationConstraint}
              lifoConstraint={lifoConstraint}
              setLifoConstraint={setLifoConstraint}
              itemsList={itemsList}
              setItemsList={setItemsList}
              setIsCustomized={setIsCustomized}
              instanceItems={instanceItems}
              loadingList={loadingList}
              selected={selected}
              setSelected={setSelected}
              groupedInstances={groupedInstances}
              running={running}
              elapsed={elapsed}
              handleStartRun={handleStartRun}
              handleStopRun={handleStopRun}
              handleBenchmarkRun={handleBenchmarkRun}
              isBenchmarking={isBenchmarking}
              canRun={canRun}
              activeOption={activeOption}
              setActiveOption={setActiveOption}
            />
          </div>

          <div style={{ display: activeTab === 'results' ? 'block' : 'none' }}>
            <ResultsTab
              finalResult={finalResult}
              runHistory={runHistory}
              strategy={strategy}
              stats={stats}
              axisUtil={axisUtil}
              chartData={chartData}
              maxIter={maxIter}
              handleExportResultsCSV={handleExportResultsCSV}
              handleExportReport={handleExportReport}
            />
          </div>

          <div style={{ display: activeTab === 'compare' ? 'block' : 'none' }}>
            <CompareTab runHistory={runHistory} />
          </div>

          <div style={{ display: activeTab === 'visualization' ? 'block' : 'none' }}>
            <VisualizationTab
              placements={placements}
              itemsList={itemsList}
              instanceInfo={instanceInfo}
              binsUsed={binsUsed}
              running={running}
              isBenchmarking={isBenchmarking}
              benchmarkResults={benchmarkResults}
            />
          </div>

          <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
            <RunHistoryTab
              runHistory={runHistory}
              handleExportHistory={handleExportHistory}
              onLoadVisualization={handleLoadVisualization}
            />
          </div>

          <div style={{ display: activeTab === 'account' ? 'block' : 'none' }}>
            <AccountTab user={user} logout={logout} />
          </div>
        </main>
      </div>
    </div>
  );
}
