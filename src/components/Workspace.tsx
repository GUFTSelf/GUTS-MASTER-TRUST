import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Folder, File, FolderOpen, ChevronRight, ChevronDown, 
  GitBranch, GitPullRequest, GitCommit, CheckCircle2, AlertCircle, 
  Play, RefreshCw, Cpu, Layers, Terminal, Server, 
  ArrowRight, ShieldCheck, KanbanSquare, CheckCircle, Clock,
  Flame, BookOpen, Activity, Code2, Network, Check, ExternalLink
} from "lucide-react";

interface WorkspaceProps {}

interface MonorepoNode {
  name: string;
  type: "directory" | "file";
  desc: string;
  children?: MonorepoNode[];
  tech?: string;
}

interface Milestone {
  id: number;
  name: string;
  desc: string;
  status: "completed" | "in-progress" | "pending";
  checklist: string[];
  assertions: string[];
}

interface KanbanTask {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  assignee: string;
  labels: string[];
}

export default function Workspace({}: WorkspaceProps) {
  // Navigation states
  const [activeSubTab, setActiveSubTab] = useState<"structure" | "tracks" | "milestones" | "pipeline" | "projects">("structure");
  
  // Interactive File Tree State
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "GUTS-MASTER-TRUST": true,
    "crates": true,
    "apps": true,
    "services": true
  });
  const [selectedNode, setSelectedNode] = useState<string>("vek-console");

  // Interactive CI/CD states
  const [commitMessage, setCommitMessage] = useState<string>("feat: align replay engine with vep-2.5.0 state assertions");
  const [pipelineState, setPipelineState] = useState<"idle" | "running" | "success" | "failed">("idle");
  const [pipelineProgress, setPipelineProgress] = useState<number>(0);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [injectCiFailure, setInjectCiFailure] = useState<boolean>(false);

  // Kanban Board states
  const [selectedBoard, setSelectedBoard] = useState<"Kernel" | "EGAF" | "Platform" | "Developer Tools" | "Verification">("Kernel");
  
  // Project roadmap tracks state
  const [trackProgress, setTrackProgress] = useState<Record<string, number>>({
    A: 65, // Core Runtime
    B: 40, // Evidence Layer
    C: 50, // Platform Services
    D: 30  // Dev Experience
  });

  const [systemLogs, setSystemLogs] = useState<string[]>([
    "[SYSTEM_INIT] GUTS-MASTER-TRUST monorepo workspace successfully mounted.",
    "[SYSTEM_INIT] Loaded 15 modules across 4 tracks.",
    "[SYSTEM_INIT] Active target framework set to VEP-2.5.0."
  ]);

  const monorepoTree: MonorepoNode = {
    name: "GUTS-MASTER-TRUST",
    type: "directory",
    desc: "Sovereign platform multi-crate monorepo configuration workspace.",
    children: [
      {
        name: "apps",
        type: "directory",
        desc: "Interactive operator interfaces and dashboard layers.",
        children: [
          { name: "vek-console", type: "directory", desc: "Core operator dashboard and visual trace simulator (React/Vite).", tech: "TypeScript" },
          { name: "admin-console", type: "directory", desc: "Cluster management dashboard for active cloud enclaves.", tech: "TypeScript" },
          { name: "documentation-site", type: "directory", desc: "API reference, architecture guides, and compliance documents.", tech: "Next.js" }
        ]
      },
      {
        name: "crates",
        type: "directory",
        desc: "High-performance Rust modules executing deterministic workloads.",
        children: [
          { name: "vek-core", type: "directory", desc: "Isolated virtual machine environment tracking CPU state transitions.", tech: "Rust" },
          { name: "vek-runtime", type: "directory", desc: "VM scheduler managing execution cycles and sandboxing parameters.", tech: "Rust" },
          { name: "vek-egaf", type: "directory", desc: "Evidence Analysis Framework constructing and assessing claim graphs.", tech: "Rust" },
          { name: "vek-crypto", type: "directory", desc: "FIPS 140-3 cryptography layer with SHA-512 and Ed25519 signature wrappers.", tech: "Rust" },
          { name: "vek-protocol", type: "directory", desc: "Serialization and schema bindings matching VEP-2.5.0 format.", tech: "Rust" },
          { name: "vek-schema", type: "directory", desc: "Shared database and trace log models compiled to JSON schema.", tech: "Rust" },
          { name: "vek-storage", type: "directory", desc: "Durable local write-ahead loggers and immutable ledger clients.", tech: "Rust" },
          { name: "vek-cli", type: "directory", desc: "Command line utility to verify signed audit bundles locally.", tech: "Rust" }
        ]
      },
      {
        name: "services",
        type: "directory",
        desc: "Distributed microservice container nodes.",
        children: [
          { name: "execution-service", type: "directory", desc: "Dockerized runner hosting isolated Rust VM workers.", tech: "Rust / Docker" },
          { name: "replay-service", type: "directory", desc: "Automatic duplicate checker validating replay consistency.", tech: "Rust / Docker" },
          { name: "evidence-service", type: "directory", desc: "EGAF microservice scoring and archiving evidence sources.", tech: "Rust / Docker" },
          { name: "scheduler-service", type: "directory", desc: "Distributes transaction load across available cluster enclaves.", tech: "Go / Docker" },
          { name: "audit-service", type: "directory", desc: "Compiles and cryptographically signs final verification bundles.", tech: "Rust / Docker" }
        ]
      },
      {
        name: "sdk",
        type: "directory",
        desc: "Developer integrations for embedding verifiable operations.",
        children: [
          { name: "rust", type: "directory", desc: "Native Rust client API with full feature bindings.", tech: "Rust" },
          { name: "typescript", type: "directory", desc: "Web client bindings for remote network nodes.", tech: "TypeScript" },
          { name: "python", type: "directory", desc: "ML-oriented client library for wrapping AI models.", tech: "Python" }
        ]
      },
      { name: "schemas", type: "directory", desc: "Central storage of JSON-Schema templates for VEP validation." },
      { name: "specs", type: "directory", desc: "Formal mathematical documents specifying state invariants." },
      { name: "docs", type: "directory", desc: "Operational documentation, whitepapers, and guides." },
      { name: "tests", type: "directory", desc: "End-to-end conformance test suite and replay benchmarks." },
      { name: "examples", type: "directory", desc: "Demonstration integrations for avionics and SCADA domains." },
      { name: "deployments", type: "directory", desc: "Terraform configurations and Kubernetes cluster definitions." }
    ]
  };

  const milestones: Milestone[] = [
    {
      id: 1,
      name: "Milestone 1 — Foundation",
      desc: "Establishes core structural types, schemas, and FIPS cryptographic hashes.",
      status: "completed",
      checklist: [
        "Create shared JSON-Schema for VEP packets",
        "Generate Rust struct bindings in vek-schema",
        "Implement canonical byte-aligned serialization",
        "Verify FIPS-compliant SHA-512 cryptographic wrappers"
      ],
      assertions: [
        "Assert(Serialize(Proof) is byte-identical across platforms)",
        "Assert(SHA512(Payload) hashes match expected secure signatures)"
      ]
    },
    {
      id: 2,
      name: "Milestone 2 — Runtime Engine",
      desc: "Delivers deterministic memory tracking, isolated thread execution, and replay checking.",
      status: "in-progress",
      checklist: [
        "Boot isolated VM execution sandboxes with clean state",
        "Implement duplicate thread replay matching logic",
        "Enforce active register safety bounds constraints",
        "Generate cryptographic validation witness proofs"
      ],
      assertions: [
        "Assert(ReplayTrace(Input) === OriginalTrace(Input))",
        "Assert(ViolationsTriggerFailsafe(CurrentValue > PolicyLimit))"
      ]
    },
    {
      id: 3,
      name: "Milestone 3 — Analysis (EGAF)",
      desc: "Extracts logical claim vectors and processes source credibility scores.",
      status: "pending",
      checklist: [
        "Build logical statement parser in vek-egaf",
        "Construct acyclic claim graphs with dynamic dependencies",
        "Integrate synthetic vs physical source classifiers",
        "Calculate aggregate scoring confidence metrics"
      ],
      assertions: [
        "Assert(ClaimGraph.hasCycles() === FALSE)",
        "Assert(FactualSupportScoring >= WeightedJudgmentScoring)"
      ]
    },
    {
      id: 4,
      name: "Milestone 4 — Distributed Platform",
      desc: "Enables multi-node execution, cluster consensus, and remote scheduler queues.",
      status: "pending",
      checklist: [
        "Design scheduler queue with load balance routers",
        "Implement consensus protocol matching between independent nodes",
        "Deploy HSM signature interfaces over secure sockets",
        "Persist signed bundles inside replicated audit storage databases"
      ],
      assertions: [
        "Assert(ConsensusFormed == (Node_A_Hash === Node_B_Hash))",
        "Assert(AuditBundle.immutableSignatureCheck() === TRUE)"
      ]
    },
    {
      id: 5,
      name: "Milestone 5 — Sovereign Assurance",
      desc: "Integrates formal verification proofs, compliance benchmarking, and strict conformance checks.",
      status: "pending",
      checklist: [
        "Integrate formal methods analyzers inside compiler pipeline",
        "Run automated conformance test suites against third-party runtimes",
        "Benchmark thread execution times and CPU cycle footprints",
        "Compile flight-ready aerospace and SCADA compliance reports"
      ],
      assertions: [
        "Assert(FormalVerificationProofs.conformsToInvariants() === TRUE)",
        "Assert(DriftMargins <= 0.01ms under continuous heavy cycle loads)"
      ]
    }
  ];

  const initialTasks: KanbanTask[] = [
    // Kernel Tasks
    { id: "KER-101", title: "Implement isolated thread sandboxing in vek-core", status: "doing", assignee: "Sarah K.", labels: ["Critical", "Rust", "VM"] },
    { id: "KER-102", title: "Refactor Register drift margins check logic", status: "done", assignee: "Alex B.", labels: ["Determinism", "Rust"] },
    { id: "KER-103", title: "Add STARK witness commitment trees in vek-runtime", status: "todo", assignee: "Sarah K.", labels: ["Math", "ZKP"] },
    
    // EGAF Tasks
    { id: "EGA-201", title: "Implement claim parser parsing natural text logs", status: "todo", assignee: "James T.", labels: ["Parser", "NLP"] },
    { id: "EGA-202", title: "Construct DAG cycle validator in claim-graph", status: "doing", assignee: "Mikael L.", labels: ["Graph", "Math"] },
    { id: "EGA-203", title: "Integrate SCADA modbus credential scorer", status: "done", assignee: "James T.", labels: ["Telemetry"] },
    
    // Platform Tasks
    { id: "PLA-301", title: "Build Kubernetes deployment configurations for high-assurance enclaves", status: "doing", assignee: "Elena R.", labels: ["Infra", "K8s"] },
    { id: "PLA-302", title: "Implement scheduler FIFO transaction pipeline", status: "done", assignee: "Elena R.", labels: ["Go", "Scheduler"] },
    { id: "PLA-303", title: "Add HSM digital envelope wrappers in audit-service", status: "todo", assignee: "David P.", labels: ["Security", "KMS"] },
    
    // Dev Tools Tasks
    { id: "DEV-401", title: "Compile documentation reference for VEP v2.5.0 protocol", status: "doing", assignee: "Clara M.", labels: ["Docs", "API"] },
    { id: "DEV-402", title: "Publish vek-cli package to crates.io", status: "todo", assignee: "Clara M.", labels: ["Rust", "Publish"] },
    
    // Verification Tasks
    { id: "VER-501", title: "Write automated zero-drift execution replay benchmark", status: "doing", assignee: "Nils S.", labels: ["Benchmark", "CI"] },
    { id: "VER-502", title: "Assert flight-safety invariants via Coq formal theorems", status: "todo", assignee: "Nils S.", labels: ["Formal Methods"] }
  ];

  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);

  const toggleNode = (nodeName: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeName]: !prev[nodeName]
    }));
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      if (selectedBoard === "Kernel") return task.id.startsWith("KER-");
      if (selectedBoard === "EGAF") return task.id.startsWith("EGA-");
      if (selectedBoard === "Platform") return task.id.startsWith("PLA-");
      if (selectedBoard === "Developer Tools") return task.id.startsWith("DEV-");
      if (selectedBoard === "Verification") return task.id.startsWith("VER-");
      return true;
    });
  };

  // Move task status handler (Kanban Simulation)
  const moveTask = (taskId: string, newStatus: "todo" | "doing" | "done") => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    // Output trace log
    setSystemLogs(prev => [
      `[KANBAN_PROJECTS] Task ${taskId} shifted status to '${newStatus.toUpperCase()}'.`,
      ...prev
    ]);
  };

  // Render tree node recursive helper
  const renderTreeNode = (node: MonorepoNode, path: string = "") => {
    const isExpanded = expandedNodes[node.name];
    const isSelected = selectedNode === node.name;
    const hasChildren = node.children && node.children.length > 0;
    const currentPath = path ? `${path}/${node.name}` : node.name;

    return (
      <div key={node.name} className="pl-4 font-mono select-none">
        <div 
          onClick={() => {
            if (hasChildren) toggleNode(node.name);
            setSelectedNode(node.name);
          }}
          className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-colors text-xs ${
            isSelected 
              ? "bg-purple-950/20 text-purple-400 border-l-2 border-purple-500 font-bold" 
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
            </div>
          )}

          {node.type === "directory" ? (
            isExpanded ? <FolderOpen className="w-4 h-4 text-purple-400" /> : <Folder className="w-4 h-4 text-purple-400" />
          ) : (
            <File className="w-3.5 h-3.5 text-zinc-500" />
          )}

          <span className="truncate">{node.name}</span>
          {node.tech && (
            <span className="text-[8px] bg-zinc-900 text-zinc-500 border border-zinc-800 px-1 rounded ml-auto">
              {node.tech}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-zinc-900 ml-3.5 pl-1.5 space-y-0.5">
            {node.children!.map(child => renderTreeNode(child, currentPath))}
          </div>
        )}
      </div>
    );
  };

  // Run CI/CD Pipeline Simulation
  const runCiPipeline = () => {
    if (pipelineState === "running") return;
    setPipelineState("running");
    setPipelineProgress(0);
    setActiveStepIndex(0);
    setPipelineLogs([`[CI_PIPELINE] Triggered pipeline build for commit: "${commitMessage}"`]);

    const steps = [
      { name: "Format Check", desc: "Checking cargo & prettier syntax form.", failText: "Formatting violations detected in vek-core/src/vm.rs." },
      { name: "Lint", desc: "Running clippy static checks over Rust crates.", failText: "Linter error: Dead-code warning escalated to fatal in vek-egaf/src/graph.rs" },
      { name: "Unit Tests", desc: "Running isolated assertion tests inside crates.", failText: "Failed Unit Test: vek-crypto/src/sig::test_sig_mismatch" },
      { name: "Integration Tests", desc: "Verifying subsystem communication paths.", failText: "Failed Integration: vervice communication channel timed out." },
      { name: "Replay Tests", desc: "Running VM replay engine under timing constraints.", failText: "DRIFT ERROR: Non-deterministic floating register detected during replay test 5." },
      { name: "Schema Validation", desc: "Verifying payload JSON-Schema conformance.", failText: "SCHEMA MISMATCH: Property 'witness_root' missing from VEP execution envelope." },
      { name: "Documentation Build", desc: "Compiling API sphinx and rustdocs.", failText: "Failed to compile docs: Missing target link reference." },
      { name: "Release Candidate", desc: "Creating deployable binary artifacts.", failText: "Failed to bundle executable: Linker missing dependencies." }
    ];

    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex >= steps.length) {
        clearInterval(interval);
        setPipelineState("success");
        setPipelineProgress(100);
        setPipelineLogs(prev => [
          ...prev,
          "[SUCCESS] All checks completed. 8/8 pipeline stages passed.",
          `[RC_RELEASE] Tagged release candidate as vek-3.1.0-rc.${Math.floor(Math.random()*100+1)}`,
          "[LEDGER_PUBLISH] Audit checksum written to sovereign release ledger."
        ]);
        return;
      }

      const step = steps[currentIndex];
      setPipelineLogs(prev => [
        ...prev,
        `[STAGE: ${step.name.toUpperCase()}] Running task...`,
        `[INFO] ${step.desc}`
      ]);

      // Introduce simulated failure logic
      if (injectCiFailure && currentIndex === 4) {
        clearInterval(interval);
        setPipelineState("failed");
        setPipelineLogs(prev => [
          ...prev,
          `[FAIL] ${step.failText}`,
          "[CRITICAL_EXIT] Pipeline aborted. Build failed with code 1. Release bundle blocked."
        ]);
        return;
      }

      setPipelineLogs(prev => [
        ...prev,
        `[SUCCESS] Passed ${step.name}.`
      ]);

      currentIndex++;
      setActiveStepIndex(currentIndex);
      setPipelineProgress(Math.floor((currentIndex / steps.length) * 100));

    }, 1200);
  };

  // Flat array find helper for selected tree node description
  const findNodeDescription = (tree: MonorepoNode, name: string): string => {
    if (tree.name === name) return tree.desc;
    if (tree.children) {
      for (const child of tree.children) {
        const desc = findNodeDescription(child, name);
        if (desc) return desc;
      }
    }
    return "";
  };

  const selectedNodeDesc = findNodeDescription(monorepoTree, selectedNode) || "Select a folder or module in the Monorepo tree to read its physical scope and responsibilities.";

  return (
    <div id="vek-workspace-root" className="space-y-8 pb-10">
      
      {/* Workspace Header Jumbotron */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />
        <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-4xl">
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-purple-950/40 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                ENGINEERING WORKSPACE (SDIP)
              </span>
              <span className="text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-2.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                SPEC-VERSION: 3.1.0
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight uppercase font-mono flex items-center gap-2">
              <Code2 className="w-5 h-5 text-purple-500" />
              VEK 3.1.0 — REPOSITORY ENGINEERING WORKSPACE
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Provides the complete monorepo blueprint, parallel development tracks, major engineering milestones, and continuous integration pipeline required to move the Verifiable Execution Kernel into standard production.
            </p>
          </div>

          <div className="bg-[#09090b] border border-zinc-900 p-3 rounded-lg shrink-0 font-mono text-[10px] text-zinc-500 space-y-1.5 w-full md:w-56">
            <div className="flex justify-between">
              <span>Branch:</span>
              <span className="text-white font-bold flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                master-trust
              </span>
            </div>
            <div className="flex justify-between">
              <span>Environment:</span>
              <span className="text-emerald-400 font-bold uppercase">PROD STAGE</span>
            </div>
            <div className="flex justify-between">
              <span>Commit Status:</span>
              <span className="text-white">Clean</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex border-b border-zinc-900 gap-1 overflow-x-auto pb-px">
        {[
          { id: "structure", label: "Monorepo Structure", icon: FolderOpen },
          { id: "tracks", label: "Parallel Tracks", icon: Activity },
          { id: "milestones", label: "Engineering Milestones", icon: ShieldCheck },
          { id: "pipeline", label: "CI/CD Build Pipeline", icon: Terminal },
          { id: "projects", label: "Suggested GitHub Boards", icon: KanbanSquare }
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

      {/* SUB-TAB 1: MONOREPO TREE */}
      {activeSubTab === "structure" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Interactive Tree View */}
          <div className="lg:col-span-1 bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                Physical Monorepo Tree Explorer
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1 font-sans">
                Explore the proposed multi-crate engineering layout. Click on nodes to inspect their target scope.
              </p>
            </div>

            <div className="border border-zinc-950 rounded-lg p-2.5 bg-black/40 max-h-[460px] overflow-y-auto scrollbar-thin space-y-1">
              {renderTreeNode(monorepoTree)}
            </div>
          </div>

          {/* Node details drawer */}
          <div className="lg:col-span-2">
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 font-mono text-xs h-full flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="border-b border-zinc-900 pb-3">
                  <span className="text-[8px] text-zinc-500 block uppercase font-bold">Selected Node</span>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-tight mt-0.5 flex items-center gap-2">
                    {selectedNode.endsWith(".rs") || selectedNode.endsWith(".ts") ? (
                      <File className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <Folder className="w-4.5 h-4.5 text-purple-400" />
                    )}
                    {selectedNode}
                  </h3>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase block">Component Scope & Responsibilities:</span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-black p-4 rounded-lg border border-zinc-900">
                    {selectedNodeDesc}
                  </p>
                </div>

                {/* Subsystem relations visual card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-black/40 border border-zinc-950 p-3.5 rounded-lg space-y-2">
                    <span className="text-purple-400 font-bold block text-[10px]">Crate Compilation Target</span>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      Ensures absolute decoupling. Every Rust library compiles independently with strict visibility guidelines.
                    </p>
                  </div>
                  <div className="bg-black/40 border border-zinc-950 p-3.5 rounded-lg space-y-2">
                    <span className="text-purple-400 font-bold block text-[10px]">Failsafe Decoupling Rule</span>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      WASM and python targets wrap core Rust binaries to preserve verification logic across language bounds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-950/5 border border-purple-500/10 p-3.5 rounded text-[10px] text-zinc-400 font-sans leading-relaxed mt-6">
                <p className="font-bold font-mono text-white text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Monorepo Isolation Assurance
                </p>
                Structuring GUTS-MASTER-TRUST as a Cargo workspace isolates heavy execution logic (vek-core) from the Web UI console (vek-console) and third-party dependencies.
              </div>

            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: PARALLEL ROADMAP TRACKS */}
      {activeSubTab === "tracks" && (
        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-6 animate-fadeIn font-mono text-xs">
          
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Parallel Development Track Roadmap
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Tracks represent concurrent developer focus pipelines allowing parallel contributions across core libraries, analysis pipelines, and API integrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                id: "A",
                title: "Track A — Core Runtime",
                color: "border-purple-500 text-purple-400",
                bg: "bg-purple-950/10",
                desc: "Focuses on delivering the deterministic virtual machine, constraint gates, replay validators, and STARK proof creators.",
                deliverable: "vek-core, vek-runtime",
                items: ["Boot isolated CPU register frames", "Map memory cycles accurately", "Compile replay drift matching checks"]
              },
              {
                id: "B",
                title: "Track B — Evidence Layer",
                color: "border-blue-500 text-blue-400",
                bg: "bg-blue-950/10",
                desc: "Manages logical claim mapping, compiling claim DAG trees, scoring sources, and generating confidence assess scores.",
                deliverable: "vek-egaf",
                items: ["Extract claims from trace statements", "Enforce cycle-free claim assertions", "Integrate SCADA telemetry link logs"]
              },
              {
                id: "C",
                title: "Track C — Platform Services",
                color: "border-emerald-500 text-emerald-400",
                bg: "bg-emerald-950/10",
                desc: "Scales the platform horizontally. Builds cluster scheduler queues, remote microservice pods, and secure signature modules.",
                deliverable: "execution-service, scheduler-service",
                items: ["Implement multi-tenant scheduler FIFO queue", "Deploy secure HSM microservices", "Configure Cloud Run deployment enclaves"]
              },
              {
                id: "D",
                title: "Track D — Developer Experience",
                color: "border-amber-500 text-amber-400",
                bg: "bg-amber-950/10",
                desc: "Supplies bindings, API references, quickstart kits, and CLI tooling to verify signed bundles locally.",
                deliverable: "vek-cli, sdk/rust, sdk/typescript",
                items: ["Compile interactive standard protocol guide", "Publish Rust sdk/client to crates.io", "Build native CLI checksum verifiers"]
              }
            ].map((track) => (
              <div key={track.id} className={`border rounded-lg p-5 space-y-4 bg-black/20 hover:border-zinc-700 transition-colors`}>
                <div className="flex justify-between items-start border-b border-zinc-900 pb-2.5">
                  <div>
                    <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">{track.title}</h4>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block mt-1">Deliverable: {track.deliverable}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${track.bg} ${track.color.split(" ")[1]}`}>
                    {trackProgress[track.id]}% Complete
                  </span>
                </div>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed">{track.desc}</p>

                <div className="space-y-2">
                  <span className="text-[9px] text-zinc-500 font-bold block uppercase">Core Implementation Goals:</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {track.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[10px] text-zinc-300 bg-black p-2 rounded border border-zinc-900/60">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress bar controller slider */}
                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <div className="flex justify-between text-[9px] text-zinc-500 font-bold">
                    <span>MANUAL PROGRESS OVERRIDE:</span>
                    <span>{trackProgress[track.id]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={trackProgress[track.id]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTrackProgress(prev => ({ ...prev, [track.id]: val }));
                    }}
                    className="w-full accent-purple-500 h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUB-TAB 3: MILESTONES BOARD */}
      {activeSubTab === "milestones" && (
        <div className="space-y-6 animate-fadeIn font-mono text-xs">
          
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Target Engineering Milestone Roadmaps
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Tracks the high-level roadmap checkpoints from absolute foundational schemas up to aerospace and defense sovereign assurance levels.
            </p>
          </div>

          <div className="space-y-4">
            {milestones.map((ms) => (
              <div 
                key={ms.id} 
                className={`border rounded-lg p-5 flex flex-col lg:flex-row justify-between gap-6 transition-all ${
                  ms.status === "completed"
                    ? "bg-emerald-950/5 border-emerald-500/10"
                    : ms.status === "in-progress"
                    ? "bg-purple-950/5 border-purple-500/30 ring-1 ring-purple-500/5"
                    : "bg-black/20 border-zinc-900"
                }`}
              >
                {/* Details col */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-[9px] font-bold">CHECKPOINT {ms.id}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      ms.status === "completed"
                        ? "bg-emerald-950/25 text-emerald-400 border border-emerald-500/10"
                        : ms.status === "in-progress"
                        ? "bg-purple-950/25 text-purple-400 border border-purple-500/25 animate-pulse"
                        : "bg-zinc-950 text-zinc-600 border border-zinc-900"
                    }`}>
                      {ms.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">{ms.name}</h4>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">{ms.desc}</p>
                </div>

                {/* Checklist col */}
                <div className="space-y-2 w-full lg:w-80">
                  <span className="text-[9px] text-zinc-500 font-bold block uppercase">Implementation Checklist:</span>
                  <div className="space-y-1.5">
                    {ms.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[10px] text-zinc-300">
                        {ms.status === "completed" ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        )}
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assertions criteria */}
                <div className="space-y-2 w-full lg:w-80">
                  <span className="text-[9px] text-zinc-500 font-bold block uppercase">Mathematical Assertions:</span>
                  <div className="space-y-1.5">
                    {ms.assertions.map((ast, idx) => (
                      <code key={idx} className="block text-[9px] text-purple-400 bg-black border border-zinc-900/60 p-2 rounded select-all font-mono">
                        {ast}
                      </code>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUB-TAB 4: CI/CD PIPELINE SIMULATOR */}
      {activeSubTab === "pipeline" && (
        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-6 animate-fadeIn font-mono text-xs">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Continuous Integration & Deployment Pipeline
              </h3>
              <p className="text-[10px] text-zinc-500">
                Simulates real-time compilation, testing, and VEP verification runs before declaring safe deployment release candidates.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Failure Injector */}
              <label className="flex items-center gap-1.5 cursor-pointer bg-black border border-zinc-900 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase">
                <input
                  type="checkbox"
                  checked={injectCiFailure}
                  onChange={(e) => setInjectCiFailure(e.target.checked)}
                  className="accent-red-500"
                />
                <span className={injectCiFailure ? "text-red-400" : "text-zinc-500"}>Inject Replay Fault</span>
              </label>

              <button
                onClick={runCiPipeline}
                disabled={pipelineState === "running"}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold px-4 py-2 rounded text-[11px] uppercase tracking-wider transition flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${pipelineState === "running" ? "animate-spin" : ""}`} />
                <span>{pipelineState === "running" ? "Running Checks..." : "Push Git Commit & Run"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Input params */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-black border border-zinc-900 p-4 rounded-lg space-y-3">
                <span className="text-[8px] text-zinc-500 font-bold block uppercase">Git Commit Parameter</span>
                
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-bold block text-[9px]">COMMIT MESSAGE MESSAGE:</label>
                  <textarea
                    rows={3}
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="w-full bg-[#0a0a0d] border border-zinc-800 rounded p-2 text-zinc-200 outline-none focus:border-purple-500 text-[10px] resize-none"
                    placeholder="Enter commit tag..."
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-sans leading-normal">
                  <GitCommit className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Targets Master-Trust secure enclave branch automatically.</span>
                </div>
              </div>

              {/* Progress visual */}
              {pipelineState !== "idle" && (
                <div className="bg-black border border-zinc-900 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-zinc-400">PIPELINE EXECUTION PROGRESS:</span>
                    <span className="text-purple-400">{pipelineProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${pipelineState === "failed" ? "bg-red-500" : "bg-purple-500"}`}
                      initial={{ width: "0%" }}
                      animate={{ width: `${pipelineProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stage Stepper list */}
            <div className="md:col-span-2 space-y-4">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  "Format Check", "Lint", "Unit Tests", "Integration Tests",
                  "Replay Tests", "Schema Validation", "Documentation Build", "Release Candidate"
                ].map((step, idx) => {
                  const isSucceeded = activeStepIndex > idx && pipelineState !== "failed";
                  const isCurrent = activeStepIndex === idx && pipelineState === "running";
                  const isFailed = pipelineState === "failed" && activeStepIndex === idx;

                  return (
                    <div 
                      key={step} 
                      className={`p-2.5 border rounded-lg transition-all flex flex-col justify-between h-16 ${
                        isSucceeded 
                          ? "bg-emerald-950/10 border-emerald-500/10 text-emerald-400"
                          : isCurrent
                          ? "bg-purple-950/15 border-purple-500 text-purple-400 shadow animate-pulse"
                          : isFailed
                          ? "bg-red-950/10 border-red-500 text-red-400"
                          : "bg-black border-zinc-900 text-zinc-600"
                      }`}
                    >
                      <span className="text-[8px] font-bold block">STEP {idx + 1}</span>
                      <span className="font-extrabold text-[9px] block truncate uppercase tracking-wider">{step}</span>
                    </div>
                  );
                })}
              </div>

              {/* Logs output */}
              <div className="bg-[#050507] border border-zinc-950 p-4 rounded-lg space-y-1.5 h-56 overflow-y-auto scrollbar-thin">
                {pipelineLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-1.5 text-[9px]">
                    <span className="text-zinc-600 font-bold shrink-0">&gt;</span>
                    <span className={
                      log.includes("[FAIL]") || log.includes("[CRITICAL_EXIT]")
                        ? "text-red-400 font-bold" 
                        : log.includes("[SUCCESS]") || log.includes("[RC_RELEASE]")
                        ? "text-emerald-400 font-bold" 
                        : "text-zinc-300"
                    }>
                      {log}
                    </span>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 5: SUGGESTED GITHUB PROJECTS */}
      {activeSubTab === "projects" && (
        <div className="space-y-6 animate-fadeIn font-mono text-xs">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-3">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                VEK Platform Core Boards
              </h3>
              <p className="text-[10px] text-zinc-500">
                Maps developmental project cards across active project milestones. Select boards to inspect progress.
              </p>
            </div>

            {/* Board switcher */}
            <div className="flex bg-black border border-zinc-900 rounded p-1 text-[10px] shrink-0 font-mono">
              {["Kernel", "EGAF", "Platform", "Developer Tools", "Verification"].map((board) => (
                <button
                  key={board}
                  onClick={() => setSelectedBoard(board as any)}
                  className={`px-3 py-1.5 rounded uppercase font-bold transition-all ${
                    selectedBoard === board
                      ? "bg-purple-950/20 text-purple-400 border border-purple-500/20"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {board}
                </button>
              ))}
            </div>
          </div>

          {/* Kanban board layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* TODO Col */}
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-4 space-y-3 flex flex-col min-h-[380px]">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="text-zinc-400 font-extrabold uppercase text-[10px]">Backlog / To Do</span>
                <span className="text-[9px] bg-zinc-900 text-zinc-500 px-1.5 rounded font-bold">
                  {getFilteredTasks().filter(t => t.status === "todo").length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[420px] pr-1.5 scrollbar-thin">
                {getFilteredTasks().filter(t => t.status === "todo").map((task) => (
                  <div key={task.id} className="bg-black border border-zinc-950 p-3.5 rounded-lg space-y-2 hover:border-zinc-800 transition-colors">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-zinc-500 font-bold">{task.id}</span>
                      <span className="text-zinc-400 font-bold">{task.assignee}</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">{task.title}</p>
                    
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-zinc-900/60 justify-between items-center">
                      <div className="flex gap-1">
                        {task.labels.map(l => (
                          <span key={l} className="text-[8px] bg-zinc-900 text-zinc-500 px-1 py-0.5 rounded uppercase font-bold">{l}</span>
                        ))}
                      </div>
                      <button 
                        onClick={() => moveTask(task.id, "doing")}
                        className="text-[8px] text-purple-400 font-bold hover:text-purple-300 uppercase shrink-0"
                      >
                        Start &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DOING Col */}
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-4 space-y-3 flex flex-col min-h-[380px]">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="text-purple-400 font-extrabold uppercase text-[10px]">Active In-Progress</span>
                <span className="text-[9px] bg-purple-950/20 text-purple-400 px-1.5 rounded font-bold">
                  {getFilteredTasks().filter(t => t.status === "doing").length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[420px] pr-1.5 scrollbar-thin">
                {getFilteredTasks().filter(t => t.status === "doing").map((task) => (
                  <div key={task.id} className="bg-black border border-purple-950/10 p-3.5 rounded-lg space-y-2 border-zinc-950 hover:border-zinc-800 transition-colors">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-purple-400 font-bold">{task.id}</span>
                      <span className="text-zinc-400 font-bold">{task.assignee}</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">{task.title}</p>
                    
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-zinc-900/60 justify-between items-center">
                      <div className="flex gap-1">
                        {task.labels.map(l => (
                          <span key={l} className="text-[8px] bg-zinc-900 text-zinc-500 px-1 py-0.5 rounded uppercase font-bold">{l}</span>
                        ))}
                      </div>
                      <button 
                        onClick={() => moveTask(task.id, "done")}
                        className="text-[8px] text-emerald-400 font-bold hover:text-emerald-300 uppercase shrink-0"
                      >
                        Complete &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DONE Col */}
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-4 space-y-3 flex flex-col min-h-[380px]">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="text-emerald-400 font-extrabold uppercase text-[10px]">Completed Tasks</span>
                <span className="text-[9px] bg-emerald-950/20 text-emerald-400 px-1.5 rounded font-bold">
                  {getFilteredTasks().filter(t => t.status === "done").length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[420px] pr-1.5 scrollbar-thin">
                {getFilteredTasks().filter(t => t.status === "done").map((task) => (
                  <div key={task.id} className="bg-black border border-zinc-950 p-3.5 rounded-lg space-y-2 opacity-65 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-emerald-500 font-bold">{task.id}</span>
                      <span className="text-zinc-500 font-bold">{task.assignee}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed line-through">{task.title}</p>
                    
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-zinc-900/60 justify-between items-center">
                      <div className="flex gap-1">
                        {task.labels.map(l => (
                          <span key={l} className="text-[8px] bg-zinc-900 text-zinc-500 px-1 py-0.5 rounded uppercase font-bold">{l}</span>
                        ))}
                      </div>
                      <span className="text-[8px] text-emerald-400 font-bold uppercase shrink-0">Closed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* System Logs console */}
      {systemLogs.length > 0 && (
        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 font-mono text-xs space-y-3">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Live Workspace Handshake Terminal</span>
          <div className="bg-black border border-zinc-950 rounded-lg p-3 text-[10px] text-zinc-400 space-y-1 h-32 overflow-y-auto scrollbar-thin">
            {systemLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-zinc-600 font-bold shrink-0">&gt;</span>
                <span className={log.includes("[FAIL]") ? "text-red-400 font-bold" : log.includes("[SUCCESS]") || log.includes("[RC_RELEASE]") || log.includes("[KANBAN_PROJECTS]") ? "text-purple-400 font-bold" : "text-zinc-300"}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
