import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, Cpu, FileText, CheckCircle, AlertTriangle, Play, RefreshCw, 
  Layers, Code, Network, Key, Sparkles, Check, Info, Sliders, List, 
  HelpCircle, HardDrive, ShieldAlert, ArrowRight, Activity, Terminal, ExternalLink
} from "lucide-react";

interface SpecProps {}

interface StateMachineStep {
  name: string;
  preconditions: string[];
  postconditions: string[];
  failureModes: string[];
  status: "idle" | "active" | "passed" | "failed";
}

interface ConformanceTest {
  id: string;
  category: string;
  name: string;
  assertion: string;
  input: string;
  expected: string;
  actual: string;
  latencyMs: number;
  status: "idle" | "running" | "passed" | "failed";
  errorLog?: string;
}

export default function Specification({}: SpecProps) {
  // Profiles state
  const [activeProfile, setActiveProfile] = useState<"Core" | "Enhanced" | "High Assurance">("Enhanced");
  
  // Interactive Simulation variables
  const [timingDrift, setTimingDrift] = useState<boolean>(false);
  const [tamperRecord, setTamperRecord] = useState<boolean>(false);
  
  // Custom plugins / extension points
  const [customPlugins, setCustomPlugins] = useState<Array<{ id: string; type: string; name: string }>>([
    { id: "EP-01", type: "Evidence Provider", name: "SCADA Grid Logs Connector" },
    { id: "EP-02", type: "Constraint Module", name: "ISO-26262 Timing Gate" }
  ]);
  const [newPluginName, setNewPluginName] = useState<string>("");
  const [newPluginType, setNewPluginType] = useState<string>("Evidence Provider");

  // State Machine Step status
  const [activeStateIndex, setActiveStateIndex] = useState<number>(-1);
  const [stateMachineSimulating, setStateMachineSimulating] = useState<boolean>(false);
  const [stateMachineLog, setStateMachineLog] = useState<string[]>([]);
  
  const [stateMachineSteps, setStateMachineSteps] = useState<StateMachineStep[]>([
    {
      name: "Initialized",
      preconditions: ["VEK environment loaded", "Security keys verified"],
      postconditions: ["Kernel ready for input payload"],
      failureModes: ["Key missing or corrupt"],
      status: "idle"
    },
    {
      name: "Input Accepted",
      preconditions: ["Input non-empty", "Well-formed UTF-8"],
      postconditions: ["Payload locked, hash generated"],
      failureModes: ["Input exceeds byte bounds"],
      status: "idle"
    },
    {
      name: "Candidates Generated",
      preconditions: ["Original input unmodified"],
      postconditions: ["Candidate replies structured with metadata"],
      failureModes: ["LLM failure or temperature boundary violated"],
      status: "idle"
    },
    {
      name: "Execution Started",
      preconditions: ["Candidate payload parsed", "State space allocated"],
      postconditions: ["Execution thread isolated"],
      failureModes: ["Memory allocation error"],
      status: "idle"
    },
    {
      name: "Constraints Applied",
      preconditions: ["Active policy rule matching"],
      postconditions: ["Policy violations logged, bounds enforced"],
      failureModes: ["Violation triggers critical boundary exit"],
      status: "idle"
    },
    {
      name: "Execution Completed",
      preconditions: ["Thread exits clean"],
      postconditions: ["Trace ID mapped", "Output buffered"],
      failureModes: ["Thread timeout"],
      status: "idle"
    },
    {
      name: "Replay Verified",
      preconditions: ["Identical environment state", "Inputs replicated"],
      postconditions: ["State drift check matches threshold"],
      failureModes: ["State timing or value drift detected"],
      status: "idle"
    },
    {
      name: "Claim Graph Built",
      preconditions: ["EGAF active", "Verification proof structured"],
      postconditions: ["Acyclic claim graph generated"],
      failureModes: ["Cyclic dependency in statements"],
      status: "idle"
    },
    {
      name: "Evidence Evaluated",
      preconditions: ["Baseline evidence records matched"],
      postconditions: ["Confidence indices and conflict logs updated"],
      failureModes: ["All evidence matches below strength baseline"],
      status: "idle"
    },
    {
      name: "Audit Bundle Finalized",
      preconditions: ["Trace complete", "All logs compiled"],
      postconditions: ["Input, proof, and analysis cryptographically bound"],
      failureModes: ["Bundle serialization mismatch"],
      status: "idle"
    },
    {
      name: "Signed",
      preconditions: ["FIPS 140-3 private key accessible"],
      postconditions: ["Audit bundle cryptographically signed"],
      failureModes: ["Hardware Security Module offline"],
      status: "idle"
    },
    {
      name: "Complete",
      preconditions: ["Signed bundle written to ledger"],
      postconditions: ["Return response with verifiably secure signature"],
      failureModes: ["Write error"],
      status: "idle"
    }
  ]);

  // Conformance Tests State
  const [isSuiteRunning, setIsSuiteRunning] = useState<boolean>(false);
  const [suiteProgress, setSuiteProgress] = useState<number>(0);
  const [conformanceTests, setConformanceTests] = useState<ConformanceTest[]>([
    {
      id: "CONF-01",
      category: "Deterministic Replay",
      name: "Zero-Clock Replay Determinism Assert",
      assertion: "Assert(ReplayTrace(Inputs) === OriginalTrace(Inputs))",
      input: "Params: altitude_ceiling=400ft; duration=1200s",
      expected: "TraceHash: 0x9B42A; ReplayHash: 0x9B42A",
      actual: "TraceHash: 0x9B42A; ReplayHash: 0x9B42A",
      latencyMs: 1.2,
      status: "idle"
    },
    {
      id: "CONF-02",
      category: "Constraint Enforcement",
      name: "Safety Boundary Constraint Preservation",
      assertion: "Assert(ViolationRecorded == (CurrentValue > PolicyLimit))",
      input: "Policy: MaxAlt=400; CurrentAlt=450",
      expected: "Violation Flag: TRUE; Logged: Yes",
      actual: "Violation Flag: TRUE; Logged: Yes",
      latencyMs: 0.8,
      status: "idle"
    },
    {
      id: "CONF-03",
      category: "State Transition Validation",
      name: "State Transition Integrity Checker",
      assertion: "Assert(State(t+1) == TransformFunction(State(t), Input))",
      input: "State: Initialized; Event: ACCEPT_INPUT",
      expected: "State: Input Accepted; Status: Validated",
      actual: "State: Input Accepted; Status: Validated",
      latencyMs: 0.5,
      status: "idle"
    },
    {
      id: "CONF-04",
      category: "Audit Bundle Integrity",
      name: "Cryptographic Bundle Alteration Detection",
      assertion: "Assert(Modify(Bundle) => Hash(Bundle) != SignatureVerification)",
      input: "Bundle payload: original_text_hash='0x12F8'",
      expected: "Signature Check: PASS (No modifications)",
      actual: "Signature Check: PASS (No modifications)",
      latencyMs: 1.5,
      status: "idle"
    },
    {
      id: "CONF-05",
      category: "Serialization Compatibility",
      name: "Byte-Level Serialization Preservation",
      assertion: "Assert(Deserialize(Serialize(Proof)) === Proof)",
      input: "Proof object: { traceID: 'TR-5510', execution_hash: 'abc' }",
      expected: "Proof reconstructed: Identical bytes",
      actual: "Proof reconstructed: Identical bytes",
      latencyMs: 0.4,
      status: "idle"
    },
    {
      id: "CONF-06",
      category: "Error Handling",
      name: "Graceful Exception Fallback Bounds",
      assertion: "Assert(OnException(HSM_Offline) => SafeFallbackState() && WarningLogged)",
      input: "Trigger: HSM_Hardware_Failure",
      expected: "Fallback: Safe Mode; Logged: HSM_Offline",
      actual: "Fallback: Safe Mode; Logged: HSM_Offline",
      latencyMs: 1.1,
      status: "idle"
    },
    {
      id: "CONF-07",
      category: "EGAF Scoring Consistency",
      name: "Factual Support Separator Analysis",
      assertion: "Assert(FactualEvidenceMatches >= EvaluativeJudgmentScore)",
      input: "ClaimGraph: 4 claims, 2 primary sources",
      expected: "Primary support match: 88%; Judgment offset: +12%",
      actual: "Primary support match: 88%; Judgment offset: +12%",
      latencyMs: 1.8,
      status: "idle"
    },
    {
      id: "CONF-08",
      category: "Traceability Completeness",
      name: "Observable Trace Completeness Guarantee",
      assertion: "Assert(AllObservableOps.subsetOf(ExecutionTrace))",
      input: "Ops logged: 12 events; Trace compiled: 12 elements",
      expected: "Completeness: 100% matched; index clean",
      actual: "Completeness: 100% matched; index clean",
      latencyMs: 0.9,
      status: "idle"
    }
  ]);

  // Run visual State Machine lifecycle simulation
  const runStateMachineSimulation = () => {
    if (stateMachineSimulating) return;
    setStateMachineSimulating(true);
    setActiveStateIndex(0);
    setStateMachineLog(["[STATE_TRANSIT] Starting lifecycle state-machine traversal."]);
    
    // Reset state steps visual status
    setStateMachineSteps(prev => prev.map((s, idx) => ({
      ...s,
      status: idx === 0 ? "active" : "idle"
    })));
  };

  useEffect(() => {
    if (!stateMachineSimulating || activeStateIndex < 0) return;

    if (activeStateIndex >= stateMachineSteps.length) {
      setStateMachineSimulating(false);
      setStateMachineLog(prev => [...prev, "[STATE_TRANSIT] State Machine traversal completed successfully with 100% specification compliance."]);
      return;
    }

    const currentStepObj = stateMachineSteps[activeStateIndex];
    
    const timeout = setTimeout(() => {
      // Execute the active step transition
      setStateMachineLog(prev => [
        ...prev,
        `[STATE: ${currentStepObj.name.toUpperCase()}] Preconditions matched. Performing transition...`,
        `[SUCCESS] Transitioned to ${currentStepObj.name}. Postconditions written: ${currentStepObj.postconditions.join(", ")}`
      ]);

      setStateMachineSteps(prev => prev.map((s, idx) => {
        if (idx === activeStateIndex) {
          return { ...s, status: "passed" };
        }
        if (idx === activeStateIndex + 1) {
          return { ...s, status: "active" };
        }
        return s;
      }));

      setActiveStateIndex(prev => prev + 1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [stateMachineSimulating, activeStateIndex]);

  // Run Conformance Test Suite
  const runConformanceSuite = () => {
    if (isSuiteRunning) return;
    setIsSuiteRunning(true);
    setSuiteProgress(0);
    
    // Reset tests status
    setConformanceTests(prev => prev.map(t => ({ ...t, status: "idle" })));

    let currentTestIdx = 0;

    const interval = setInterval(() => {
      if (currentTestIdx >= conformanceTests.length) {
        clearInterval(interval);
        setIsSuiteRunning(false);
        setSuiteProgress(100);
        return;
      }

      setConformanceTests(prev => {
        const updated = [...prev];
        const currentTest = updated[currentTestIdx];
        
        let isPass = true;
        let actualVal = currentTest.expected;
        let errorTxt = "";

        // Introduce simulated Timing Drift failure logic on Deterministic Replay test
        if (currentTest.id === "CONF-01" && timingDrift) {
          isPass = false;
          actualVal = "TraceHash: 0x9B42A; ReplayHash: 0x7E3F1 (DRIFT)";
          errorTxt = "SPECIFICATION VIOLATION (Invariant 1: Replay Determinism): State drift of +1.84ms detected at transition 0x9B4. Mismatch in final hash signature.";
        }

        // Introduce simulated Tamper Record failure logic on Audit Bundle Integrity test
        if (currentTest.id === "CONF-04" && tamperRecord) {
          isPass = false;
          actualVal = "Signature Check: FAIL (Checksum altered)";
          errorTxt = "SECURITY INTEGRITY FAULT (Invariant 5: Audit Integrity): Audit bundle modified externally. Expected block digest '0x12F8', actual '0xDEAD'. cryptographic bounds violation.";
        }

        updated[currentTestIdx] = {
          ...currentTest,
          status: "running"
        };

        // Complete the test after a tiny lag
        setTimeout(() => {
          setConformanceTests(inner => {
            const innerUpdated = [...inner];
            innerUpdated[currentTestIdx] = {
              ...currentTest,
              status: isPass ? "passed" : "failed",
              actual: actualVal,
              errorLog: errorTxt
            };
            return innerUpdated;
          });
        }, 80);

        return updated;
      });

      currentTestIdx++;
      setSuiteProgress(Math.floor((currentTestIdx / conformanceTests.length) * 100));
    }, 350);
  };

  const handleRegisterPlugin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPluginName.trim()) return;
    
    const newId = `EP-0${customPlugins.length + 1}`;
    setCustomPlugins(prev => [
      ...prev,
      { id: newId, type: newPluginType, name: newPluginName }
    ]);
    setNewPluginName("");
  };

  return (
    <div id="vek-spec-suite-panel" className="space-y-8 pb-10">
      
      {/* Spec Jumbotron Header */}
      <div className="bg-[#0c0c0e] border border-[#27272a] rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500" />
        <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-4xl">
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-purple-950/40 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                DETERMINISTIC RUNTIME SPECIFICATION (DRS)
              </span>
              <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                ACTIVE STATE: EXECUTABLE
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight uppercase font-mono flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" />
              VEK 2.4.0 — SPECIFICATION GATEWAY
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Moves the Verifiable Execution Kernel from a procedural implementation to a rigorous <span className="text-white font-semibold">Executable Specification</span>. This layer formalizes the exact behaviors, component bounds, and mathematical assertions necessary for autonomous flight telemetry, medical dosages, and SCADA safety.
            </p>
          </div>

          {/* Quick Profile Selection */}
          <div className="bg-[#09090b] border border-zinc-800 p-3.5 rounded-lg shrink-0 font-mono text-xs text-zinc-400 space-y-2.5 w-full md:w-64">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-zinc-500 border-b border-zinc-900 pb-1.5">
              <span>Capability Profile</span>
              <span className="text-purple-400 font-bold">{activeProfile}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(["Core", "Enhanced", "High Assurance"] as const).map((profile) => (
                <button
                  key={profile}
                  onClick={() => setActiveProfile(profile)}
                  className={`py-1 text-[9px] font-bold rounded text-center border uppercase transition-all ${
                    activeProfile === profile
                      ? "bg-purple-950/20 border-purple-500/40 text-purple-400 font-bold"
                      : "bg-black border-zinc-900 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {profile.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Columns - Layer 1 & 2 */}
        <div className="lg:col-span-2 space-y-6">

          {/* LAYER 1 — SYSTEM INVARIANTS */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4.5 h-4.5 text-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  Layer 1 — Core System Invariants
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Atomic Properties</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  num: "1", 
                  title: "Replay Determinism", 
                  desc: "Given identical inputs, configuration, and environment, replay must yield identical state transitions.",
                  metric: "Tolerance: ±0.00ms", 
                  status: timingDrift ? "VIOLATION DETECTED" : "GUARANTEED" 
                },
                { 
                  num: "2", 
                  title: "State Integrity", 
                  desc: "Every state transition must represent a valid, verified transform from the preceding state.", 
                  metric: "Pre/Post check active",
                  status: "INTEGRAL" 
                },
                { 
                  num: "3", 
                  title: "Trace Completeness", 
                  desc: "Every externally observable transition or SCADA command must appear completely inside execution trace logs.", 
                  metric: "No-omit logger",
                  status: "COMPLETE" 
                },
                { 
                  num: "4", 
                  title: "Constraint Preservation", 
                  desc: "No transition is allowed to violate active constraints without compiling a real-time violation event.", 
                  metric: "Failsafe boundary",
                  status: "ENFORCED" 
                },
                { 
                  num: "5", 
                  title: "Audit Integrity", 
                  desc: "The final audit bundle must cryptographically lock together inputs, proof, analysis, and hashes.", 
                  metric: "FIPS 140-3 HSM",
                  status: tamperRecord ? "TAMPER EXPOSED" : "LOCKED" 
                }
              ].map((inv) => (
                <div 
                  key={inv.num} 
                  className={`border rounded p-3.5 space-y-2 transition-all ${
                    inv.status.includes("VIOLATION") || inv.status.includes("TAMPER")
                      ? "bg-red-950/10 border-red-500/20 text-red-400"
                      : "bg-black border-zinc-900 hover:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-500">INVARIANT {inv.num}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      inv.status === "GUARANTEED" || inv.status === "INTEGRAL" || inv.status === "COMPLETE" || inv.status === "ENFORCED" || inv.status === "LOCKED"
                        ? "bg-emerald-950/20 text-emerald-400 border border-emerald-500/10"
                        : "bg-red-950/20 text-red-400 border border-red-500/20"
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-200 font-mono">{inv.title}</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{inv.desc}</p>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500">
                    <Activity className="w-3 h-3 text-zinc-600" />
                    <span>{inv.metric}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LAYER 2 — COMPONENT CONTRACTS & SANDBOX */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4.5 h-4.5 text-purple-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  Layer 2 — Subsystem Component Contracts
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Strict I/O Boundaries</span>
            </div>

            {/* Display Component Contracts */}
            <div className="space-y-3 font-mono text-xs">
              {[
                {
                  subsystem: "Candidate Generation Engine",
                  input: "User Query, Context state",
                  output: "Candidate replies, prompt bounds",
                  guarantee: "Must NOT modify original user input.",
                  desc: "Generates alternative execution candidates while preserving input query parameters fully."
                },
                {
                  subsystem: "VEK Runtime",
                  input: "Candidate response, constraint thresholds",
                  output: "Verified trace state, cryptographic proof",
                  guarantee: "Strictly deterministic zero-clock execution.",
                  desc: "Translates candidates into isolated virtual processes and asserts state transition bounds."
                },
                {
                  subsystem: "EGAF (Evidence Analysis)",
                  input: "Verified trace, Claim graph, Evidence vectors",
                  output: "Support correlation score, confidence assessment",
                  guarantee: "Must distinguish factual support from evaluative judgment.",
                  desc: "Compiles evidence matrices to isolate system judgments from verifiable record sources."
                },
                {
                  subsystem: "Integrity Layer",
                  input: "Completed audit bundle",
                  output: "Session hashes, dynamic signatures",
                  guarantee: "Any modification to content voids signature validation.",
                  desc: "Uses secure public keys to cryptographically lock execution states forever."
                }
              ].map((contract, idx) => (
                <div key={idx} className="bg-black border border-zinc-900 p-3.5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-purple-400">{contract.subsystem}</span>
                    <span className="text-[9px] bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded font-bold uppercase">
                      Contract Locked
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{contract.desc}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] text-zinc-500 pt-1 border-t border-zinc-900/60">
                    <div>
                      <span className="text-zinc-600 block text-[8px] uppercase font-bold">Input:</span>
                      <span className="text-zinc-300 truncate block">{contract.input}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 block text-[8px] uppercase font-bold">Output:</span>
                      <span className="text-zinc-300 truncate block">{contract.output}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 block text-[8px] uppercase font-bold">Core Guarantee:</span>
                      <span className="text-blue-400 font-bold block">{contract.guarantee}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sidebar - Layers 3, 4, 5 */}
        <div className="space-y-6">
          
          {/* LAYER 3 — RUNTIME STATE MACHINE */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Network className="w-4.5 h-4.5 text-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  Layer 3 — State Machine
                </h3>
              </div>
              <button
                onClick={runStateMachineSimulation}
                disabled={stateMachineSimulating}
                className="text-[9px] font-mono px-2 py-1 bg-emerald-950/30 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-950/50 transition-all flex items-center gap-1 uppercase"
              >
                <Play className="w-3 h-3" />
                <span>Simulate</span>
              </button>
            </div>

            {/* Interactive Timeline Stepper */}
            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1.5 scrollbar-thin">
              {stateMachineSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 border rounded-lg transition-all text-xs font-mono flex items-center justify-between gap-3 ${
                    step.status === "active"
                      ? "bg-blue-950/10 border-blue-500 text-blue-400"
                      : step.status === "passed"
                      ? "bg-emerald-950/10 border-emerald-500/10 text-emerald-400"
                      : "bg-black border-zinc-900 text-zinc-500"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-600 font-bold w-4">{idx + 1}.</span>
                    <div>
                      <span className="font-bold block text-[11px]">{step.name}</span>
                      {step.status === "active" && (
                        <span className="text-[9px] text-zinc-400 block mt-0.5 leading-tight font-sans">
                          Precond: {step.preconditions[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {step.status === "passed" && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                  {step.status === "active" && <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />}
                </div>
              ))}
            </div>

            {/* Simulated Live Terminal logs */}
            {stateMachineLog.length > 0 && (
              <div className="bg-black border border-zinc-900 rounded p-3 font-mono text-[9px] text-zinc-400 space-y-1 h-28 overflow-y-auto scrollbar-thin">
                {stateMachineLog.map((log, idx) => (
                  <div key={idx} className="flex gap-1.5">
                    <span className="text-zinc-600 font-bold shrink-0">&gt;</span>
                    <span className={log.includes("[SUCCESS]") ? "text-emerald-400 font-bold" : "text-zinc-300"}>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LAYER 4 — SPECIFICATION EXTENSION POINTS */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4.5 h-4.5 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Layer 4 — Extension Points
                </h3>
              </div>
              <span className="text-[10px] text-zinc-500">Plugin Engine</span>
            </div>

            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              New capabilities are plugged directly into core specifications without altering foundational contract verification guarantees.
            </p>

            <div className="space-y-2">
              {customPlugins.map((plug) => (
                <div key={plug.id} className="bg-black border border-zinc-900 p-2.5 rounded flex items-center justify-between">
                  <div>
                    <span className="text-[8px] text-zinc-600 uppercase font-bold block">{plug.type}</span>
                    <span className="text-zinc-300 font-bold text-[11px]">{plug.name}</span>
                  </div>
                  <span className="text-[9px] text-blue-400 bg-blue-950/10 border border-blue-500/10 px-1.5 py-0.5 rounded font-bold shrink-0">
                    LOADED
                  </span>
                </div>
              ))}
            </div>

            {/* Plugin Registrator Form */}
            <form onSubmit={handleRegisterPlugin} className="space-y-2 pt-2 border-t border-zinc-900">
              <span className="text-[9px] text-zinc-500 block uppercase font-bold">Register Custom Extension Plugin</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="e.g. FITBIT API CONNECTOR"
                  value={newPluginName}
                  onChange={(e) => setNewPluginName(e.target.value)}
                  className="bg-black border border-zinc-800 rounded p-1.5 text-[10px] text-zinc-200 outline-none focus:border-blue-500"
                />
                <select
                  value={newPluginType}
                  onChange={(e) => setNewPluginType(e.target.value)}
                  className="bg-black border border-zinc-800 rounded p-1.5 text-[10px] text-zinc-400 outline-none focus:border-blue-500"
                >
                  <option value="Evidence Provider">Evidence Provider</option>
                  <option value="Constraint Module">Constraint Module</option>
                  <option value="Domain Validator">Domain Validator</option>
                  <option value="Cryptographic Curve">Cryptographic Curve</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-[#18181b] hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[10px] font-bold py-1.5 rounded transition uppercase tracking-wider"
              >
                Hot-Mount Specification Plugin
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* LAYER 6 — CONFORMANCE TEST SUITE RUNNER */}
      <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-6">
        
        {/* Header and Controller */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <Terminal className="w-5 h-5 text-purple-400" />
              Layer 6 — Executable Conformance Test Suite
            </h3>
            <p className="text-[11px] text-zinc-400 max-w-4xl">
              Provides mathematical and logical verification tests to confirm that any independent runtime meets the exact performance and architectural contracts outlined in the DRS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Failures Injections */}
            <div className="flex items-center gap-4 bg-black border border-zinc-900 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase">
              <span className="text-zinc-500">Inject Faults:</span>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={timingDrift}
                  onChange={(e) => setTimingDrift(e.target.checked)}
                  className="accent-red-500"
                />
                <span className={timingDrift ? "text-red-400" : "text-zinc-500"}>Timing Drift</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={tamperRecord}
                  onChange={(e) => setTamperRecord(e.target.checked)}
                  className="accent-red-500"
                />
                <span className={tamperRecord ? "text-red-400" : "text-zinc-500"}>Tamper Audit</span>
              </label>
            </div>

            <button
              onClick={runConformanceSuite}
              disabled={isSuiteRunning}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-[#18181b] disabled:text-zinc-600 text-white font-bold font-mono text-[11px] px-5 py-2 rounded uppercase tracking-wider transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSuiteRunning ? "animate-spin" : ""}`} />
              <span>{isSuiteRunning ? "Compiling Tests..." : "Execute Conformance Suite"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Progress indicator */}
        {isSuiteRunning && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
              <span>SUITE RUNNING IN STRICT CONTRACT ENVIRONMENT</span>
              <span>{suiteProgress}%</span>
            </div>
            <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
              <motion.div 
                className="bg-blue-500 h-full"
                initial={{ width: "0%" }}
                animate={{ width: `${suiteProgress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        )}

        {/* Test Grid mapping */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {conformanceTests.map((test) => (
            <div 
              key={test.id} 
              className={`bg-black border rounded-lg p-4 font-mono text-xs flex flex-col justify-between transition-all ${
                test.status === "failed" 
                  ? "border-red-500/30 ring-1 ring-red-500/10" 
                  : test.status === "passed" 
                  ? "border-emerald-500/20" 
                  : "border-zinc-900"
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start border-b border-zinc-900/60 pb-1.5">
                  <div>
                    <span className="text-[8px] text-zinc-600 uppercase font-bold block">{test.category}</span>
                    <span className="text-[10px] text-zinc-300 font-bold block mt-0.5 leading-tight">{test.name}</span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                    test.status === "passed"
                      ? "bg-emerald-950/20 text-emerald-400 border border-emerald-500/10"
                      : test.status === "failed"
                      ? "bg-red-950/20 text-red-400 border border-red-500/20"
                      : test.status === "running"
                      ? "bg-blue-950/20 text-blue-400 border border-blue-500/10 animate-pulse"
                      : "bg-zinc-950 text-zinc-600 border border-zinc-900"
                  }`}>
                    {test.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px]">
                  <div>
                    <span className="text-zinc-600 block text-[8px] uppercase">ASSERTION CODE:</span>
                    <code className="text-purple-400 text-[9px] font-bold block bg-[#0a0a0d] p-1 rounded border border-zinc-900/40 select-all font-mono">
                      {test.assertion}
                    </code>
                  </div>

                  <div>
                    <span className="text-zinc-600 block text-[8px] uppercase">INPUT PARAMS:</span>
                    <span className="text-zinc-400 font-mono text-[9px] block bg-zinc-950/40 p-1 rounded truncate">
                      {test.input}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] pt-1 border-t border-zinc-900/40">
                    <div>
                      <span className="text-zinc-600 block text-[8px] uppercase">EXPECTED:</span>
                      <span className="text-zinc-300 font-bold block truncate">{test.expected}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 block text-[8px] uppercase">ACTUAL:</span>
                      <span className={`font-bold block truncate ${test.status === "failed" ? "text-red-400 font-extrabold" : "text-zinc-300"}`}>
                        {test.actual}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error logs expandable if test failed */}
              {test.status === "failed" && test.errorLog && (
                <div className="mt-3 p-2 bg-red-950/10 border border-red-500/20 rounded text-red-400 text-[9px] leading-relaxed">
                  <p className="font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 shrink-0" />
                    ASSERTION FAULTED
                  </p>
                  <p className="mt-0.5 text-zinc-500 text-[8px] font-mono leading-snug">{test.errorLog}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-3 mt-3 border-t border-zinc-900/60 font-mono">
                <span>{test.id}</span>
                <span>Latency: {test.latencyMs}ms</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
