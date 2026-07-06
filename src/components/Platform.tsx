import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Layers, Cpu, Server, HardDrive, Shield, Activity, Sliders, CheckCircle, 
  HelpCircle, Sparkles, RefreshCw, Box, Network, BarChart3, Settings2, 
  ArrowRight, ShieldCheck, Terminal, Compass, AlertCircle, Play, SlidersHorizontal
} from "lucide-react";

interface PlatformProps {}

interface CoreService {
  name: string;
  role: string;
  status: "idle" | "running" | "healthy" | "degraded";
  load: number;
  metric: string;
}

interface Plugin {
  id: string;
  category: string;
  name: string;
  status: "active" | "standby";
}

export default function Platform({}: PlatformProps) {
  // Tabs & Config states
  const [activeSubTab, setActiveSubTab] = useState<"layers" | "services" | "deployment" | "plugins" | "ecosystem" | "observability">("layers");
  const [selectedLayer, setSelectedLayer] = useState<string>("Verification Services");
  const [activeProfile, setActiveProfile] = useState<"Developer" | "Enterprise" | "High Assurance">("Enterprise");

  // Ecosystem / Dataset states
  const [selectedDataset, setSelectedDataset] = useState<"ref_det_001" | "ref_rep_002" | "ref_con_003">("ref_det_001");
  const [datasetVerifying, setDatasetVerifying] = useState(false);
  const [datasetVerificationResult, setDatasetVerificationResult] = useState<string | null>(null);
  const [selectedCampaignPhase, setSelectedCampaignPhase] = useState<number>(1);
  const [copiedDatasetHash, setCopiedDatasetHash] = useState(false);

  // Telemetry Simulators
  const [queueDepth, setQueueDepth] = useState<number>(4);
  const [simulatedLoad, setSimulatedLoad] = useState<number>(45); // percentage
  const [injectLatency, setInjectLatency] = useState<boolean>(false);
  const [autoScale, setAutoScale] = useState<boolean>(true);

  // Dynamic system logs
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "[SDIP_KERNEL] Bootstrap completed on host local-cluster-node-0.",
    "[SDIP_KERNEL] Active profiles synchronized: Enterprise load-balancing state.",
    "[VEK_SERVICE] Warm standby VM threads initialized in memory."
  ]);

  // Core Services List
  const [services, setServices] = useState<CoreService[]>([
    { name: "Execution Service", role: "Runs deterministic workloads", status: "healthy", load: 24, metric: "842 ops/sec" },
    { name: "Replay Service", role: "Re-executes to confirm reproducibility", status: "healthy", load: 38, metric: "0.00ms drift" },
    { name: "Constraint Service", role: "Applies rules & checks bounds", status: "healthy", load: 12, metric: "0 violations" },
    { name: "Evidence Service", role: "Organizes & evaluates EGAF claims", status: "healthy", load: 18, metric: "0.985 factual density" },
    { name: "Audit Service", role: "Generates signed audit bundles", status: "healthy", load: 5, metric: "Ed25519 FIPS active" },
    { name: "Storage Service", role: "Persists execution artifacts", status: "healthy", load: 15, metric: "24.5 GB ledger" },
    { name: "Scheduler", role: "Coordinates cluster worker pool", status: "healthy", load: 8, metric: "2.1ms queue lag" }
  ]);

  // Plugins list
  const [plugins, setPlugins] = useState<Plugin[]>([
    { id: "PLUG-01", category: "Domain Analyzer", name: "Avionics Flight-Enclosure Guard", status: "active" },
    { id: "PLUG-02", category: "Constraint Module", name: "SCADA Sub-Cycle Frequency Gate", status: "active" },
    { id: "PLUG-03", category: "Report Generator", name: "FDA Medical Dosage Compliance PDF", status: "active" },
    { id: "PLUG-04", category: "Storage Adapter", name: "IPFS Distributed Ledger Linker", status: "standby" }
  ]);
  const [newPlugName, setNewPlugName] = useState("");
  const [newPlugCat, setNewPlugCat] = useState("Domain Analyzer");

  // Dynamic simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate light jitter in service loads
      setServices(prev => prev.map(s => {
        const jitter = Math.floor((Math.random() - 0.5) * 8);
        const baseLoad = s.name === "Execution Service" ? simulatedLoad * 0.6 :
                         s.name === "Replay Service" ? simulatedLoad * 0.8 :
                         s.name === "Constraint Service" ? simulatedLoad * 0.3 : 15;
        
        const finalLoad = Math.max(2, Math.min(99, Math.floor(baseLoad + jitter)));
        const latencyMultiplier = injectLatency ? 4.5 : 1.0;
        
        let customMetric = s.metric;
        if (s.name === "Execution Service") customMetric = `${Math.floor(800 * (finalLoad/45))} ops/sec`;
        if (s.name === "Replay Service") customMetric = injectLatency ? `${(3.5 + Math.random()*2).toFixed(2)}ms drift` : "0.00ms drift";
        if (s.name === "Scheduler") customMetric = `${(1.5 + (finalLoad / 15) * latencyMultiplier).toFixed(1)}ms lag`;

        return {
          ...s,
          load: finalLoad,
          status: injectLatency && s.name === "Replay Service" ? "degraded" : "healthy",
          metric: customMetric
        };
      }));

      // Random queue variations
      setQueueDepth(q => {
        const diff = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return Math.max(0, Math.min(15, q + diff));
      });

      // Occasional visual system logs
      if (Math.random() > 0.85) {
        const logTemplates = [
          `[SCHEDULER] Dispatching workload task to worker-node-${Math.floor(Math.random()*4)}.`,
          `[REPLAY_SERVICE] Replay assertion verified for process thread ${Math.floor(Math.random()*8000+1000)}.`,
          "[AUDIT_SERVICE] Canonical hash bounds verified. SHA-512 state is intact.",
          "[CONSTRAINT_SERVICE] Safety ceiling boundaries checked: within normal margin.",
          `[EGAF_ENGINE] Evidence metrics recalculated. Aggregate confidence score: ${(0.95 + Math.random()*0.04).toFixed(3)}.`
        ];
        const randomLog = logTemplates[Math.floor(Math.random() * logTemplates.length)];
        setSystemLogs(prev => [randomLog, ...prev.slice(0, 15)]);
      }

    }, 1500);

    return () => clearInterval(interval);
  }, [simulatedLoad, injectLatency]);

  // Add Plugin handler
  const handleAddPlugin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlugName.trim()) return;

    const newId = `PLUG-0${plugins.length + 1}`;
    setPlugins(prev => [
      ...prev,
      { id: newId, category: newPlugCat, name: newPlugName, status: "active" }
    ]);

    setSystemLogs(prev => [
      `[KERNEL_PLUGINS] Dynamic plugin hot-mounted successfully: ${newPlugName} (${newPlugCat}).`,
      ...prev
    ]);

    setNewPlugName("");
  };

  return (
    <div id="vek-platform-sdip-root" className="space-y-8 pb-10 font-sans">
      
      {/* 3.0.0 SDIP Core Jumbotron Header */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
        <div className="absolute right-0 top-0 w-44 h-44 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2 max-w-4xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] bg-purple-950/40 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                PLATFORM CORE SYSTEM
              </span>
              <span className="text-[9px] bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                RELEASE SPECIFICATION: 3.0.0
              </span>
              <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                PLATFORM STATUS: RUNNING
              </span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight uppercase font-mono flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-purple-500" />
              VEK 3.0.0 — SOVEREIGN DETERMINISTIC INTELLIGENCE PLATFORM (SDIP)
            </h2>
            
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Provides a complete, scalable microservice environment separating <span className="text-white font-semibold">Deterministic Execution (VEK)</span>, <span className="text-white font-semibold">Evidence Evaluation (EGAF)</span>, and <span className="text-white font-semibold">FIPS Cryptographic Integrity</span>. This shifts VEK from an isolated runtime into a multi-node distributed network built for absolute safety.
            </p>
          </div>

          {/* Core Platform Services Counters */}
          <div className="grid grid-cols-3 gap-2 shrink-0 w-full xl:w-auto">
            <div className="bg-black border border-zinc-900 p-3 rounded-lg font-mono text-center">
              <span className="text-[8px] text-zinc-600 block uppercase font-bold">Services Pool</span>
              <span className="text-base font-extrabold text-white block mt-0.5">{services.length}</span>
              <span className="text-[7px] text-emerald-500 font-bold block uppercase mt-0.5">HEALTHY</span>
            </div>
            <div className="bg-black border border-zinc-900 p-3 rounded-lg text-center font-mono">
              <span className="text-[8px] text-zinc-600 block uppercase font-bold">Mounted Plugins</span>
              <span className="text-base font-extrabold text-purple-400 block mt-0.5">
                {plugins.filter(p => p.status === "active").length}
              </span>
              <span className="text-[7px] text-zinc-500 block uppercase mt-0.5">LOADED</span>
            </div>
            <div className="bg-black border border-zinc-900 p-3 rounded-lg text-center font-mono">
              <span className="text-[8px] text-zinc-600 block uppercase font-bold">Network Profile</span>
              <span className="text-base font-extrabold text-blue-400 block mt-0.5 truncate max-w-[80px] mx-auto text-xs py-1 uppercase">
                {activeProfile.split(" ")[0]}
              </span>
              <span className="text-[7px] text-zinc-500 block uppercase mt-0.5">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* SDIP Navigation tabs */}
      <div className="flex border-b border-zinc-900 gap-1 overflow-x-auto pb-px">
        {[
          { id: "layers", label: "Layered Architecture", icon: Layers },
          { id: "services", label: "Platform Services", icon: Server },
          { id: "deployment", label: "Deployment Profiles", icon: Network },
          { id: "plugins", label: "Plugin Ecosystem", icon: Box },
          { id: "ecosystem", label: "Ecosystem Governance", icon: ShieldCheck },
          { id: "observability", label: "Real-time Observability", icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold font-mono tracking-wider uppercase border-b-2 transition-all shrink-0 ${
                activeSubTab === tab.id
                  ? "border-purple-500 text-purple-400 bg-purple-950/5"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: LAYERED ARCHITECTURE MAP */}
      {activeSubTab === "layers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Stack Visual layout */}
          <div className="lg:col-span-2 space-y-3 font-mono text-xs">
            {[
              {
                id: "Applications",
                name: "Applications Layer",
                desc: "High-density operator interfaces (Engineering, Scientific, Command Consoles), API gateways, and scriptable CLI tools.",
                badge: "User Facing",
                items: ["VEK Engineering Console", "Scientific Dosimetry UI", "SCADA command dashboard", "REST / WASM API Gateways"]
              },
              {
                id: "Application Services",
                name: "Application Services",
                desc: "Manages active system states, user authorization sessions, global cluster workloads, and real-time policy rules.",
                badge: "Orchestration",
                items: ["Workflow Manager", "Workload Queue Scheduler", "Identity & Auth Manager", "Global Rule Router"]
              },
              {
                id: "Verification Services",
                name: "Verification Services",
                desc: "Core verification loop executing sandboxed VM threads, checking deterministic steps, and compiling cryptographic proofs.",
                badge: "Core Verification",
                items: ["Deterministic VEK Runtime", "Failsafe Replay Engine", "Register Constraint Gate", "STARK Witness Proof Builder"]
              },
              {
                id: "Analysis Services",
                name: "Analysis Services",
                desc: "EGAF processing engine mapping claims to physical evidence, auditing fact metrics, and measuring scoring confidence.",
                badge: "Trust Analysis",
                items: ["EGAF Processor", "Acyclic Claim Graph Builder", "Evidence Linker", "Confidence & Bias Evaluator"]
              },
              {
                id: "Infrastructure",
                name: "Infrastructure Layer",
                desc: "System layer storing audit records on local/distributed ledger databases and verifying packet keys.",
                badge: "Hardware & Cryptography",
                items: ["SHA-512 Hash Gateways", "FIPS 140-3 HSM signature curve", "Distributed scheduler network", "Audit Bundle ledger db"]
              },
              {
                id: "Platform Kernel",
                name: "Platform Kernel Layer",
                desc: "Low-level system boot modules, core serialization standards, byte alignment standards, and protocol packets.",
                badge: "Foundation Standards",
                items: ["Deterministic State Machine", "Canonical Serialization", "VEP-2.5.0 Protocol Packets", "System Boot Loader"]
              }
            ].map((layer) => {
              const isSelected = selectedLayer === layer.id;
              return (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:bg-[#0f0f13] flex flex-col sm:flex-row justify-between items-start gap-4 ${
                    isSelected
                      ? "bg-purple-950/15 border-purple-500 shadow-lg ring-1 ring-purple-500/10"
                      : "bg-[#0c0c0e] border-zinc-900"
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${isSelected ? "text-purple-400" : "text-zinc-400"}`}>
                        {layer.name}
                      </span>
                      <span className="text-[8px] bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                        {layer.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{layer.desc}</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <span className="text-[9px] text-zinc-600 uppercase font-bold shrink-0">Specs Active</span>
                    <CheckCircle className={`w-4 h-4 shrink-0 ${isSelected ? "text-purple-500" : "text-zinc-600"}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details side drawer */}
          <div className="lg:col-span-1">
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4 font-mono text-xs h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-zinc-900 pb-3">
                  <span className="text-[8px] text-zinc-500 block uppercase font-bold">Selected Stack Layer</span>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-tight mt-0.5 flex items-center gap-1.5">
                    <Layers className="w-4.5 h-4.5 text-purple-500" />
                    {selectedLayer}
                  </h3>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase block">Core Module Components:</span>
                  <div className="space-y-2">
                    {[
                      {
                        layer: "Applications",
                        items: [
                          { name: "VEK Console UI", desc: "Aesthetic React framework visualization." },
                          { name: "WASM / CLI Module", desc: "Zero-dependency shell interfaces for remote clusters." },
                          { name: "Telemetry Exporter", desc: "Formats logs to Prometheus or OpenTelemetry." }
                        ]
                      },
                      {
                        layer: "Application Services",
                        items: [
                          { name: "Workflow Scheduler", desc: "Distributes deterministic task queues." },
                          { name: "Policy Arbitrator", desc: "Applies rule bounds to candidate tasks." },
                          { name: "Failsafe Gatekeeper", desc: "Monitors hardware failover parameters." }
                        ]
                      },
                      {
                        layer: "Verification Services",
                        items: [
                          { name: "Deterministic VM Core", desc: "Registers run-trace stack in isolated sandboxes." },
                          { name: "Duplicate Replay engine", desc: "Triggers second thread to verify exact outcome matches." },
                          { name: "STARK Witness Prover", desc: "Compiles mathematical constraints validation proofs." }
                        ]
                      },
                      {
                        layer: "Analysis Services",
                        items: [
                          { name: "EGAF claim analyzer", desc: "Builds claim graphs mapping statements to records." },
                          { name: "Source density filter", desc: "Isolates peer opinions from ground-truth data." },
                          { name: "Bias scoring gateway", desc: "Flags conflicting records with transparency metadata." }
                        ]
                      },
                      {
                        layer: "Infrastructure",
                        items: [
                          { name: "FIPS private key curves", desc: "ED25519 secure bundle signing." },
                          { name: "Audit Ledger Database", desc: "Durable tamper-evident execution histories." },
                          { name: "Cluster Sync Engine", desc: "Maintains block times across replication workers." }
                        ]
                      },
                      {
                        layer: "Platform Kernel",
                        items: [
                          { name: "WASM state compiler", desc: "Enforces exact byte sizes over compiled outputs." },
                          { name: "VEP Protocol Engine", desc: "Packs message data in secure digital envelopes." },
                          { name: "Boot loader validator", desc: "Asserts kernel signature matches on bootup." }
                        ]
                      }
                    ].find(l => l.layer === selectedLayer)?.items.map((item, idx) => (
                      <div key={idx} className="bg-black border border-zinc-900 p-2.5 rounded">
                        <span className="text-purple-400 font-bold block text-[10px]">{item.name}</span>
                        <span className="text-[9px] text-zinc-500 block leading-relaxed font-sans mt-0.5">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-purple-950/5 border border-purple-500/10 p-3 rounded text-[10px] text-zinc-400 font-sans leading-relaxed mt-4">
                <p className="font-bold font-mono text-white text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Boundary Assurance Guarantee
                </p>
                Each stack boundary operates as an isolated component. Inputs pass via VEP-2.5.0 protocol messages to guarantee that zero unvetted memory is shared between verification steps.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: CORE PLATFORM SERVICES */}
      {activeSubTab === "services" && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
              Core Platform Microservice Cluster
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">
              Core system processes run as distinct service nodes communicating over standard VEP channels. Operator load factors are compiled below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {services.map((svc) => (
              <div key={svc.name} className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-4 font-mono text-xs flex flex-col justify-between space-y-3 hover:border-zinc-800 transition-colors">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-white font-extrabold text-[11px] tracking-tight">{svc.name}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      svc.status === "healthy" 
                        ? "bg-emerald-950/20 text-emerald-400 border border-emerald-500/10"
                        : "bg-amber-950/20 text-amber-400 border border-amber-500/10"
                    }`}>
                      {svc.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">{svc.role}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-900/60">
                  <div className="flex justify-between text-[9px] text-zinc-500">
                    <span>Active Load Factor:</span>
                    <span className={svc.load > 60 ? "text-amber-400 font-bold" : "text-zinc-300"}>
                      {svc.load}%
                    </span>
                  </div>
                  
                  {/* Load progress line */}
                  <div className="w-full bg-[#141417] h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        svc.load > 60 ? "bg-amber-500" : "bg-purple-500"
                      }`}
                      style={{ width: `${svc.load}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-1 text-[8px] text-zinc-400 uppercase pt-0.5">
                    <Activity className="w-3 h-3 text-zinc-600" />
                    <span>Telemetric: {svc.metric}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Core Control Simulator */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 font-mono text-xs space-y-4">
            <span className="text-[9px] text-purple-400 font-bold uppercase block tracking-wider">Dynamic Load Calibration Console</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Load controller slider */}
              <div className="bg-black border border-zinc-900 p-4 rounded-lg space-y-3">
                <div className="flex justify-between text-[9px] text-zinc-400 font-bold">
                  <span>SIMULATED CLUSTER INGRESS LOAD:</span>
                  <span className="text-purple-400">{simulatedLoad}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={simulatedLoad}
                  onChange={(e) => setSimulatedLoad(parseInt(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[7px] text-zinc-600 mt-1 uppercase">
                  <span>Quiescent</span>
                  <span>Normal</span>
                  <span>Saturated Peak</span>
                </div>
              </div>

              {/* Stress Injector switches */}
              <div className="bg-black border border-zinc-900 p-4 rounded-lg flex flex-col justify-between">
                <span className="text-[8px] text-zinc-500 font-bold uppercase block">Adversarial Latency Injector:</span>
                
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="text-[10px] text-zinc-300 font-bold block">Inject Timing Jitter</span>
                    <span className="text-[8px] text-zinc-500 font-sans leading-normal">Forces drift in Replay nodes.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={injectLatency} 
                      onChange={(e) => setInjectLatency(e.target.checked)} 
                      className="sr-only peer" 
                    />
                    <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white" />
                  </label>
                </div>
              </div>

              {/* Cluster Autoscale Toggle */}
              <div className="bg-black border border-zinc-900 p-4 rounded-lg flex flex-col justify-between">
                <span className="text-[8px] text-zinc-500 font-bold uppercase block">Automatic Pod Autoscaler:</span>
                
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="text-[10px] text-zinc-300 font-bold block">Self-Heal Overload</span>
                    <span className="text-[8px] text-zinc-500 font-sans leading-normal">Spins mock replica instances automatically.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={autoScale} 
                      onChange={(e) => setAutoScale(e.target.checked)} 
                      className="sr-only peer" 
                    />
                    <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white" />
                  </label>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: DEPLOYMENT PROFILES */}
      {activeSubTab === "deployment" && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-3">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                Platform Deployment Topology Profiles
              </h3>
              <p className="text-[10px] text-zinc-500">
                SDIP supports three distinct hardware network topologies to balance performance, cost, and absolute security assurance levels.
              </p>
            </div>

            {/* Profile Picker buttons */}
            <div className="flex bg-black border border-zinc-900 rounded p-1 text-[10px] font-mono shrink-0">
              {(["Developer", "Enterprise", "High Assurance"] as const).map((profile) => (
                <button
                  key={profile}
                  onClick={() => setActiveProfile(profile)}
                  className={`px-3 py-1.5 rounded uppercase font-bold transition-all ${
                    activeProfile === profile
                      ? "bg-purple-950/20 text-purple-400 border border-purple-500/20"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {profile}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            
            {/* Visual Topology Graph */}
            <div className="lg:col-span-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <span className="text-[8px] text-zinc-500 block uppercase font-bold mb-3">Live Active Node Topology Graph</span>
                
                {/* Developer single-node layout */}
                {activeProfile === "Developer" && (
                  <div className="py-8 flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
                    <div className="p-3 bg-purple-950/15 border border-purple-500/20 rounded-lg text-center w-full">
                      <span className="text-[8px] text-purple-400 uppercase font-bold block">Developer DevBox</span>
                      <span className="text-white font-extrabold block text-xs mt-1">Single Loopback Runtime Node</span>
                      <span className="text-[9px] text-zinc-500 block font-sans mt-1">Local Memory Sandbox. Console + VEK Core + local database reside on a single dev cluster environment.</span>
                    </div>
                  </div>
                )}

                {/* Enterprise scalable cluster layout */}
                {activeProfile === "Enterprise" && (
                  <div className="py-4 space-y-6 max-w-2xl mx-auto">
                    {/* Load balancer */}
                    <div className="flex justify-center">
                      <div className="p-2.5 bg-[#0a0a0d] border border-zinc-800 rounded-lg text-center w-48">
                        <span className="text-[8px] text-zinc-500 uppercase font-bold block">Ingress Portal</span>
                        <span className="text-white font-bold block text-[10px] mt-0.5">Enterprise Load Balancer</span>
                      </div>
                    </div>

                    {/* Routing arrow */}
                    <div className="flex justify-center -my-3">
                      <ArrowRight className="w-4 h-4 text-zinc-700 rotate-90" />
                    </div>

                    {/* Active parallel clusters */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-2.5 bg-purple-950/10 border border-purple-500/15 rounded-lg text-center">
                        <span className="text-[8px] text-purple-400 font-bold uppercase block">EXEC CLUSTER</span>
                        <span className="text-white font-extrabold block text-[10px] mt-0.5">3 Replica Nodes</span>
                      </div>
                      <div className="p-2.5 bg-blue-950/10 border border-blue-500/15 rounded-lg text-center">
                        <span className="text-[8px] text-blue-400 font-bold uppercase block">REPLAY POOL</span>
                        <span className="text-white font-extrabold block text-[10px] mt-0.5">Dual-Pass Nodes</span>
                      </div>
                      <div className="p-2.5 bg-emerald-950/10 border border-emerald-500/15 rounded-lg text-center">
                        <span className="text-[8px] text-emerald-400 font-bold uppercase block">ANALYSIS (EGAF)</span>
                        <span className="text-white font-extrabold block text-[10px] mt-0.5">Active Analyzer</span>
                      </div>
                    </div>

                    {/* Routing arrow */}
                    <div className="flex justify-center -my-3">
                      <ArrowRight className="w-4 h-4 text-zinc-700 rotate-90" />
                    </div>

                    {/* Audit storage ledger */}
                    <div className="flex justify-center">
                      <div className="p-2.5 bg-[#0a0a0d] border border-zinc-800 rounded-lg text-center w-64">
                        <span className="text-[8px] text-zinc-500 uppercase font-bold block">Enterprise Ledger</span>
                        <span className="text-white font-bold block text-[10px] mt-0.5">Replicated Audit Storage DB</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* High Assurance distributed validator layout */}
                {activeProfile === "High Assurance" && (
                  <div className="py-4 space-y-6 max-w-2xl mx-auto">
                    
                    {/* Operator node */}
                    <div className="flex justify-center">
                      <div className="p-2 bg-[#0a0a0d] border border-zinc-800 rounded text-center w-44">
                        <span className="text-[8px] text-zinc-500 uppercase font-bold block">Client Node</span>
                        <span className="text-white font-bold block text-[10px]">VEK Engineering Console</span>
                      </div>
                    </div>

                    <div className="flex justify-center -my-3">
                      <ArrowRight className="w-4 h-4 text-zinc-700 rotate-90" />
                    </div>

                    {/* Gateway router */}
                    <div className="flex justify-center">
                      <div className="p-2 bg-zinc-900 border border-zinc-800 rounded text-center w-48">
                        <span className="text-[8px] text-purple-400 uppercase font-bold block">Strict Security Ingress</span>
                        <span className="text-white font-bold block text-[10px] mt-0.5">Zero-Trust VEP Gateway</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mt-4">
                      {/* Executor Node A */}
                      <div className="p-3 bg-purple-950/15 border border-purple-500/20 rounded-lg space-y-2 text-center">
                        <span className="text-[8px] text-purple-400 uppercase font-bold block">Consensus Node Alpha</span>
                        <span className="text-white font-bold block text-[10px]">Independent Executor A</span>
                        <p className="text-[8px] text-zinc-500 font-sans leading-normal">Compiles first execution state register trace and signs output hashes.</p>
                      </div>

                      {/* Executor Node B */}
                      <div className="p-3 bg-indigo-950/15 border border-indigo-500/20 rounded-lg space-y-2 text-center">
                        <span className="text-[8px] text-indigo-400 uppercase font-bold block">Consensus Node Beta</span>
                        <span className="text-white font-bold block text-[10px]">Independent Replay B</span>
                        <p className="text-[8px] text-zinc-500 font-sans leading-normal">Independent re-execution sandbox confirming zero-clock determinism.</p>
                      </div>
                    </div>

                    <div className="flex justify-center -my-3">
                      <ArrowRight className="w-4 h-4 text-zinc-700 rotate-90" />
                    </div>

                    {/* HSM & Immutable Ledger */}
                    <div className="flex justify-center">
                      <div className="p-2.5 bg-emerald-950/10 border border-emerald-500/20 rounded-lg text-center w-80">
                        <span className="text-[8px] text-emerald-400 uppercase font-bold block">Sovereign Proof validation</span>
                        <span className="text-white font-bold block text-[10px] mt-0.5">FIPS 140-3 Hardware Signer + Immutable ledger</span>
                      </div>
                    </div>

                  </div>
                )}

              </div>

              <div className="text-[9px] text-zinc-600 leading-normal border-t border-zinc-900/60 pt-2 font-sans mt-3">
                * Simulated network packets under {activeProfile} routing profile conform strictly to IEEE and FIPS secure communication criteria.
              </div>
            </div>

            {/* Profile Specifications details */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4 h-full flex flex-col justify-between">
                
                <div className="space-y-4">
                  <div className="border-b border-zinc-900 pb-3">
                    <span className="text-[8px] text-zinc-500 block uppercase font-bold">Profile Scope Metrics</span>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-tight mt-0.5">
                      {activeProfile} Profile Specs
                    </h3>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {[
                      {
                        p: "Developer",
                        specs: [
                          { label: "Target Host", val: "Single Dev Machine" },
                          { label: "Execution Speed", val: "Extremely High (Local bus)" },
                          { label: "Redundancy Level", val: "None (Zero replication)" },
                          { label: "Assurance Level", val: "Low (Local simulation)" },
                          { label: "Cryptographic signing", val: "Software keys (Mock HSM)" }
                        ]
                      },
                      {
                        p: "Enterprise",
                        specs: [
                          { label: "Target Host", val: "Load-Balanced Cloud Run" },
                          { label: "Execution Speed", val: "High (Multi-pod scaling)" },
                          { label: "Redundancy Level", val: "3x Cluster Replication" },
                          { label: "Assurance Level", val: "Medium-High (Active replay)" },
                          { label: "Cryptographic signing", val: "Key Management Service (KMS)" }
                        ]
                      },
                      {
                        p: "High Assurance",
                        specs: [
                          { label: "Target Host", val: "Distributed Secure Enclaves" },
                          { label: "Execution Speed", val: "Medium (Consensus lock overhead)" },
                          { label: "Redundancy Level", val: "Independent Validator Nodes" },
                          { label: "Assurance Level", val: "Absolute (Dual-Pass Consensus)" },
                          { label: "Cryptographic signing", val: "Dedicated Hardware HSM (FIPS 140-3)" }
                        ]
                      }
                    ].find(p => p.p === activeProfile)?.specs.map((spec, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-black p-2.5 rounded border border-zinc-900/60">
                        <span className="text-zinc-500 text-[10px] font-sans">{spec.label}:</span>
                        <span className="text-zinc-200 font-bold text-[10px]">{spec.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-950/5 border border-purple-500/10 p-3 rounded text-[10px] text-zinc-400 font-sans leading-relaxed mt-4">
                  <p className="font-bold font-mono text-white text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    Security Mandate Checklist
                  </p>
                  {activeProfile === "High Assurance" ? (
                    <span>Requires mandatory hardware secure enclaves (SGX/SEV) and zero-knowledge STARK proofs. Best for flight safety telemetry, defense, and power grid automation.</span>
                  ) : activeProfile === "Enterprise" ? (
                    <span>Scales dynamically across container nodes with parallel duplicate execution replay. Best for enterprise transaction logs, cloud billing, and medical records telemetry.</span>
                  ) : (
                    <span>Runs locally in a single memory frame. Optimized for high-velocity software testing, protocol prototyping, and telemetry schema compilation.</span>
                  )}
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 4: PLUGIN ECOSYSTEM */}
      {activeSubTab === "plugins" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn font-mono text-xs">
          
          {/* Active Plugins list */}
          <div className="lg:col-span-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                SDIP Active Extension Plugin Registry
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1 font-sans">
                Plugins allow third-party developers or specific domain specialists to inject constraints or analyzers without tampering with the stable core kernel codebase.
              </p>
            </div>

            <div className="space-y-3">
              {plugins.map((plug) => (
                <div key={plug.id} className="bg-black border border-zinc-900 p-3.5 rounded-lg flex items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-zinc-600 uppercase font-bold">{plug.id}</span>
                      <span className="text-[9px] text-purple-400 bg-purple-950/15 border border-purple-500/10 px-2 py-0.5 rounded font-bold uppercase">
                        {plug.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-200">{plug.name}</h4>
                  </div>

                  <span className={`text-[8px] font-bold tracking-widest px-2 py-1 rounded uppercase ${
                    plug.status === "active"
                      ? "bg-emerald-950/20 text-emerald-400 border border-emerald-500/10"
                      : "bg-zinc-950 text-zinc-600 border border-zinc-900"
                  }`}>
                    {plug.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Plugin creator form */}
          <div className="lg:col-span-1">
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Hot-Mount Platform Plugin
                </h3>
                <p className="text-[10px] text-zinc-500 mt-1 font-sans">
                  Register a safe custom plugin module to extend telemetry verification logic.
                </p>
              </div>

              <form onSubmit={handleAddPlugin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-zinc-500 text-[9px] block uppercase font-bold">Plugin Classification:</label>
                  <select
                    value={newPlugCat}
                    onChange={(e) => setNewPlugCat(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-zinc-400 outline-none focus:border-purple-500 text-xs"
                  >
                    <option value="Domain Analyzer">Domain Analyzer</option>
                    <option value="Constraint Module">Constraint Module</option>
                    <option value="Report Generator">Report Generator</option>
                    <option value="Storage Adapter">Storage Adapter</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 text-[9px] block uppercase font-bold">Plugin Name / Identifier:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Avionics Altimeter Guard"
                    value={newPlugName}
                    onChange={(e) => setNewPlugName(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-zinc-200 outline-none focus:border-purple-500 text-xs font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded text-xs transition uppercase tracking-wider"
                >
                  Hot-Mount Custom Plugin
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB: ECOSYSTEM GOVERNANCE */}
      {activeSubTab === "ecosystem" && (
        <div className="space-y-8 animate-fadeIn font-mono text-xs">
          
          {/* Section Header */}
          <div className="border-b border-zinc-900 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                VEK Platform Ecosystem Governance & Rules
              </h3>
              <p className="text-[10px] text-zinc-500 font-sans">
                Stable platform specifications (Documents 57–62) defining relationship frameworks, compatibility guidelines, repeatable datasets, and strict governance rules.
              </p>
            </div>
            
            <a 
              href="/api/ecosystem-spec"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] bg-purple-950/20 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded hover:bg-purple-950/40 transition flex items-center gap-1.5 font-bold uppercase shrink-0"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>View Full spec File</span>
            </a>
          </div>

          {/* Grid Layout: Document 57 Architecture & 60 Requirements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* DOCUMENT 57 — VEK ECOSYSTEM ARCHITECTURE */}
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Network className="w-4.5 h-4.5 text-purple-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    DOCUMENT 57 — VEK ECOSYSTEM ARCHITECTURE
                  </h4>
                </div>
                <p className="text-zinc-400 text-[11px] font-sans leading-relaxed mb-4">
                  The specification is the stable center; SDK implementations are replaceable, fully conforming to strict automated suites.
                </p>

                {/* ASCII Diagram Visualizer */}
                <div className="bg-black/80 border border-zinc-900 rounded p-4 text-[10px] text-zinc-300 space-y-2 select-none overflow-x-auto whitespace-pre">
                  <div className="text-center font-bold text-purple-400 font-mono">VEK Specification (Stable Center)</div>
                  <div className="text-center text-zinc-600">│</div>
                  <div className="text-center text-zinc-600">┌───────────────┼───────────────┐</div>
                  <div className="text-center text-zinc-600">│               │               │</div>
                  <div className="flex justify-around font-mono text-[9px] text-zinc-400">
                    <span className="bg-purple-950/10 border border-purple-500/10 px-2 py-0.5 rounded text-white font-bold">Rust Runtime</span>
                    <span className="bg-purple-950/10 border border-purple-500/10 px-2 py-0.5 rounded text-white font-bold">TypeScript SDK</span>
                    <span className="bg-purple-950/10 border border-purple-500/10 px-2 py-0.5 rounded text-white font-bold">Python SDK</span>
                  </div>
                  <div className="text-center text-zinc-600">│               │               │</div>
                  <div className="text-center text-zinc-600">└───────────────┼───────────────┘</div>
                  <div className="text-center text-zinc-600">▼</div>
                  <div className="text-center text-purple-400 font-bold">Conformance Suite (Standardized Verification)</div>
                  <div className="text-center text-zinc-600">▼</div>
                  <div className="text-center text-zinc-400">Evidence Generation (EGAF Claim Ledgering)</div>
                  <div className="text-center text-zinc-600">▼</div>
                  <div className="text-center text-zinc-400">Verification & Attestation (Proof Logging)</div>
                  <div className="text-center text-zinc-600">▼</div>
                  <div className="text-center text-emerald-400 font-bold">External Audit / Licensing</div>
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 font-sans italic pt-2 border-t border-zinc-900/60">
                This unidirectional flow ensures that any language-specific engine can be verified identically.
              </div>
            </div>

            {/* DOCUMENT 60 — IMPLEMENTATION REQUIREMENTS */}
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-purple-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    DOCUMENT 60 — IMPLEMENTATION REQUIREMENTS
                  </h4>
                </div>
                <p className="text-zinc-400 text-[11px] font-sans leading-relaxed mb-4">
                  To keep the framework minimal and secure, mandatory components are separated strictly from auxiliary client-side features.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/60 border border-zinc-900 p-3.5 rounded-lg space-y-2">
                    <span className="text-[9px] text-purple-400 font-bold uppercase block tracking-wider">MANDATORY CORE (REQUIRED)</span>
                    <ul className="space-y-1.5 text-[10px] text-zinc-300 font-sans">
                      <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-purple-500 shrink-0" /><span>Deterministic execution</span></li>
                      <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-purple-500 shrink-0" /><span>Canonical hashing</span></li>
                      <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-purple-500 shrink-0" /><span>Evidence generation</span></li>
                      <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-purple-500 shrink-0" /><span>Conformance support</span></li>
                    </ul>
                  </div>

                  <div className="bg-black/60 border border-zinc-900 p-3.5 rounded-lg space-y-2">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">AUXILIARY SERVICES (OPTIONAL)</span>
                    <ul className="space-y-1.5 text-[10px] text-zinc-500 font-sans">
                      <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-zinc-800 shrink-0" /><span>Ecosystem Dashboard</span></li>
                      <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-zinc-800 shrink-0" /><span>Active Visualizations</span></li>
                      <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-zinc-800 shrink-0" /><span>Benchmark UI Panels</span></li>
                      <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-zinc-800 shrink-0" /><span>Enterprise Integrations</span></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 font-sans italic pt-2 border-t border-zinc-900/60">
                Any developer can build a certified VEK implementation by satisfying only the 4 mandatory requirements.
              </div>
            </div>

          </div>

          {/* DOCUMENT 59 — REFERENCE DATASETS & INTERACTIVE PLAYGROUND */}
          <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-3 mb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4.5 h-4.5 text-blue-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    DOCUMENT 59 — REPEATABLE REFERENCE DATASETS
                  </h4>
                </div>
                <p className="text-[10px] text-zinc-500 font-sans">
                  Fixed datasets used as standard regressions tests across all implementations to verify deterministic compliance.
                </p>
              </div>

              {/* Dataset Select tabs */}
              <div className="flex bg-black border border-zinc-900 p-1 rounded text-[10px]">
                {[
                  { id: "ref_det_001", label: "ref_det_001" },
                  { id: "ref_rep_002", label: "ref_rep_002" },
                  { id: "ref_con_003", label: "ref_con_003" }
                ].map((ds) => (
                  <button
                    key={ds.id}
                    onClick={() => {
                      setSelectedDataset(ds.id as any);
                      setDatasetVerificationResult(null);
                    }}
                    className={`px-3 py-1.5 rounded uppercase font-bold transition-all ${
                      selectedDataset === ds.id
                        ? "bg-blue-950/20 text-blue-400 border border-blue-500/20"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {ds.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
              
              {/* Dataset Details Card */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Inputs field */}
                  <div className="space-y-1.5">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase block">Input State Payload:</span>
                    <pre className="bg-black/60 border border-zinc-900 rounded p-3 h-32 overflow-auto text-zinc-300 text-[10px] font-mono leading-relaxed">
                      {selectedDataset === "ref_det_001" ? (
`{
  "transaction_id": "TX-01",
  "sequence_number": 4821,
  "registers": [255, 12, 0, 84]
}`
                      ) : selectedDataset === "ref_rep_002" ? (
`{
  "drift_threshold_ms": 12.0,
  "transition_log": [
    "INIT_0x00",
    "STEP_0x04",
    "SEAL_0x08"
  ]
}`
                      ) : (
`{
  "replicas": ["alpha", "beta"],
  "voting_weight": 1.0,
  "agreement_limit": 1.0
}`
                      )}
                    </pre>
                  </div>

                  {/* Outputs field */}
                  <div className="space-y-1.5">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase block">Expected Output Payload:</span>
                    <pre className="bg-black/60 border border-zinc-900 rounded p-3 h-32 overflow-auto text-zinc-300 text-[10px] font-mono leading-relaxed">
                      {selectedDataset === "ref_det_001" ? (
`{
  "status": "SUCCESS",
  "transition_vector": "0x1A",
  "cycle_overhead": 8
}`
                      ) : selectedDataset === "ref_rep_002" ? (
`{
  "drift_detected_ms": 0.042,
  "state_variance": "CLEAN"
}`
                      ) : (
`{
  "consensus_state": "ATOMIC_LOCKED",
  "quorum_signature": "Ed25519"
}`
                      )}
                    </pre>
                  </div>
                </div>

                {/* Canonical Hash and copy */}
                <div className="bg-black/50 border border-zinc-900 p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block">Expected Canonical State Hash:</span>
                    <span className="text-zinc-300 font-mono text-[10px] block break-all font-bold">
                      {selectedDataset === "ref_det_001" 
                        ? "e7a9b0d2f4c6e8a1b3d5f7c9e1a3b5d7f9c2e4a6b8d0f2c4e6a8b1d3f5c7e9a1"
                        : selectedDataset === "ref_rep_002"
                        ? "c4d8e7f9a2b1c0d3e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8"
                        : "7a8c9b0e2f1d5c4b3a6e9d8f7c6b5a4d3e2f1c0b9a8d7f6e5d4c3b2a1f0e9d8c"
                      }
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const h = selectedDataset === "ref_det_001" 
                        ? "e7a9b0d2f4c6e8a1b3d5f7c9e1a3b5d7f9c2e4a6b8d0f2c4e6a8b1d3f5c7e9a1"
                        : selectedDataset === "ref_rep_002"
                        ? "c4d8e7f9a2b1c0d3e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8"
                        : "7a8c9b0e2f1d5c4b3a6e9d8f7c6b5a4d3e2f1c0b9a8d7f6e5d4c3b2a1f0e9d8c";
                      navigator.clipboard.writeText(h);
                      setCopiedDatasetHash(true);
                      setTimeout(() => setCopiedDatasetHash(false), 2000);
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0"
                  >
                    {copiedDatasetHash ? "Copied!" : "Copy Hash"}
                  </button>
                </div>
              </div>

              {/* Simulation Verification Side card */}
              <div className="lg:col-span-1 bg-black border border-zinc-900 rounded-lg p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-900">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      Harness Validator Unit
                    </span>
                  </div>
                  <p className="text-zinc-500 text-[10px] font-sans leading-relaxed">
                    Trigger regression validation checking candidate output hashes and state vectors against the canonical index.
                  </p>

                  {datasetVerifying && (
                    <div className="space-y-2 p-2 bg-[#0c0c0e] border border-zinc-900 rounded animate-pulse">
                      <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                        <span>PIPELINE VERIFYING...</span>
                        <span>WAITING</span>
                      </div>
                      <div className="h-1 bg-zinc-900 w-full overflow-hidden rounded-full">
                        <div className="h-full bg-purple-500 animate-pulse" style={{ width: "80%" }} />
                      </div>
                    </div>
                  )}

                  {datasetVerificationResult && (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded space-y-1 font-mono text-[10px]">
                      <div className="font-extrabold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>VERIFICATION: {datasetVerificationResult}</span>
                      </div>
                      <p className="text-zinc-400 text-[9px] leading-relaxed font-sans mt-1">
                        Output state match detected with zero drift. Deterministic execution witness hash verified successfully.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={datasetVerifying}
                  onClick={() => {
                    setDatasetVerifying(true);
                    setDatasetVerificationResult(null);
                    setTimeout(() => {
                      setDatasetVerifying(false);
                      setDatasetVerificationResult("VERIFIED_OK");
                    }, 1200);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded text-[10px] transition uppercase tracking-widest disabled:bg-[#18181b] disabled:text-zinc-600"
                >
                  {datasetVerifying ? "Verifying..." : "Run Dataset verification"}
                </button>
              </div>

            </div>
          </div>

          {/* Grid Layout: Document 58 Compatibility & Document 61 Validation Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* DOCUMENT 58 — COMPATIBILITY POLICY (lg:col-span-2) */}
            <div className="lg:col-span-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <SlidersHorizontal className="w-4.5 h-4.5 text-purple-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    DOCUMENT 58 — COMPATIBILITY POLICY
                  </h4>
                </div>
                <p className="text-zinc-400 text-[11px] font-sans leading-relaxed mb-4">
                  Governs software boundaries across cycles. Establishes immutable rules for API, CLI and schemas.
                </p>

                <div className="space-y-2.5">
                  {[
                    { c: "Specification", rule: "Semantic Versioning", badge: "SEMVER" },
                    { c: "Evidence Schema", rule: "Backward compatible in Major versions", badge: "BACKWARD_COMPAT" },
                    { c: "Verification CLI", rule: "Supports prior format for 1 major release", badge: "N-1 SUPPORT" },
                    { c: "REST / WS APIs", rule: "Versioned routes with formal deprecation", badge: "DEPRECATION_RULE" },
                    { c: "Conformance Tests", rule: "Versioned independently from codebases", badge: "INDEPENDENT" }
                  ].map((rule, idx) => (
                    <div key={idx} className="bg-black/60 border border-zinc-900 p-2.5 rounded flex items-center justify-between text-[10px]">
                      <div>
                        <span className="text-zinc-400 font-extrabold block">{rule.c}</span>
                        <span className="text-zinc-500 text-[9px] font-sans block mt-0.5">{rule.rule}</span>
                      </div>
                      <span className="text-[8px] bg-purple-950/20 text-purple-400 border border-purple-500/10 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                        {rule.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-[10px] text-zinc-500 font-sans italic pt-2 border-t border-zinc-900/60">
                This matrix ensures enterprise evaluators that updates will not break active client-side workflows.
              </div>
            </div>

            {/* DOCUMENT 61 — VALIDATION CAMPAIGN PLAN (lg:col-span-3) */}
            <div className="lg:col-span-3 bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4.5 h-4.5 text-purple-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    DOCUMENT 61 — VALIDATION CAMPAIGN PLAN
                  </h4>
                </div>
                <p className="text-zinc-400 text-[11px] font-sans leading-relaxed mb-4">
                  A structured methodology executed before broader deployment inside aerospace and industrial partner pilots. Click phases to see criteria.
                </p>

                {/* Campaign Stepper Tabs */}
                <div className="grid grid-cols-4 gap-1.5 mb-4 text-center">
                  {[1, 2, 3, 4].map((ph) => (
                    <button
                      type="button"
                      key={ph}
                      onClick={() => setSelectedCampaignPhase(ph)}
                      className={`p-2 rounded border uppercase font-bold text-[9px] transition ${
                        selectedCampaignPhase === ph
                          ? "bg-purple-950/25 border-purple-500 text-purple-400"
                          : "bg-black/50 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Phase 0{ph}
                    </button>
                  ))}
                </div>

                {/* Stepper Details */}
                <div className="bg-black border border-zinc-900 p-3.5 rounded-lg space-y-3 min-h-[140px]">
                  {selectedCampaignPhase === 1 && (
                    <div className="space-y-2 animate-fadeIn">
                      <span className="text-purple-400 font-extrabold uppercase text-[10px] block">PHASE 1: INTERNAL REPRODUCIBILITY</span>
                      <p className="text-zinc-400 text-[10px] font-sans leading-relaxed">
                        Validate core state replay bounds inside continuous integration containers. Requires 1,000 parallel test executions with zero register timing variance.
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-[9px] text-zinc-500 pt-1.5 border-t border-zinc-900/60">
                        <div><span className="font-bold text-zinc-400 block uppercase">Entrance:</span>Compiler pass on core Rust files</div>
                        <div><span className="font-bold text-zinc-400 block uppercase">Exit:</span>0 trace drift on test harness</div>
                      </div>
                    </div>
                  )}

                  {selectedCampaignPhase === 2 && (
                    <div className="space-y-2 animate-fadeIn">
                      <span className="text-purple-400 font-extrabold uppercase text-[10px] block">PHASE 2: INDEPENDENT REPRODUCTION</span>
                      <p className="text-zinc-400 text-[10px] font-sans leading-relaxed">
                        Deploy clean conformance containers to third-party engineering units. Demonstrates modular codebase reuse and out-of-the-box configuration.
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-[9px] text-zinc-500 pt-1.5 border-t border-zinc-900/60">
                        <div><span className="font-bold text-zinc-400 block uppercase">Entrance:</span>Complete API docs and Docker files</div>
                        <div><span className="font-bold text-zinc-400 block uppercase">Exit:</span>Independent signature sign-off</div>
                      </div>
                    </div>
                  )}

                  {selectedCampaignPhase === 3 && (
                    <div className="space-y-2 animate-fadeIn">
                      <span className="text-purple-400 font-extrabold uppercase text-[10px] block">PHASE 3: SECURITY-FOCUSED REVIEW</span>
                      <p className="text-zinc-400 text-[10px] font-sans leading-relaxed">
                        Execute vulnerability and stress review targeting malicious state injections, memory overflows, and timing-attack vectors in enclaves.
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-[9px] text-zinc-500 pt-1.5 border-t border-zinc-900/60">
                        <div><span className="font-bold text-zinc-400 block uppercase">Entrance:</span>Code freeze, complete threat model</div>
                        <div><span className="font-bold text-zinc-400 block uppercase">Exit:</span>Zero high-risk findings remaining</div>
                      </div>
                    </div>
                  )}

                  {selectedCampaignPhase === 4 && (
                    <div className="space-y-2 animate-fadeIn">
                      <span className="text-purple-400 font-extrabold uppercase text-[10px] block">PHASE 4: PERFORMANCE EVALUATION</span>
                      <p className="text-zinc-400 text-[10px] font-sans leading-relaxed">
                        Run scale benchmarking on target clusters measuring memory footprint, network overhead, and continuous transaction throughput under peak stress.
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-[9px] text-zinc-500 pt-1.5 border-t border-zinc-900/60">
                        <div><span className="font-bold text-zinc-400 block uppercase">Entrance:</span>Deploy multi-enclave cluster node</div>
                        <div><span className="font-bold text-zinc-400 block uppercase">Exit:</span>Verify throughput &gt; 10k TPS</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 font-sans italic pt-2 border-t border-zinc-900/60">
                Each validation gateway ensures the platform moves safely towards commercial and sovereign readiness.
              </div>
            </div>

          </div>

          {/* DOCUMENT 62 — GOVERNANCE CHARTER */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
              <ShieldCheck className="w-4.5 h-4.5 text-purple-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                DOCUMENT 62 — GOVERNANCE CHARTER
              </h4>
            </div>
            <p className="text-zinc-400 text-[11px] font-sans leading-relaxed max-w-4xl">
              Establishes formal protocols for proposal submissions, audits, release cadences and documentation reviews, guaranteeing technical evolution remains transparent and predictable.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Change proposal process", desc: "Modifications to the specification require a formal Verifiable Execution Proposal (VEP-RFC) detailing compatibility limits and complete reference models." },
                { title: "Specification review process", desc: "VEPs are scrutinized by designated independent architectural partners. Approval requires consensus verification of deterministic correctness." },
                { title: "Version release process", desc: "Minor updates maintain absolute backward compatibility. Major changes require a 120-day deprecation schedule to prevent downstream breakage." },
                { title: "Conformance update policy", desc: "Any specification change triggers automatic synchronous regression test updates to the executable Conformance Suite." },
                { title: "Documentation review policy", desc: "All files, guides, and formal threat models are subjected to audit reviews on every major/minor specification release." },
                { title: "Evidence retention policy", desc: "Signed audit bundles, witness traces, and validator consensus hashes are archived permanently inside tamper-evident storage networks." }
              ].map((policy, idx) => (
                <div key={idx} className="bg-black/60 border border-zinc-900/60 p-4 rounded-lg space-y-2 hover:border-purple-500/30 transition-all duration-300">
                  <span className="text-[9px] text-purple-400 font-bold uppercase block tracking-wider">{policy.title}</span>
                  <p className="text-zinc-400 text-[10px] font-sans leading-relaxed">{policy.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 5: REAL-TIME OBSERVABILITY */}
      {activeSubTab === "observability" && (
        <div className="space-y-6 animate-fadeIn font-mono text-xs">
          
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Sovereign Platform Telemetry Monitor
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">
              Provides visual monitoring metrics to evaluate operational health and replay determinism integrity across workers.
            </p>
          </div>

          {/* Telemetry Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* Metric 1 */}
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-4 space-y-2">
              <span className="text-zinc-500 text-[9px] uppercase font-bold block">Aggregated Telemetry Load</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-extrabold text-white">{simulatedLoad}%</span>
                <span className="text-[9px] text-emerald-500 font-bold uppercase">NORMAL</span>
              </div>
              <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full" style={{ width: `${simulatedLoad}%` }} />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-4 space-y-2">
              <span className="text-zinc-500 text-[9px] uppercase font-bold block">Consensus Queue Depth</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-extrabold text-white">{queueDepth} tasks</span>
                <span className="text-[9px] text-blue-400 font-bold uppercase">BUFFER CLEAN</span>
              </div>
              <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${(queueDepth/15)*100}%` }} />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-4 space-y-2">
              <span className="text-zinc-500 text-[9px] uppercase font-bold block">Replay Trace Divergence</span>
              <div className="flex justify-between items-baseline">
                <span className={`text-2xl font-extrabold ${injectLatency ? "text-amber-400 font-extrabold" : "text-white"}`}>
                  {injectLatency ? "3.84 ms" : "0.00 ms"}
                </span>
                <span className={`text-[9px] font-bold uppercase ${injectLatency ? "text-amber-400" : "text-emerald-500"}`}>
                  {injectLatency ? "DRIFT ALERT" : "ZERO-DRIFT"}
                </span>
              </div>
              <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                <div className={`h-full ${injectLatency ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: injectLatency ? "65%" : "0%" }} />
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-4 space-y-2">
              <span className="text-zinc-500 text-[9px] uppercase font-bold block">Audit Signing Key Lock</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-extrabold text-emerald-400">SECURE</span>
                <span className="text-[9px] text-emerald-500 font-bold uppercase">Ed25519</span>
              </div>
              <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full" />
              </div>
            </div>

          </div>

          {/* Interactive Logs Console */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Live Host Cluster Kernel Trace Logs</span>
              <button 
                onClick={() => setSystemLogs(["[KERNEL] Logs flushed.", `[KERNEL] Node synchronization complete.`])}
                className="text-[8px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 font-bold"
              >
                Clear Console Logs
              </button>
            </div>

            <div className="bg-black border border-zinc-950 rounded p-4 h-44 overflow-y-auto scrollbar-thin space-y-1.5 text-zinc-400 text-[10px]">
              {systemLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-zinc-600 font-bold shrink-0">&gt;</span>
                  <span className={
                    log.includes("[EGAF_ENGINE]") ? "text-blue-400" :
                    log.includes("[AUDIT_SERVICE]") ? "text-emerald-400 font-bold" :
                    log.includes("[KERNEL") ? "text-purple-400" : "text-zinc-300"
                  }>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ROADMAP PROGRESS STATUS BOARD */}
      <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4 font-mono text-xs">
        <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-purple-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Sovereign Platform Long-Term Engineering Roadmap
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-bold">SDIP Phase Gateway</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            { step: "M-01", name: "Reference Implementation", desc: "Build a modular, minimal end-to-end Rust system demonstrating safe candidate execution, EGAF claim graphs, and signed audit bundle serialization.", status: "IN_PROGRESS" },
            { step: "M-02", name: "Executable Conformance Suite", desc: "Implement rigorous automated test suites validating timing-drift preservation, constraint checks, and serial consistency to verify external nodes.", status: "IN_PROGRESS" },
            { step: "M-03", name: "Polished SDK & Bindings", desc: "Publish zero-dependency safe Rust libraries with PyO3 bindings for Python analytics, and compiled WASM packages for high-velocity web interfaces.", status: "QUEUED" },
            { step: "M-04", name: "High Assurance KMS / HSM Core", desc: "Integrate support for dedicated Hardware Security Modules (FIPS 140-3) and AWS KMS enclaves to protect audit signatures under high-severity threat environments.", status: "QUEUED" },
            { step: "M-05", name: "Empirical Performance Benchmark", desc: "Measure micro-benchmark statistics on CPU cycle latency, serialization overhead, memory consumption, and distributed transaction throughput.", status: "QUEUED" },
            { step: "M-06", name: "Decentralized Ledger Ledgering", desc: "Establish ledger synchronizers pushing cryptographically bound audit signatures to IPFS and immutable networks to allow distributed remote auditing.", status: "QUEUED" }
          ].map((milestone) => (
            <div key={milestone.step} className="bg-black border border-zinc-900/60 p-3.5 rounded-lg flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-zinc-600">{milestone.step}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                    milestone.status === "IN_PROGRESS"
                      ? "bg-purple-950/20 text-purple-400 border border-purple-500/10"
                      : "bg-zinc-950 text-zinc-600 border border-zinc-900"
                  }`}>
                    {milestone.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-white text-[11px] leading-tight uppercase">{milestone.name}</h4>
                <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">{milestone.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
