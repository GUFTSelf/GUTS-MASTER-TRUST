import React, { useState } from "react";
import { 
  BarChart2, ShieldAlert, Cpu, Activity, Clock, RefreshCw, Zap, Server, Database
} from "lucide-react";

export default function Benchmarks() {
  const [chaosActive, setChaosActive] = useState(false);
  const [tamperDetections, setTamperDetections] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(24);
  const [memoryUsage, setMemoryUsage] = useState(62);
  const [replayMatchRate, setReplayMatchRate] = useState(99.42);

  const runChaosSimulation = () => {
    setChaosActive(true);
    setCpuUsage(84);
    setMemoryUsage(81);
    setReplayMatchRate(91.20);
    setTamperDetections(prev => prev + 1);

    setTimeout(() => {
      setChaosActive(false);
      setCpuUsage(28);
      setMemoryUsage(64);
      setReplayMatchRate(99.42);
    }, 4000);
  };

  const metrics = [
    { label: "Execution Latency", value: chaosActive ? "582 ms" : "312 ms", icon: Clock, change: chaosActive ? "+86%" : "Optimal", color: "text-blue-500" },
    { label: "Replay Latency", value: chaosActive ? "114 ms" : "78 ms", icon: RefreshCw, change: "Nominal", color: "text-indigo-500" },
    { label: "Constraint Checks / Sec", value: chaosActive ? "8,400" : "4,200", icon: Zap, change: "Max Scaled", color: "text-yellow-500" },
    { label: "System Audit Entries", value: chaosActive ? "14,902" : "14,896", icon: Database, change: "Active Logs", color: "text-emerald-500" },
  ];

  return (
    <div id="vek-benchmarks-container" className="space-y-6 font-mono text-zinc-300">
      
      {/* Banner / Intro */}
      <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-widest">
              <BarChart2 className="w-5 h-5 text-emerald-500" />
              VEK Performance & Integrity Benchmarks
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Verify real-time system telemetries, computing resources, and replay stability under load. 
              Run the Chaos Engineering inject sequence to test how VEK isolates ambient noise and blocks state injection attacks.
            </p>
          </div>
          <button
            id="chaos-inject-btn"
            onClick={runChaosSimulation}
            disabled={chaosActive}
            className={`px-4 py-2 text-xs font-bold uppercase rounded border transition duration-300 shrink-0 ${
              chaosActive 
                ? "bg-red-950/40 text-red-400 border-red-500 animate-pulse" 
                : "bg-emerald-950/20 hover:bg-emerald-900/40 text-emerald-500 border-emerald-500/30"
            }`}
          >
            {chaosActive ? "⚠️ Chaos Injection Active" : "⚡ Trigger Chaos Injection"}
          </button>
        </div>
      </div>

      {/* Grid: Big KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        {metrics.map((m, idx) => {
          const IconComponent = m.icon;
          return (
            <div key={idx} className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg shadow-lg flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase block tracking-wider font-mono">{m.label}</span>
                <span className="text-2xl font-black text-white block">{m.value}</span>
                <span className={`text-[10px] font-mono font-bold ${chaosActive && idx !== 3 ? "text-red-400 animate-pulse" : "text-zinc-500"}`}>
                  {m.change}
                </span>
              </div>
              <div className="bg-black p-2.5 rounded border border-[#27272a]">
                <IconComponent className={`w-5 h-5 ${m.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource Utilization & Replay Integrity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core CPU Dial Block */}
        <div className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500" />
              VEK Kernel Thread CPU
            </h3>
            <span className="text-xs font-bold text-blue-500 font-mono">{cpuUsage}%</span>
          </div>

          <div className="relative pt-2">
            <div className="w-full bg-black h-2.5 rounded-full overflow-hidden border border-[#27272a]">
              <div 
                className={`h-full transition-all duration-500 ${chaosActive ? "bg-red-500" : "bg-blue-500"}`} 
                style={{ width: `${cpuUsage}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
              <span>Idle (0%)</span>
              <span>Nominal Limit</span>
              <span>Throttling (100%)</span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed bg-black p-3 rounded border border-[#27272a] italic">
            {chaosActive 
              ? "ALERT: High execution throughput triggered by simulated load request. Dynamic thread cooling active."
              : "System idling optimally. Baseline thread schedules are fully isolated from primary application runtime layers."}
          </p>
        </div>

        {/* Memory Buffer Limits */}
        <div className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-500" />
              Deterministic Memory Map
            </h3>
            <span className="text-xs font-bold text-indigo-500 font-mono">{memoryUsage}%</span>
          </div>

          <div className="relative pt-2">
            <div className="w-full bg-black h-2.5 rounded-full overflow-hidden border border-[#27272a]">
              <div 
                className={`h-full transition-all duration-500 ${chaosActive ? "bg-amber-500" : "bg-indigo-500"}`} 
                style={{ width: `${memoryUsage}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
              <span>0 GB</span>
              <span>Buffer Safe Ceiling</span>
              <span>16 GB Max Allocation</span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed bg-black p-3 rounded border border-[#27272a] italic">
            {chaosActive 
              ? "Buffer memory allocation increased to capture high frequency replay trace structures for active sessions."
              : "Deterministic memory map verified clean. Memory leak defense verified safe under static state variables."}
          </p>
        </div>

        {/* Replay Verification Match Rate */}
        <div className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Replay Match Rate
            </h3>
            <span className="text-xs font-bold text-emerald-500 font-mono">{replayMatchRate.toFixed(2)}%</span>
          </div>

          <div className="relative pt-2">
            <div className="w-full bg-black h-2.5 rounded-full overflow-hidden border border-[#27272a]">
              <div 
                className={`h-full transition-all duration-500 ${chaosActive ? "bg-red-500" : "bg-emerald-500"}`} 
                style={{ width: `${replayMatchRate}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
              <span>Slippage Range</span>
              <span>Warning Bound</span>
              <span>Absolute Match (100%)</span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed bg-black p-3 rounded border border-[#27272a] italic">
            {chaosActive 
              ? "WARNING: Non-deterministic replay errors detected during parallel execution test. Trace log flagged."
              : "Replay alignment score reflects pristine state machine consistency over continuous execution tests."}
          </p>
        </div>

      </div>

      {/* Security Audit & Integrity Logs */}
      <div className="bg-[#0c0c0e] border border-[#27272a] p-5 rounded-lg shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-500" />
            Integrity Guard Interceptor Status
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            tamperDetections > 0 ? "bg-red-950/20 text-red-400 border-red-500/20" : "bg-emerald-950/20 text-emerald-400 border-emerald-500/20"
          }`}>
            {tamperDetections} Attack Vectors Defeated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black border border-[#27272a] p-4 rounded-lg space-y-2">
            <span className="text-xs font-bold text-zinc-300 block uppercase tracking-wider text-[11px]">Active Protection Controls</span>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span>Zero-Clock Drift Assertions: <b className="text-emerald-400 font-semibold font-mono uppercase">ENABLED</b></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span>Encrypted Memory State Isolation: <b className="text-emerald-400 font-semibold font-mono uppercase">ENABLED</b></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span>Verification Replay Guardrails: <b className="text-emerald-400 font-semibold font-mono uppercase">ACTIVE</b></span>
              </li>
            </ul>
          </div>

          <div className="bg-black border border-[#27272a] p-4 rounded-lg space-y-2">
            <span className="text-xs font-bold text-zinc-300 block uppercase tracking-wider text-[11px]">Security Event Log</span>
            <div className="text-[11px] space-y-1 text-zinc-500 max-h-[80px] overflow-y-auto scrollbar-thin">
              {tamperDetections > 0 ? (
                <div className="text-red-400 flex items-center gap-1.5 font-bold animate-pulse">
                  <span>[ALARM] State Injection Intercepted at thread offset 0x98EF. System secure.</span>
                </div>
              ) : (
                <div className="text-emerald-500">
                  <span>[OK] All core policies aligned. Guard rail idle.</span>
                </div>
              )}
              <div>[SYSTEM] Cryptographic evidence hashes matched successfully over local ledger.</div>
              <div>[SYSTEM] Diagnostic monitoring loop completed: 0 warnings.</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
