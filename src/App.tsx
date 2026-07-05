import React, { useState, useEffect } from "react";
import { 
  Shield, Cpu, Clock, Terminal, Layers, BarChart2, Key, Info, HelpCircle, 
  Settings, Play, RefreshCw, AlertTriangle, CheckCircle, Database, 
  ChevronRight, ArrowRight, Zap, Code, ShieldAlert, BookOpen, FileText, Download, Check
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import Benchmarks from "./components/Benchmarks";
import Specification from "./components/Specification";
import { VerificationReport, AuditRecord } from "./types";
import { AVATAR_PRESETS, getSvgDataUrl } from "./lib/avatarPresets";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [latestReport, setLatestReport] = useState<VerificationReport | null>(null);
  const [ledger, setLedger] = useState<AuditRecord[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // AI Identity Customizer states
  const [aiAvatar, setAiAvatar] = useState<string>(getSvgDataUrl(AVATAR_PRESETS[0].svgContent));
  const [aiVoice, setAiVoice] = useState<string>("Aria (Holographic Alt-Tenor)");
  const [isMimicked, setIsMimicked] = useState<boolean>(false);

  // States for interactive tabs simulation
  const [simReplaySpeed, setSimReplaySpeed] = useState<number>(1);
  const [simStateDriftThreshold, setSimStateDriftThreshold] = useState<number>(0.05);
  const [simulatingReplay, setSimulatingReplay] = useState(false);
  const [replayLog, setReplayLog] = useState<string[]>([]);
  const [activeReplayStep, setActiveReplayStep] = useState<number>(-1);

  // Active user selections
  const [apiMethod, setApiMethod] = useState<string>("POST");
  const [apiEndpoint, setApiEndpoint] = useState<string>("/vek/verify");
  const [simApiLoading, setSimApiLoading] = useState(false);
  const [simApiResponse, setSimApiResponse] = useState<any>(null);

  // Load audit ledger initial data
  const fetchLedger = async () => {
    setLoadingLedger(true);
    try {
      const response = await fetch("/api/ledger");
      const data = await response.json();
      setLedger(data.ledger);
    } catch (err) {
      console.error("Failed to load audit ledger:", err);
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleVerificationSuccess = (report: VerificationReport) => {
    setLatestReport(report);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Run a state replay visual simulation in the Replay page
  const runStateReplaySimulation = () => {
    setSimulatingReplay(true);
    setActiveReplayStep(0);
    setReplayLog(["[REPLAY_START] Initiating zero-clock state replay analyzer..."]);

    const timers = [
      setTimeout(() => {
        setActiveReplayStep(1);
        setReplayLog(prev => [...prev, "[REPLAY_STAGE_1] Loading static verification keys and execution contract parameters."]);
      }, 700 / simReplaySpeed),
      setTimeout(() => {
        setActiveReplayStep(2);
        setReplayLog(prev => [...prev, "[REPLAY_STAGE_2] Compiling transition state matrices. Standard timing parameters: 12.0ms limit."]);
      }, 1400 / simReplaySpeed),
      setTimeout(() => {
        setActiveReplayStep(3);
        const drift = Math.random() * 0.09;
        const failed = drift > simStateDriftThreshold;
        setActiveReplayStep(4);
        if (failed) {
          setReplayLog(prev => [
            ...prev,
            `[REPLAY_FAILURE] State timing drift detected: ${(drift * 100).toFixed(2)}ms variance exceeds limit ${simStateDriftThreshold * 100}ms.`,
            `[REPLAY_DIFF] Active state mismatch identified at transition index 0x9B4.`
          ]);
        } else {
          setReplayLog(prev => [
            ...prev,
            `[REPLAY_SUCCESS] No critical timing drift identified: ${(drift * 100).toFixed(2)}ms compliance matches limit.`,
            `[REPLAY_HASH] Generated identical deterministic execution proof hash.`
          ]);
        }
        setSimulatingReplay(false);
      }, 2100 / simReplaySpeed)
    ];
  };

  const currentSessionID = latestReport?.metadata?.sessionID || "SES-89241-VEK";
  const currentTraceID = latestReport?.metadata?.traceID || "TR-5510-A9";
  const currentMemory = latestReport ? "12.8" : "12.4";
  const currentCPU = latestReport ? "6.8" : "4.1";

  return (
    <div id="vek-console-main-container" className="w-full min-h-screen bg-[#09090b] text-[#e4e4e7] flex flex-col font-sans overflow-x-hidden selection:bg-blue-500/30 selection:text-white">
      
      {/* HEADER NAVIGATION */}
      <nav className="h-14 border-b border-[#27272a] bg-[#0c0c0e] flex items-center justify-between px-6 shrink-0 sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white select-none">
            V
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight uppercase leading-tight text-white font-mono flex items-center gap-1.5">
              VEK Console 2.4.0
            </h1>
            <p className="text-[10px] text-blue-500 uppercase tracking-[0.15em] font-medium">
              Verifiable Execution Kernel
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden lg:flex items-center space-x-1.5 text-[11px] uppercase font-semibold tracking-wider font-mono">
          {["Dashboard", "Execution", "Replay", "Evidence", "Audit", "Benchmarks", "Specification", "Licensing", "API", "Settings"].map((tab) => (
            <button
              key={tab}
              id={`nav-tab-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded transition duration-200 ${
                activeTab === tab 
                  ? "bg-[#18181b] text-white border-b-2 border-blue-500 font-bold" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Live System Status Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#18181b] px-3 py-1 rounded border border-[#27272a]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">KERNEL: ONLINE</span>
          </div>
        </div>
      </nav>

      {/* MOBILE TABS MENU BAR */}
      <div className="lg:hidden bg-[#0c0c0e] border-b border-[#27272a] p-2 flex overflow-x-auto gap-1 scrollbar-none shrink-0 font-mono text-[10px] uppercase">
        {["Dashboard", "Execution", "Replay", "Evidence", "Audit", "Benchmarks", "Specification", "Licensing", "API", "Settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded transition whitespace-nowrap shrink-0 ${
              activeTab === tab 
                ? "bg-blue-600 text-white font-bold" 
                : "bg-black/40 text-zinc-400 border border-[#27272a]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* MAIN CONTAINER FRAME */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 overflow-y-auto">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === "Dashboard" && (
          <Dashboard 
            latestReport={latestReport} 
            onVerificationSuccess={handleVerificationSuccess}
            ledger={ledger}
            refreshLedger={fetchLedger}
            aiAvatar={aiAvatar}
            setAiAvatar={setAiAvatar}
            aiVoice={aiVoice}
            setAiVoice={setAiVoice}
            isMimicked={isMimicked}
            setIsMimicked={setIsMimicked}
          />
        )}

        {/* TAB 2: EXECUTION */}
        {activeTab === "Execution" && (
          <div className="space-y-6">
            <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-widest font-mono mb-1">
                Module 2: VEK Policy Contract Layer
              </h2>
              <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
                The policy validation engine matches text structures, formats, and safety boundaries against strict execution contracts before signing the outputs.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Active Contracts Policy list */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Governed Verification Policies</h3>
                
                <div className="space-y-3">
                  {[
                    { id: "VEK-POL-4410", name: "Aerospace Failsafe Bounds Rule", domain: "Aerospace", status: "Active", desc: "Validates high-level UAS altitude ceilings, telemetry redundant uplinks, and return-to-home trigger conditions." },
                    { id: "VEK-POL-4411", name: "Financial Risk-Tolerance Margin Check", domain: "Finance", status: "Active", desc: "Enforces strict limits on collateral liquidations, interest bounds calculation epochs, and oracle deviation variances." },
                    { id: "VEK-POL-4412", name: "Clinical Biological Safety Constraint", domain: "Healthcare", status: "Active", desc: "Ensures daily active dosage formulas cannot violate serum boundaries or cause interaction anomalies." },
                    { id: "VEK-POL-4413", name: "Industrial SCADA Safety Interlocks Check", domain: "Industrial", status: "Active", desc: "Checks for atomic SCADA sequence variables, transition thresholds, and grid failure safety routines." }
                  ].map((p, idx) => (
                    <div key={idx} className="bg-[#0c0c0e] border border-[#27272a] p-4 rounded-lg flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] bg-blue-950/20 text-blue-400 border border-blue-500/10 px-1.5 py-0.5 rounded font-mono font-bold">{p.id}</span>
                          <span className="text-xs text-zinc-200 font-bold font-mono">{p.name}</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
                        <span className="text-[10px] text-zinc-500 font-mono mt-2 block uppercase">Target Domain: {p.domain}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-950/20 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded font-mono font-bold shrink-0">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transition Rule contract visual block */}
              <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5 space-y-4 font-mono">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#27272a]">Active Contract Schema Signature</h3>
                
                <div className="bg-black border border-[#27272a] p-4 rounded text-[11px] text-zinc-300 space-y-2 h-[220px] overflow-y-auto">
                  <div>{"{"}</div>
                  <div className="pl-4">{"\"$schema\": \"https://vek.dev/v2.3.0/policy.schema.json\","}</div>
                  <div className="pl-4">{"\"id\": \"VEK-CONTRACT-V2-30\","}</div>
                  <div className="pl-4">{"\"requirements\": ["}</div>
                  <div className="pl-8">{"{\"type\": \"structure\", \"format\": \"numbered_bullet\"},"}</div>
                  <div className="pl-8">{"{\"type\": \"boundary\", \"safety_variance\": \"static\"},"}</div>
                  <div className="pl-8">{"{\"type\": \"transition\", \"verification\": \"deterministic\"}"}</div>
                  <div className="pl-4">{"],"}</div>
                  <div className="pl-4">{"\"allowed_domains\": [\"aerospace\", \"healthcare\", \"finance\", \"industrial\"],"}</div>
                  <div className="pl-4">{"\"sign_keys\": [\"0x7F2B00A19E8B\", \"0x9C22100EFF1B\"]"}</div>
                  <div>{"}"}</div>
                </div>

                <div className="bg-black/40 border border-[#27272a] p-3 rounded text-[11px] text-zinc-400 space-y-1">
                  <span className="text-zinc-500 font-bold block uppercase text-[10px]">Policy Verification Key</span>
                  <div className="font-mono text-zinc-300 break-all select-all">
                    f6e1a90c1284eb3b44ab20ef918c7c919a01f82beee93201
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: REPLAY */}
        {activeTab === "Replay" && (
          <div className="space-y-6">
            <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-widest font-mono mb-1">
                Module 3: Deterministic State Replay Simulation
              </h2>
              <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
                Deterministic replay re-executes the logical flow multiple times under controlled constraints to check if non-determinism, ambient clock drift, or out-of-order execution alters state transitions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
              
              {/* Simulation Controls Panel */}
              <div className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#27272a]">Replay Simulation Controls</h3>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>Simulation Speed:</span>
                      <span className="text-blue-500 font-bold">{simReplaySpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={4}
                      step={0.5}
                      value={simReplaySpeed}
                      onChange={(e) => setSimReplaySpeed(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 bg-black h-1 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>Allowed Drift Threshold:</span>
                      <span className="text-amber-500 font-bold">{(simStateDriftThreshold * 100).toFixed(1)}ms</span>
                    </div>
                    <input
                      type="range"
                      min={0.01}
                      max={0.1}
                      step={0.01}
                      value={simStateDriftThreshold}
                      onChange={(e) => setSimStateDriftThreshold(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 bg-black h-1 rounded"
                    />
                  </div>
                </div>

                <button
                  id="start-replay-sim-btn"
                  onClick={runStateReplaySimulation}
                  disabled={simulatingReplay}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-[#18181b] disabled:text-zinc-600 text-white font-bold py-2.5 rounded text-center tracking-[0.2em] uppercase transition"
                >
                  {simulatingReplay ? "Running Replay Analyzer..." : "Execute Replay Cycle"}
                </button>
              </div>

              {/* Simulation Real-time Log */}
              <div className="lg:col-span-2 bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg flex flex-col justify-between min-h-[300px]">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#27272a] mb-3">Replay Transition Thread Log</h3>
                  
                  <div className="bg-black border border-[#27272a] p-4 rounded h-[180px] overflow-y-auto space-y-1.5 leading-relaxed text-zinc-400 scrollbar-thin">
                    {replayLog.length === 0 ? (
                      <span className="text-zinc-600">Replay trace channel idle. Adjust constraints and execute above to begin.</span>
                    ) : (
                      replayLog.map((log, idx) => (
                        <div key={idx} className={log.includes("FAILURE") ? "text-red-400 font-bold" : log.includes("SUCCESS") ? "text-emerald-400 font-bold" : "text-zinc-300"}>
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Simulated timing trace segments visual mapping */}
                <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[#27272a] text-center">
                  {[
                    { label: "STATE_INIT", time: "0.0ms", active: activeReplayStep >= 0 },
                    { label: "PARAM_LOAD", time: "0.2ms", active: activeReplayStep >= 1 },
                    { label: "RULE_VALID", time: "0.5ms", active: activeReplayStep >= 2 },
                    { label: "HASH_VERIFY", time: "1.1ms", active: activeReplayStep >= 3 }
                  ].map((s, idx) => (
                    <div key={idx} className={`p-2 border rounded ${s.active ? "bg-blue-950/10 border-blue-500 text-blue-400" : "bg-black border-[#27272a] text-zinc-600"}`}>
                      <div className="font-bold text-[10px]">{s.label}</div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">{s.time}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: EVIDENCE */}
        {activeTab === "Evidence" && (
          <div className="space-y-6">
            <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-widest font-mono mb-1">
                Module 4: Evidence Analysis Engine
              </h2>
              <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
                Evaluates verified execution outputs against primary external records to determine support strength, alternative hypotheses, and parameter contradictions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Evidence correlation table */}
              <div className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Evidence Correlation Mapping</h3>
                
                <div className="space-y-2">
                  {[
                    { doc: "Standard ISO-26262 Automotive Safety Directive", support: 0.96, category: "Structural Check", match: "High Compliance" },
                    { doc: "Field UAS Flight Path Specification v4.1", support: 0.88, category: "Quantitative Bounds", match: "Correlated" },
                    { doc: "Protocol Smart-Contract State Definitions", support: 0.92, category: "Transition Rules", match: "Verified Clean" },
                    { doc: "Alternate Collision Avoidance Strategy Logs", support: 0.45, category: "Dynamic Boundaries", match: "Partial Conflict Option" }
                  ].map((doc, idx) => (
                    <div key={idx} className="bg-black border border-[#27272a] p-3 rounded flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-zinc-200 block font-semibold truncate max-w-[280px]">{doc.doc}</span>
                        <span className="text-[10px] text-zinc-500">{doc.category} • {doc.match}</span>
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <span className="text-blue-500 font-bold block">{(doc.support * 100).toFixed(0)}% Match</span>
                        <div className="w-16 bg-[#18181b] h-1 rounded-full overflow-hidden mt-1">
                          <div className="bg-blue-500 h-full" style={{ width: `${doc.support * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conflict Detection Sandbox */}
              <div className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg space-y-4 font-mono text-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#27272a]">Conflict & Alternative Analysis Panel</h3>
                
                <div className="bg-black border border-[#27272a] p-4 rounded space-y-3 leading-relaxed text-zinc-300 italic">
                  <p>
                    "Verification Engine parses alternate support paths. The alternative hypothesis identifies standard wind threshold failures at 35kts as a valid boundary constraint. No active parameter conflicts are present in the primary execution chain."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-black border border-[#27272a] p-3 rounded">
                    <span className="text-zinc-500 block mb-1 font-bold text-[10px] uppercase">Consistency Index</span>
                    <span className="text-emerald-400 font-bold text-lg">98.2%</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Aligned with baseline specs.</p>
                  </div>
                  <div className="bg-black border border-[#27272a] p-3 rounded">
                    <span className="text-zinc-500 block mb-1 font-bold text-[10px] uppercase">Uncertainty Margin</span>
                    <span className="text-blue-500 font-bold text-lg">± 1.8%</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Calculated state variance.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: AUDIT */}
        {activeTab === "Audit" && (
          <div className="space-y-6">
            <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-widest font-mono mb-1">
                Module 7: Cryptographic Audit Ledger
              </h2>
              <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
                Immutable record logs of session tokens, trace variables, execution signatures, and computed decision hashes, stored chronologically for strict governance compliance.
              </p>
            </div>

            {/* Ledger Filter & Actions */}
            <div className="bg-[#0c0c0e] border border-[#27272a] p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
              <span className="text-zinc-400 font-bold uppercase tracking-wider">Active Cryptographic Audit Trail</span>
              <button
                id="refresh-ledger-btn"
                onClick={fetchLedger}
                disabled={loadingLedger}
                className="bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border border-[#27272a] px-3.5 py-1.5 rounded flex items-center gap-2 transition uppercase text-[11px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLedger ? "animate-spin" : ""}`} />
                Sync Audit Ledger
              </button>
            </div>

            {/* Interactive Audit Table */}
            <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg overflow-hidden font-mono text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black border-b border-[#27272a] text-zinc-500 text-[10px] uppercase tracking-widest">
                      <th className="p-4 font-bold">Record ID</th>
                      <th className="p-4 font-bold">Category</th>
                      <th className="p-4 font-bold">Session ID / Trace ID</th>
                      <th className="p-4 font-bold">Prompt Parameter</th>
                      <th className="p-4 font-bold">Execution Hash</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a]/40">
                    {ledger.map((record, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/10 transition">
                        <td className="p-4 font-bold text-blue-500">{record.id}</td>
                        <td className="p-4 text-zinc-400">{record.category}</td>
                        <td className="p-4">
                          <span className="block text-zinc-300">{record.sessionID}</span>
                          <span className="text-[10px] text-zinc-500">{record.traceID}</span>
                        </td>
                        <td className="p-4 text-zinc-400 max-w-[250px] truncate">{record.prompt}</td>
                        <td className="p-4 text-zinc-300 select-all font-semibold tracking-wider font-mono">{record.executionHash}</td>
                        <td className="p-4 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            record.status === "PASS" 
                              ? "bg-emerald-950/20 text-emerald-400 border border-emerald-500/10" 
                              : "bg-red-950/20 text-red-400 border border-red-500/10"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BENCHMARKS */}
        {activeTab === "Benchmarks" && (
          <Benchmarks />
        )}

        {/* TAB SPECIFICATION */}
        {activeTab === "Specification" && (
          <Specification />
        )}

        {/* TAB 7: LICENSING */}
        {activeTab === "Licensing" && (
          <div className="space-y-6">
            <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-widest font-mono mb-1">
                Enterprise Licensing & Regulatory Claims
              </h2>
              <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
                Review verified platform deployment configurations, claim maps, system validation packages, and developer repository access credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
              
              {/* License Option 1 */}
              <div className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#27272a]">
                  <span className="font-bold text-zinc-300 uppercase tracking-widest">Enterprise Premium</span>
                  <span className="text-[10px] bg-blue-950/20 text-blue-400 border border-blue-500/10 px-2 py-0.5 rounded font-bold">Active License</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Allows deployment inside private cloud infrastructure (Google Cloud, AWS, Azure). Full multi-threaded deterministic replay guarantees and priority compliance logging.
                </p>
                <div className="bg-black p-3 rounded text-[11px] text-zinc-500 space-y-1.5">
                  <div className="flex justify-between"><span>Max TPS:</span><span className="text-zinc-300 font-bold">12,000 / sec</span></div>
                  <div className="flex justify-between"><span>Node Isolation:</span><span className="text-emerald-400 font-bold uppercase">SECURED</span></div>
                  <div className="flex justify-between"><span>Replay Rate:</span><span className="text-emerald-400 font-bold">100% Guaranteed</span></div>
                </div>
              </div>

              {/* License Option 2 */}
              <div className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#27272a]">
                  <span className="font-bold text-zinc-400 uppercase tracking-widest">Government / DoD</span>
                  <span className="text-[10px] bg-[#18181b] text-zinc-500 border border-[#27272a] px-2 py-0.5 rounded font-bold">Available Upgrade</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Configured for air-gapped secure facility servers. High levels of tamper resistance, compliant with aerospace safety DO-178C, and nuclear automation SCADA directives.
                </p>
                <div className="bg-black p-3 rounded text-[11px] text-zinc-500 space-y-1.5">
                  <div className="flex justify-between"><span>Regulatory Directives:</span><span className="text-zinc-300 font-bold">DO-178C, ISO-26262</span></div>
                  <div className="flex justify-between"><span>Airgapped:</span><span className="text-zinc-300 font-bold">Yes</span></div>
                  <div className="flex justify-between"><span>FIPS Compliance:</span><span className="text-zinc-300 font-bold">140-3 Level 4</span></div>
                </div>
              </div>

              {/* Claim Mapping Documentation */}
              <div className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#27272a] mb-3">Claim Mapping Documents</h3>
                  <ul className="space-y-2.5">
                    {[
                      { name: "DO-178C Compliance Mapping.pdf", size: "2.4 MB" },
                      { name: "ISO-26262 System Verification.pdf", size: "1.8 MB" },
                      { name: "Audit Integrity Ledger Rules.pdf", size: "850 KB" }
                    ].map((doc, idx) => (
                      <li key={idx} className="flex items-center justify-between text-zinc-300 bg-black p-2 rounded border border-[#27272a]/60">
                        <span className="truncate max-w-[150px]">{doc.name}</span>
                        <button className="text-blue-500 hover:text-blue-400 font-bold flex items-center gap-1 shrink-0">
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#27272a] text-[10px] text-zinc-500">
                  Engineering documentation updated: Today, 15:00 UTC.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 8: API */}
        {activeTab === "API" && (
          <div className="space-y-6">
            <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-widest font-mono mb-1">
                VEK Platform REST API Developer Sandbox
              </h2>
              <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
                Integrate Verifiable Execution Kernel policies into external automated pipelines using standard HTTP REST request and response payload models.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
              
              {/* Interactive Endpoint Selector and Request Form */}
              <div className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#27272a]">Active Endpoint Playground</h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { method: "POST", route: "/vek/verify" },
                      { method: "POST", route: "/vek/replay" },
                      { method: "POST", route: "/vek/analyze" }
                    ].map((ep, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setApiMethod(ep.method);
                          setApiEndpoint(ep.route);
                          setSimApiResponse(null);
                        }}
                        className={`p-2 border rounded text-center transition ${
                          apiEndpoint === ep.route 
                            ? "bg-[#18181b] border-blue-500 text-blue-400 font-bold" 
                            : "bg-black border-[#27272a] text-zinc-500"
                        }`}
                      >
                        <span className="text-[9px] block text-zinc-500">{ep.method}</span>
                        <span className="text-[10px]">{ep.route}</span>
                      </button>
                    ))}
                  </div>

                  {/* Body query template codebox */}
                  <div className="space-y-1">
                    <span className="text-zinc-500 block text-[10px] uppercase">JSON Request Body Schema:</span>
                    <div className="bg-black border border-[#27272a] p-3 rounded text-[11px] text-zinc-300">
                      <div>{"{"}</div>
                      <div className="pl-4">{"\"prompt\": \"Evaluate path parameters for UAS-04 under 400ft\","}</div>
                      <div className="pl-4">{"\"simulateFailure\": false"}</div>
                      <div>{"}"}</div>
                    </div>
                  </div>

                  <button
                    id="trigger-api-sandbox-btn"
                    onClick={() => {
                      setSimApiLoading(true);
                      setTimeout(() => {
                        setSimApiResponse({
                          status: "success",
                          trace_id: "TR-9201-F3",
                          execution_hash: "a9bf28dce109b8f2",
                          decision_hash: "11fe8bc91d82cc7a",
                          results: {
                            policy_verification: "PASS",
                            replay_match: true,
                            confidence: "Very High"
                          },
                          timestamp: new Date().toISOString()
                        });
                        setSimApiLoading(false);
                      }, 1000);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded tracking-[0.2em] uppercase transition"
                  >
                    {simApiLoading ? "Sending Payload..." : "Test Endpoint Response"}
                  </button>
                </div>
              </div>

              {/* Endpoint Response Sandbox View */}
              <div className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg flex flex-col justify-between min-h-[350px]">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#27272a] mb-3">Response Output Payload previewer</h3>
                  
                  <div className="bg-black border border-[#27272a] p-4 rounded h-[220px] overflow-y-auto font-mono text-[11px] text-zinc-300 scrollbar-thin">
                    {simApiResponse ? (
                      <pre>{JSON.stringify(simApiResponse, null, 2)}</pre>
                    ) : (
                      <span className="text-zinc-600">Send an endpoint request from the left sandbox panel to capture response telemetry.</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#27272a] text-[10px] text-zinc-500 flex justify-between items-center">
                  <span>API Response Code: <b className={simApiResponse ? "text-emerald-400" : "text-zinc-500"}>{simApiResponse ? "200 OK" : "N/A"}</b></span>
                  <span>Port: 3000 Standard API</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS */}
        {activeTab === "Settings" && (
          <div className="space-y-6">
            <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-widest font-mono mb-1">
                VEK Platform System Settings
              </h2>
              <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
                Adjust execution environments, toggle dynamic clock safety guards, isolate thread memories, or wipe local ledger caches.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              
              {/* Security Isolation and Clock configurations */}
              <div className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#27272a]">Verification Policy Settings</h3>
                
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-200 block">Encrypted State Isolation</span>
                      <span className="text-[10px] text-zinc-500 block">Ensures execution thread isolation.</span>
                    </div>
                    <span className="text-[10px] bg-emerald-950/20 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded font-bold uppercase">ENABLED</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-200 block">Zero-Clock Drift Shielding</span>
                      <span className="text-[10px] text-zinc-500 block">Blocks out-of-order execution frames.</span>
                    </div>
                    <span className="text-[10px] bg-emerald-950/20 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded font-bold uppercase">ACTIVE</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-200 block">Telemetry Anomaly Guardrails</span>
                      <span className="text-[10px] text-zinc-500 block">Filters dynamic noise variables.</span>
                    </div>
                    <span className="text-[10px] bg-emerald-950/20 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded font-bold uppercase">ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Maintenance Tools (Ledger Wipe) */}
              <div className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#27272a]">Maintenance & Testing Tools</h3>
                
                <p className="text-zinc-400 leading-relaxed">
                  Reset the current workspace in-memory audit ledger data logs to standard baseline defaults for demonstrating clean start cycles.
                </p>

                <button
                  id="reset-ledger-defaults-btn"
                  onClick={() => {
                    fetchLedger();
                  }}
                  className="bg-red-950/20 hover:bg-red-900/20 text-red-400 border border-red-500/30 font-bold py-2 px-4 rounded transition text-center uppercase tracking-wider text-[11px]"
                >
                  Sync & Reset Default Logs
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* FIXED TELEMETRY FOOTER */}
      <footer className="h-10 border-t border-[#27272a] bg-black px-6 flex items-center justify-between text-[10px] font-mono shrink-0 select-none">
        <div className="flex space-x-6 text-zinc-500">
          <span className="text-zinc-400"><span className="text-blue-500">ID:</span> {currentSessionID}</span>
          <span>TRACE: {currentTraceID}</span>
          <span>MEM: {currentMemory}GB</span>
          <span>CPU: {currentCPU}%</span>
        </div>
        <div className="flex space-x-4 items-center text-zinc-500">
          <span>SYSTEM STATUS: <span className="text-emerald-500">NOMINAL</span></span>
          <div className="w-16 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-zinc-600 animate-pulse"></div>
          </div>
        </div>
      </footer>

    </div>
  );
}
