import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Network, Send, CheckCircle, ShieldAlert, Cpu, Terminal, 
  Key, Layers, Sliders, Play, RotateCcw, Copy, Check, FileCode,
  ArrowRight, Activity, HelpCircle, Sparkles, MessageSquareCode, Radio, HelpCircle as HelpIcon
} from "lucide-react";

interface ProtocolProps {}

interface ProtocolMessage {
  protocol_version: string;
  message_id: string;
  timestamp: string;
  message_type: string;
  payload: any;
  signature: {
    algorithm: string;
    public_key: string;
    hash: string;
    signature_bytes: string;
  };
}

export default function Protocol({}: ProtocolProps) {
  const [selectedMsgType, setSelectedMsgType] = useState<string>("ExecutionRequest");
  const [activeTab, setActiveTab] = useState<"envelope" | "lifecycle" | "negotiation" | "extensions" | "stack" | "verification-suite">("envelope");
  
  // RFC-001 Verification Suite interactive states
  const [selectedEpoFile, setSelectedEpoFile] = useState<"uas_nominal" | "defi_nominal" | "tampered_route">("uas_nominal");
  const [cliRunning, setCliRunning] = useState<boolean>(false);
  const [cliOutput, setCliOutput] = useState<string[]>([]);
  const [selectedSchemaFile, setSelectedSchemaFile] = useState<"epo_v1" | "epo_v2" | "trace_v1" | "seal_v1">("epo_v2");
  const [harnessRunning, setHarnessRunning] = useState<boolean>(false);
  const [harnessProgress, setHarnessProgress] = useState<number>(0);
  const [harnessReport, setHarnessReport] = useState<any | null>(null);
  const [harnessLog, setHarnessLog] = useState<string[]>([]);

  
  // Signature status states
  const [copied, setCopied] = useState<boolean>(false);
  const [verificationState, setVerificationState] = useState<"unverified" | "verifying" | "valid" | "tampered">("unverified");
  const [tamperedPayload, setTamperedPayload] = useState<boolean>(false);

  // Version negotiation states
  const [consoleVersions, setConsoleVersions] = useState<string>("v2.5, v2.4, v2.3");
  const [runtimeVersions, setRuntimeVersions] = useState<string>("v2.5, v2.4, v2.0");
  const [negotiatedVersion, setNegotiatedVersion] = useState<string | null>(null);
  const [negotiationLog, setNegotiationLog] = useState<string[]>([]);
  const [isNegotiating, setIsNegotiating] = useState<boolean>(false);

  // State Machine Timeline Simulator states
  const [lifecycleState, setLifecycleState] = useState<"REQUESTED" | "ACCEPTED" | "QUEUED" | "RUNNING" | "VERIFYING" | "REPLAYING" | "EVALUATING" | "ASSEMBLING" | "SIGNING" | "COMPLETED" | "IDLE">("IDLE");
  const [lifecycleLog, setLifecycleLog] = useState<string[]>([]);
  const [isLifecycleSimulating, setIsLifecycleSimulating] = useState<boolean>(false);

  // Custom Extension namespace states
  const [extensions, setExtensions] = useState<Array<{ key: string; name: string; type: string; desc: string }>>([
    { key: "ext_quantum_engine", name: "Quantum Rig Replay Engine", type: "Compute Extension", desc: "Allows simulation running on dual-phase trapped-ion simulators." },
    { key: "ext_medical_dosage", name: "FDA Infusion Rule Gate", type: "Validator", desc: "Asserts flow-rate constraints directly inside state-transition boundaries." },
    { key: "ext_scada_modbus", name: "Sub-Cycle Power Line Modbus Parser", type: "Evidence Linker", desc: "Injects hardware telemetry checks into verification claim graphs." }
  ]);
  const [newExtKey, setNewExtKey] = useState<string>("");
  const [newExtName, setNewExtName] = useState<string>("");
  const [newExtType, setNewExtType] = useState<string>("Compute Extension");
  const [newExtDesc, setNewExtDesc] = useState<string>("");

  // Sample payloads based on selected type
  const getPayloadSample = (type: string) => {
    const rawPayload = tamperedPayload ? { _warning_tamper: "payload altered by adversarial proxy node" } : {};
    
    switch (type) {
      case "ExecutionRequest":
        return {
          ...rawPayload,
          candidate_id: "CANDIDATE-802",
          entry_point: "vek_main::execute",
          inputs: {
            telemetry_vector: [1.025, 0.994, 2.001],
            altitude_limit_ft: 400.0,
            execution_timeout_ms: 1500
          },
          reproducibility_seed: 489201552,
          caller_identity: "vek-client-0x28f9c"
        };
      case "ExecutionAccepted":
        return {
          ...rawPayload,
          request_id: "REQ-99411",
          allocated_thread_id: "VEK-VM-CORE-3",
          state_space_bytes: 1048576,
          scheduled_timestamp: new Date().toISOString()
        };
      case "ExecutionStarted":
        return {
          ...rawPayload,
          thread_id: "VEK-VM-CORE-3",
          instruction_pointer: "0x00410",
          initial_register_state: {
            rax: "0x0",
            rip: "0x4002fa",
            rsp: "0x7ffd9"
          }
        };
      case "ExecutionProgress":
        return {
          ...rawPayload,
          instruction_count: 554102,
          current_stage: "VM_STAGE_REPLAY",
          active_constraints: 4,
          violations_flag: false
        };
      case "ExecutionCompleted":
        return {
          ...rawPayload,
          exit_code: 0,
          cycles_consumed: 1248011,
          output_state_digest: "0xDE7C88E299FF",
          execution_proof_ref: "PROOF-HASH-0x45BB"
        };
      case "ExecutionProof":
        return {
          ...rawPayload,
          proof_type: "STARK-FRI-VEK",
          commitment_root: "0x7e88b2201fa002e",
          witness_length: 44102,
          evaluation_points: [
            "0x55a1e2bf",
            "0x8e92a012"
          ]
        };
      case "ReplayVerification":
        return {
          ...rawPayload,
          target_proof_id: "PROOF-HASH-0x45BB",
          original_state_hash: "0xDE7C88E299FF",
          replay_state_hash: "0xDE7C88E299FF",
          reproduced_determinism: true,
          clock_skew_ms: 0.00
        };
      case "ConstraintReport":
        return {
          ...rawPayload,
          monitored_boundaries: [
            { id: "ALT-CEIL", limit: 400.0, current_max: 391.2, violated: false },
            { id: "TEMP-GUARD", limit: 85.0, current_max: 62.4, violated: false }
          ],
          system_safe_state: true
        };
      case "ClaimGraph":
        return {
          ...rawPayload,
          claims: [
            { id: "C-01", statement: "Execution matches zero-drift replay bounds", supports: ["E-01"] },
            { id: "C-02", statement: "Sensor drift did not trigger override thresholds", supports: ["E-02"] }
          ],
          is_acyclic: true
        };
      case "EvidenceReport":
        return {
          ...rawPayload,
          evidence_sources: [
            { id: "E-01", type: "REPLAY_LOG", strength: 0.99, source_url: "ledger://replay/55102" },
            { id: "E-02", type: "SCADA_MODBUS_DUMP", strength: 0.85, source_url: "modbus://rtu-node-12" }
          ],
          evaluator_id: "EGAF-ANALYZER-ALPHA"
        };
      case "ConfidenceReport":
        return {
          ...rawPayload,
          aggregate_confidence: 0.965,
          factual_support_index: 0.98,
          judgment_factor: 0.02,
          consensus_match: true
        };
      case "AuditBundle":
        return {
          ...rawPayload,
          bundle_hash: "0xBC889A120FFA",
          input_hash: "0x882AFA",
          proof_hash: "0x7e88b2201",
          egaf_analysis_hash: "0x33A0B11"
        };
      case "IntegrityVerification":
        return {
          ...rawPayload,
          verification_ledger_ref: "0x82af910bba1",
          public_verification_endpoint: "https://ledger.vek-protocol.org/verify/99411",
          signatures_valid: true
        };
      case "ErrorReport":
      default:
        return {
          ...rawPayload,
          error_code: "CRITICAL_DRIFT_DETECTED",
          faulting_module: "VEK_REPLAY_ENGINE",
          severity: "HAZARDOUS",
          description: "Execution state diverged on floating-point register RAX during step 44021. Non-deterministic replay detected."
        };
    }
  };

  // Compile full envelope
  const getCompiledEnvelope = (): ProtocolMessage => {
    const payload = getPayloadSample(selectedMsgType);
    const payloadString = JSON.stringify(payload);
    
    // Simulate high-fidelity hashing (Ed25519 signature scheme simulation)
    const mockHash = "0x" + Array.from(payloadString)
      .reduce((hash, char) => (hash * 33 + char.charCodeAt(0)) & 0xffffffffffff, 5381)
      .toString(16)
      .toUpperCase();

    const mockSignature = "0xSIG_" + Array.from(mockHash + "VEK_PRIVATE_KEY")
      .reduce((hash, char) => (hash * 17 + char.charCodeAt(0)) & 0xffffffffffffffff, 12345)
      .toString(16)
      .toUpperCase();

    return {
      protocol_version: "vep-2.5.0",
      message_id: `msg_id_${selectedMsgType.toLowerCase()}_${Math.floor(Math.random() * 90000) + 10000}`,
      timestamp: new Date().toISOString(),
      message_type: selectedMsgType,
      payload,
      signature: {
        algorithm: "ED25519-SHA512-VEK-SECURE",
        public_key: "0xPUB_KEY_ED25519_FIPS_140_3_AUTHORIZED",
        hash: mockHash,
        signature_bytes: mockSignature
      }
    };
  };

  const compiledMsg = getCompiledEnvelope();

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(compiledMsg, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifySignature = () => {
    setVerificationState("verifying");
    setTimeout(() => {
      if (tamperedPayload) {
        setVerificationState("tampered");
      } else {
        setVerificationState("valid");
      }
    }, 800);
  };

  // Version Negotiation Simulator
  const handleNegotiate = () => {
    if (isNegotiating) return;
    setIsNegotiating(true);
    setNegotiatedVersion(null);
    setNegotiationLog(["[HANDSHAKE] Initializing client/server VEP version negotiation."]);

    setTimeout(() => {
      const clientList = consoleVersions.split(",").map(v => v.trim());
      const serverList = runtimeVersions.split(",").map(v => v.trim());

      setNegotiationLog(prev => [
        ...prev,
        `[CLIENT_HELLO] Console offering VEP supported versions: [${clientList.join(", ")}]`,
        `[SERVER_HELLO] Runtime advertising supported versions: [${serverList.join(", ")}]`
      ]);

      setTimeout(() => {
        // Find highest match
        const match = clientList.find(v => serverList.includes(v));

        if (match) {
          setNegotiatedVersion(match);
          setNegotiationLog(prev => [
            ...prev,
            `[MATCH] Found common VEP dialect match: ${match}`,
            `[READY] Session protocol initialized successfully on ${match} standard.`
          ]);
        } else {
          setNegotiatedVersion("REJECTED");
          setNegotiationLog(prev => [
            ...prev,
            `[ERROR] Negotiation failed. No common protocol dialect found. Terminating link.`
          ]);
        }
        setIsNegotiating(false);
      }, 800);
    }, 600);
  };

  // Lifecycle Progression Simulator
  const triggerLifecycleSimulation = () => {
    if (isLifecycleSimulating) return;
    setIsLifecycleSimulating(true);
    
    const sequence: Array<typeof lifecycleState> = [
      "REQUESTED", "ACCEPTED", "QUEUED", "RUNNING", 
      "VERIFYING", "REPLAYING", "EVALUATING", "ASSEMBLING", 
      "SIGNING", "COMPLETED"
    ];

    let currentIdx = 0;
    setLifecycleState("REQUESTED");
    setLifecycleLog(["[PROTOCOL_FLOW] Handshaking initiated."]);

    const interval = setInterval(() => {
      if (currentIdx >= sequence.length - 1) {
        clearInterval(interval);
        setLifecycleState("COMPLETED");
        setLifecycleLog(prev => [...prev, "[COMPLETED] Verifiable Execution Protocol completed lifecycle state traversal. Signed Audit Bundle dispatched to distributed ledgers."]);
        setIsLifecycleSimulating(false);
        return;
      }

      currentIdx++;
      const nextState = sequence[currentIdx];
      setLifecycleState(nextState);

      // Custom logs based on transition state
      let logMsg = `[TRANSIT] Lifecycle entered state: ${nextState}`;
      if (nextState === "ACCEPTED") logMsg = "[ACCEPTED] Core thread allocated. VM memory space initialized.";
      if (nextState === "QUEUED") logMsg = "[QUEUED] Telemetry workload appended to physical execution queue.";
      if (nextState === "RUNNING") logMsg = "[RUNNING] Isolated VM executing telemetry registers.";
      if (nextState === "VERIFYING") logMsg = "[VERIFYING] Replay engine spinning duplicate VM state container.";
      if (nextState === "REPLAYING") logMsg = "[REPLAYING] Replaying original instruction stack. Asserting deterministic registers.";
      if (nextState === "EVALUATING") logMsg = "[EVALUATING] EGAF evaluating claim graph. Parsing evidence strength logs.";
      if (nextState === "ASSEMBLING") logMsg = "[ASSEMBLING] Compiling cryptographically bound audit package.";
      if (nextState === "SIGNING") logMsg = "[SIGNING] Sending bundle to Hardware Security Module (HSM). Applying digital signatures.";

      setLifecycleLog(prev => [...prev, logMsg]);
    }, 600);
  };

  const handleRegisterExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExtKey.trim() || !newExtName.trim()) return;

    setExtensions(prev => [
      ...prev,
      {
        key: newExtKey.trim(),
        name: newExtName.trim(),
        type: newExtType,
        desc: newExtDesc || "No description provided."
      }
    ]);

    setNewExtKey("");
    setNewExtName("");
    setNewExtDesc("");
  };

  return (
    <div id="vek-protocol-suite-panel" className="space-y-8 pb-10">
      
      {/* Protocol Jumbotron Banner */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-500" />
        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-4xl">
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                VERIFIABLE EXECUTION PROTOCOL (VEP)
              </span>
              <span className="text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-2.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                SPEC-VERSION: 2.5.0
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight uppercase font-mono flex items-center gap-2">
              <Network className="w-5 h-5 text-emerald-500" />
              VEK 2.5.0 — VERIFIABLE EXECUTION PROTOCOL
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Defines the standardized communication protocol layer (<span className="text-white font-semibold">VEP</span>) establishing clear contracts, message schemas, and version handshakes across the Console, Runtime, EGAF Engines, and distributed secure clusters.
            </p>
          </div>

          {/* Core Protocol Stats */}
          <div className="bg-[#09090b] border border-zinc-900 p-3 rounded-lg shrink-0 font-mono text-[10px] text-zinc-500 space-y-1.5 w-full md:w-56">
            <div className="flex justify-between">
              <span>Standard Dialect:</span>
              <span className="text-white font-bold">vep-2.5.0</span>
            </div>
            <div className="flex justify-between">
              <span>Hash Engine:</span>
              <span className="text-white">SHA-512</span>
            </div>
            <div className="flex justify-between">
              <span>Signature:</span>
              <span className="text-emerald-400 font-bold">Ed25519</span>
            </div>
            <div className="flex justify-between">
              <span>Encryption Mode:</span>
              <span className="text-white">FIPS 140-3 Safe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Sub-Tabs Navigation */}
      <div className="flex border-b border-zinc-900 gap-1 overflow-x-auto pb-px">
        {[
          { id: "envelope", label: "Message Envelopes", icon: MessageSquareCode },
          { id: "lifecycle", label: "Protocol Lifecycles", icon: Activity },
          { id: "negotiation", label: "Version Handshakes", icon: Radio },
          { id: "extensions", label: "Protocol Extensions", icon: Sliders },
          { id: "stack", label: "Architectural Layers", icon: Layers },
          { id: "verification-suite", label: "RFC-001 Trust boundaries", icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold font-mono tracking-wider uppercase border-b-2 transition-all shrink-0 ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-400 bg-emerald-950/5"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: MESSAGE ENVELOPES */}
      {activeTab === "envelope" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Message selector side pane */}
          <div className="lg:col-span-1 bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                VEP Message Type Library
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1 font-sans">
                Every packet exchanged across the VEK network must conform to a strictly versioned, signed schema.
              </p>
            </div>

            <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
              {[
                { type: "ExecutionRequest", desc: "User payload to begin virtual core trace execution" },
                { type: "ExecutionAccepted", desc: "Runtime response confirming thread allocation" },
                { type: "ExecutionStarted", desc: "VM telemetry broadcast upon starting instruction cycles" },
                { type: "ExecutionProgress", desc: "Incremental status updates showing cycles and steps" },
                { type: "ExecutionCompleted", desc: "Post-exit VM values, hashes, and registers" },
                { type: "ExecutionProof", desc: "STARK/FRI witness structures for execution proofing" },
                { type: "ReplayVerification", desc: "Determinism check validating drift margins" },
                { type: "ConstraintReport", desc: "Policy bounds log asserting safety thresholds" },
                { type: "ClaimGraph", desc: "Claim nodes mapping relationships for EGAF inputs" },
                { type: "EvidenceReport", desc: "Source credibility scores compiled by analyzers" },
                { type: "ConfidenceReport", desc: "Consensus assessment indices and judgment offsets" },
                { type: "AuditBundle", desc: "Cryptographically bound state package for archives" },
                { type: "IntegrityVerification", desc: "Distributed ledger references checking audits" },
                { type: "ErrorReport", desc: "Failure boundaries or critical VM registers drift" }
              ].map((m) => (
                <button
                  key={m.type}
                  onClick={() => {
                    setSelectedMsgType(m.type);
                    setVerificationState("unverified");
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border font-mono text-xs transition-all ${
                    selectedMsgType === m.type
                      ? "bg-emerald-950/10 border-emerald-500 text-emerald-400"
                      : "bg-black border-zinc-900 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span className="font-bold block">{m.type}</span>
                  <span className="text-[9px] text-zinc-500 font-sans block mt-0.5 leading-snug">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive JSON Visualizer */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4">
              
              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3.5">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4.5 h-4.5 text-emerald-500" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                      {selectedMsgType} Envelope Scheme
                    </h3>
                    <p className="text-[9px] font-mono text-zinc-500 mt-0.5">
                      FIPS-140-3 digital envelope formatting
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Tamper Button */}
                  <label className="flex items-center gap-1.5 cursor-pointer bg-black border border-zinc-900 px-2 py-1 rounded text-[9px] font-mono font-bold uppercase">
                    <input
                      type="checkbox"
                      checked={tamperedPayload}
                      onChange={(e) => {
                        setTamperedPayload(e.target.checked);
                        setVerificationState("unverified");
                      }}
                      className="accent-red-500"
                    />
                    <span className={tamperedPayload ? "text-red-400" : "text-zinc-500"}>Simulate Tamper</span>
                  </label>

                  {/* Verify button */}
                  <button
                    onClick={verifySignature}
                    disabled={verificationState === "verifying"}
                    className="text-[9px] font-mono px-2.5 py-1.5 bg-emerald-950/30 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-950/50 transition-all flex items-center gap-1 uppercase"
                  >
                    <Key className={`w-3.5 h-3.5 ${verificationState === "verifying" ? "animate-spin" : ""}`} />
                    <span>Verify Packet Signature</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition"
                    title="Copy Full Schema Envelope JSON"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Dynamic verification state alert */}
              {verificationState !== "unverified" && (
                <div className={`p-3 border rounded text-xs font-mono transition-all ${
                  verificationState === "verifying"
                    ? "bg-blue-950/10 border-blue-500/20 text-blue-400 animate-pulse"
                    : verificationState === "valid"
                    ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-400"
                    : "bg-red-950/10 border-red-500/20 text-red-400"
                }`}>
                  {verificationState === "verifying" && (
                    <p className="flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-blue-400 animate-pulse shrink-0" />
                      <span>DECRYPTING ENVELOPE: Running Ed25519 hash verify over protocol message bounds...</span>
                    </p>
                  )}
                  {verificationState === "valid" && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold uppercase text-[10px]">SIGNATURE VALIDATED</p>
                        <p className="text-[9px] mt-0.5 text-zinc-500">
                          The message matches the cryptographic hash signature generated by authorized key node (Authorized FIPS HSM). Replay and state authenticity are fully guaranteed.
                        </p>
                      </div>
                    </div>
                  )}
                  {verificationState === "tampered" && (
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold uppercase text-[10px] text-red-400">CRYPTOGRAPHIC VERIFICATION FAULT</p>
                        <p className="text-[9px] mt-0.5 text-zinc-500">
                          The message body hash did not match the decrypted cryptographic signature. The payload has been modified by an adversarial or unstable system node. Transaction dropped.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Envelope JSON view */}
              <div className="bg-[#070709] border border-zinc-950 rounded p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[420px] scrollbar-thin select-all">
                <pre>{JSON.stringify(compiledMsg, null, 2)}</pre>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: PROTOCOL LIFECYCLE PROGRESSION */}
      {activeTab === "lifecycle" && (
        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-6 animate-fadeIn">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                VEP Executable State progressions
              </h3>
              <p className="text-[10px] text-zinc-500">
                Presents the life transitions of a transaction as it passes through consensus, duplicate execution replay, and audit signing.
              </p>
            </div>

            <button
              onClick={triggerLifecycleSimulation}
              disabled={isLifecycleSimulating}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold rounded uppercase tracking-wider transition flex items-center gap-1.5 shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate Protocol Trace</span>
            </button>
          </div>

          {/* Stepper Grid layout */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {[
              { state: "REQUESTED", label: "Requested", desc: "Payload accepted into queue" },
              { state: "ACCEPTED", label: "Accepted", desc: "VM registers allocated" },
              { state: "QUEUED", label: "Queued", desc: "Awaiting thread cycle" },
              { state: "RUNNING", label: "Running", desc: "Active instructions running" },
              { state: "VERIFYING", label: "Verifying", desc: "Replay engine initialized" },
              { state: "REPLAYING", label: "Replaying", desc: "Determinism check spinning" },
              { state: "EVALUATING", label: "Evaluating", desc: "EGAF parsing claim graph" },
              { state: "ASSEMBLING", label: "Assembling", desc: "Compiling audit payload" },
              { state: "SIGNING", label: "Signing", desc: "HSM private key locked" },
              { state: "COMPLETED", label: "Completed", desc: "Signed audit bundle ledgered" }
            ].map((step, idx) => {
              const isActive = lifecycleState === step.state;
              const isPassed = isLifecycleSimulating && (
                ["REQUESTED", "ACCEPTED", "QUEUED", "RUNNING", "VERIFYING", "REPLAYING", "EVALUATING", "ASSEMBLING", "SIGNING", "COMPLETED"]
                  .indexOf(lifecycleState) >= idx
              );

              return (
                <div 
                  key={idx}
                  className={`border rounded-lg p-3 font-mono text-xs space-y-1 transition-all ${
                    isActive
                      ? "bg-emerald-950/20 border-emerald-500 text-emerald-400 shadow-lg ring-1 ring-emerald-500/10"
                      : isPassed
                      ? "bg-zinc-950 border-emerald-500/10 text-emerald-500/70"
                      : "bg-black border-zinc-900 text-zinc-600"
                  }`}
                >
                  <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500">
                    <span>STEP {idx + 1}</span>
                    {isActive && <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />}
                    {isPassed && !isActive && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <h4 className={`font-bold block uppercase tracking-wider ${isActive ? "text-white" : ""}`}>{step.label}</h4>
                  <p className="text-[9px] text-zinc-500 leading-snug">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Interactive Logs Console */}
          {lifecycleLog.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Live VEP Cluster Handshake Terminal</span>
              <div className="bg-black border border-zinc-900 rounded-lg p-4 font-mono text-[10px] text-zinc-400 space-y-1.5 h-44 overflow-y-auto scrollbar-thin">
                {lifecycleLog.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-zinc-600 font-bold shrink-0">&gt;</span>
                    <span className={log.includes("[COMPLETED]") || log.includes("[SUCCESS]") ? "text-emerald-400 font-bold" : "text-zinc-300"}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 3: VERSION NEGOTIATION HANDSHAKE */}
      {activeTab === "negotiation" && (
        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-6 animate-fadeIn">
          
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
              Dynamic Dialect Version Negotiation
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              VEP enforces strict dialect compatibility matching. Host peers negotiate common features prior to dispatching workload instructions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input params */}
            <div className="space-y-4">
              <div className="bg-black border border-zinc-900 p-4 rounded-lg space-y-3 font-mono text-xs">
                <span className="text-[9px] text-zinc-500 font-bold uppercase block">Handshake Input Schemes</span>
                
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-bold block text-[10px]">CONSOLE SUPPORTED DIALECTS:</label>
                  <input
                    type="text"
                    value={consoleVersions}
                    onChange={(e) => setConsoleVersions(e.target.value)}
                    className="w-full bg-[#0a0a0d] border border-zinc-800 rounded p-2 text-zinc-200 outline-none focus:border-emerald-500"
                    placeholder="e.g. v2.5, v2.4"
                  />
                  <span className="text-[9px] text-zinc-600 block leading-normal">
                    Enter versions Console advertises during Client Hello (comma-separated).
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-bold block text-[10px]">RUNTIME HOST SUPPORTED DIALECTS:</label>
                  <input
                    type="text"
                    value={runtimeVersions}
                    onChange={(e) => setRuntimeVersions(e.target.value)}
                    className="w-full bg-[#0a0a0d] border border-zinc-800 rounded p-2 text-zinc-200 outline-none focus:border-emerald-500"
                    placeholder="e.g. v2.5, v2.4, v2.0"
                  />
                  <span className="text-[9px] text-zinc-600 block leading-normal">
                    Enter versions the physical verification cluster supports.
                  </span>
                </div>

                <button
                  onClick={handleNegotiate}
                  disabled={isNegotiating}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-bold py-2 rounded text-xs transition uppercase tracking-wider"
                >
                  {isNegotiating ? "Negotiating Dialect..." : "Initiate Protocol Handshake"}
                </button>
              </div>
            </div>

            {/* Results Console */}
            <div className="space-y-4">
              <div className="bg-black border border-zinc-900 p-4 rounded-lg space-y-3 font-mono text-xs flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase block">Negotiation Outcome</span>

                  {negotiatedVersion && (
                    <div className={`p-4 border rounded-lg flex items-start gap-2.5 transition-all ${
                      negotiatedVersion === "REJECTED"
                        ? "bg-red-950/10 border-red-500/20 text-red-400"
                        : "bg-emerald-950/15 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {negotiatedVersion === "REJECTED" ? (
                        <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      <div>
                        <p className="font-extrabold text-[11px] uppercase">
                          {negotiatedVersion === "REJECTED" ? "HANDSHAKE REJECTED" : "NEGOTIATED PROTOCOL ESTABLISHED"}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-normal font-sans">
                          {negotiatedVersion === "REJECTED" 
                            ? "No matching execution protocols discovered between peers. Safe connection terminated instantly." 
                            : `The node handshake established an active communication channel using standard v${negotiatedVersion}. VEP packet structures activated.`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-[9px] text-zinc-500 font-bold block uppercase">Live Handshake Registers:</span>
                    <div className="bg-[#0a0a0d] border border-zinc-950 rounded p-3 text-[9px] text-zinc-400 space-y-1.5 h-32 overflow-y-auto scrollbar-thin">
                      {negotiationLog.length === 0 ? (
                        <span className="text-zinc-600 italic">No handshakes simulated yet. Click 'Initiate Protocol Handshake'.</span>
                      ) : (
                        negotiationLog.map((log, idx) => (
                          <div key={idx} className="flex gap-1">
                            <span className="text-zinc-600 font-bold shrink-0">&gt;</span>
                            <span className={log.includes("[MATCH]") ? "text-emerald-400 font-bold" : "text-zinc-300"}>{log}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-[9px] text-zinc-600 leading-normal border-t border-zinc-900 pt-2 font-sans">
                  * Note: VEP backwards compatibility safeguards require falling back to highest mutually agreeable major release or executing connection rejection loops.
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 4: PROTOCOL EXTENSION POINTS */}
      {activeTab === "extensions" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Extension points list */}
          <div className="lg:col-span-2 bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                Active Protocol Extension Registry
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1 font-sans">
                VEP maintains isolated namespace blocks for custom execution parameters without modifying core integrity schemas or hashing invariants.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {extensions.map((ext) => (
                <div key={ext.key} className="bg-black border border-zinc-900 p-3.5 rounded-lg flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded font-bold uppercase">
                        {ext.key}
                      </span>
                      <span className="text-[9px] text-emerald-400 bg-emerald-950/10 border border-emerald-500/10 px-2 py-0.5 rounded font-bold uppercase">
                        {ext.type}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-200 mt-1.5">{ext.name}</h4>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{ext.desc}</p>
                  </div>

                  <span className="text-[8px] text-blue-400 bg-blue-950/10 border border-blue-500/10 px-2 py-1 rounded font-bold tracking-widest shrink-0 uppercase">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Extension point form */}
          <div className="lg:col-span-1">
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4 font-mono text-xs">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Register Protocol Extension
                </h3>
                <p className="text-[10px] text-zinc-500 mt-1 font-sans">
                  Register a safe custom module namespace to inject domain rules.
                </p>
              </div>

              <form onSubmit={handleRegisterExtension} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-zinc-500 text-[9px] block uppercase font-bold">Extension Unique Key Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ext_quantum_gate"
                    value={newExtKey}
                    onChange={(e) => setNewExtKey(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-zinc-200 outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 text-[9px] block uppercase font-bold">Extension Display Title:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trapped-Ion Simulator"
                    value={newExtName}
                    onChange={(e) => setNewExtName(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-zinc-200 outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 text-[9px] block uppercase font-bold">Extension Classification:</label>
                  <select
                    value={newExtType}
                    onChange={(e) => setNewExtType(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-zinc-400 outline-none focus:border-emerald-500 text-xs"
                  >
                    <option value="Compute Extension">Compute Extension</option>
                    <option value="Validator">Validator</option>
                    <option value="Evidence Linker">Evidence Linker</option>
                    <option value="Alternative Signature">Alternative Signature</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 text-[9px] block uppercase font-bold">Functional Scope Description:</label>
                  <textarea
                    rows={3}
                    placeholder="Enter what limits or state registers this module is responsible for verifying..."
                    value={newExtDesc}
                    onChange={(e) => setNewExtDesc(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-zinc-200 outline-none focus:border-emerald-500 text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs transition uppercase tracking-wider"
                >
                  Hot-Mount VEP Extension
                </button>
              </form>

            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 5: ARCHITECTURAL LAYERS STACK */}
      {activeTab === "stack" && (
        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-6 animate-fadeIn font-mono text-xs">
          
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              VEP 7-Layer Protocol Stack Overview
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Presents the structured, nested architectural layers driving the Verifiable Execution Kernel.
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              { layer: "Layer 7", title: "VEK Console (UI)", desc: "Aesthetic, high-density React/TypeScript interactive console enabling visualization, simulation, and manual contract review.", color: "border-purple-500 text-purple-400" },
              { layer: "Layer 6", title: "Verifiable Execution Protocol (VEP)", desc: "Standardizes communications using strictly typed, signed digital envelopes and real-time version negotiation across modules.", color: "border-blue-500 text-blue-400" },
              { layer: "Layer 5", title: "EGAF (Evidence Analysis)", desc: "Formulates claim graphs and maps physical/synthetic credibility markers to build complete confidence indices.", color: "border-emerald-500 text-emerald-400" },
              { layer: "Layer 4", title: "VEK Runtime Engine", desc: "Launches virtual machine sandboxes, processes candidate payloads, and asserts constraint boundaries.", color: "border-teal-500 text-teal-400" },
              { layer: "Layer 3", title: "Cryptographic Integrity Gateway", desc: "Authenticates packet structure layers via SHA-512 hashes and FIPS-compliant cryptographic private/public keypairs.", color: "border-amber-500 text-amber-400" },
              { layer: "Layer 2", title: "Deterministic State Transition Engine", desc: "Defines deterministic state transition rules where identical register cycles always match duplicates.", color: "border-orange-500 text-orange-400" },
              { layer: "Layer 1", title: "Core Data Schema & Audit Bundle", desc: "Underlying physical schema, models, database tables, and canonical binary definitions representing ground-truth states.", color: "border-red-500 text-red-400" }
            ].map((st, idx) => (
              <div 
                key={idx}
                className={`border-l-4 bg-black p-4 rounded-r-lg space-y-1 hover:bg-[#0f0f13] transition-colors border-y border-r border-zinc-900 ${st.color.split(" ")[0]}`}
              >
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className={st.color.split(" ")[1]}>{st.layer}</span>
                  <span className="text-zinc-600 uppercase">Layer Verified</span>
                </div>
                <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">{st.title}</h4>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUB-TAB 6: RFC-001 TRUST BOUNDARIES VERIFICATION SUITE */}
      {activeTab === "verification-suite" && (
        <div className="space-y-6 animate-fadeIn text-xs">
          
          {/* Header */}
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-4xl">
                <span className="text-[9px] bg-red-950/40 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                  RFC-001 SECURE TEST SUITE
                </span>
                <h3 className="text-base font-extrabold text-white uppercase font-mono tracking-tight flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-red-500" />
                  RFC-001 — Hard Trust Boundaries & Certification Pipeline
                </h3>
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                  Establishes three critical architectural subsystems moving verification completely out of the runtime, stopping format drift through a canonical registry authority, and proving cross-machine invariant determinism.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* COLUMN 1: RFC-001 SPECIFICATION READER (4 cols) */}
            <div className="xl:col-span-4 bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4">
              <div className="border-b border-zinc-900 pb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-red-400" />
                  RFC-001 Standard Spec
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Deterministic execution proof standard
                </p>
              </div>

              <div className="space-y-4 h-[580px] overflow-y-auto pr-1.5 scrollbar-thin text-zinc-300 font-sans text-[11px] leading-relaxed">
                <div className="p-2.5 bg-black rounded border border-zinc-900 font-mono text-[10px] text-zinc-500">
                  <p className="font-bold text-zinc-300 text-xs">RFC-001 SPEC SUMMARY</p>
                  <p className="mt-1">Title: Deterministic Execution Proof & Verification Standard (VEK-DVPS)</p>
                  <p>Model: S = (I, E, T, P, K)</p>
                  <p>Status: APPROVED V2.1</p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-white uppercase font-mono text-[10px]">1. Scope & Objective</h5>
                  <p className="text-zinc-400">
                    Defines the offline rules for certifying arbitrary computational threads without relying on runtime execution engines. Verifiers must remain completely stateless, independent, and out of the trust boundary.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-white uppercase font-mono text-[10px]">2. Hard Invariant Hashing</h5>
                  <p className="text-zinc-400">
                    For every input <code className="font-mono text-zinc-200">i ∈ I</code>, the execution function <code className="font-mono text-zinc-200">E(i) → (r, t)</code> must satisfy perfect bit-by-bit invariance across CPU hardware, operating systems, compiler options, and thread runtimes.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-white uppercase font-mono text-[10px]">3. EPO Envelope (v2.1)</h5>
                  <p className="text-zinc-400">
                    The Execution Proof Object (EPO) binds:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                    <li><code className="font-mono text-zinc-200 text-[10px]">traceRoot</code>: Merkle or chain root of instructions</li>
                    <li><code className="font-mono text-zinc-200 text-[10px]">outputHash</code>: Hash of final state variables</li>
                    <li><code className="font-mono text-zinc-200 text-[10px]">configHash</code>: Domain and seed parameter bindings</li>
                    <li><code className="font-mono text-zinc-200 text-[10px]">signature</code>: HSM cryptographically signed seal</li>
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-white uppercase font-mono text-[10px]">4. Verification Rules</h5>
                  <p className="text-zinc-400">
                    The verifier loads the artifact, validates the schema version against the Authority Registry, recomputes the state transitions, and asserts identity matches. If any check fails, the transaction is dropped.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-white uppercase font-mono text-[10px]">5. Cross-Machine Consensus</h5>
                  <p className="text-zinc-400">
                    No execution is certified unless state transition hashes match identically across a matrix of environments (Local, Docker, WebAssembly). Drift tolerance is strictly <code className="font-mono text-white text-[10px]">0.00%</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* COLUMN 2: OFFLINE VERIFIER & SCHEMA REGISTRY & HARNESS (8 cols) */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* SECTION A: INDEPENDENT VERIFIER CLI BINARY */}
              <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-amber-500" />
                      Subsystem A — Independent Verifier Binary
                    </h4>
                    <p className="text-[9px] text-zinc-500 font-sans mt-0.5">
                      Isolated verification bin outside runtime boundaries (<code className="text-amber-400 text-[10px]">vek-verify</code>)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedEpoFile}
                      onChange={(e) => {
                        setSelectedEpoFile(e.target.value as any);
                        setCliOutput([]);
                      }}
                      className="bg-black border border-zinc-800 rounded p-1.5 text-zinc-400 outline-none focus:border-amber-500 text-[10px]"
                    >
                      <option value="uas_nominal">evaluation_report.json (UAS Nominal)</option>
                      <option value="defi_nominal">defi_pool_report.json (DeFi Nominal)</option>
                      <option value="tampered_route">tampered_route_report.json (FAIL)</option>
                    </select>

                    <button
                      onClick={() => {
                        if (cliRunning) return;
                        setCliRunning(true);
                        setCliOutput(["[INIT] Booting isolated verifier virtual binary...", "Loading verifier/bin/vek-verify..."]);
                        
                        setTimeout(() => {
                          setCliOutput(prev => [...prev, `Target: ${selectedEpoFile === "uas_nominal" ? "evaluation_report.json" : selectedEpoFile === "defi_nominal" ? "defi_pool_report.json" : "tampered_route_report.json"}`]);
                          
                          setTimeout(() => {
                            if (selectedEpoFile === "uas_nominal") {
                              setCliOutput(prev => [
                                ...prev,
                                "[STAGE-1] Load Artifacts: loaded EPO v2.1 and core execution sequence",
                                "[STAGE-2] Deterministic Re-execution: processing 4 UAS waypoint cycles...",
                                "  - Step 1 (INITIALIZE): state_hash = 0x9b42... STATUS: PASS",
                                "  - Step 2 (SET_ALTITUDE): state_hash = 0xa31e... STATUS: PASS",
                                "  - Step 3 (UPDATE): state_hash = 0x5fa1... STATUS: PASS",
                                "  - Step 4 (WAYPOINT): state_hash = 0xd3b8... STATUS: PASS",
                                "[STAGE-3] Hash Reconstruction: comparing checksum chains...",
                                "  * Expected Trace Root: 0xd3b8ef42c161947e70460c4908ef1619a002ebf927e88b220",
                                "  * Computed Trace Root: 0xd3b8ef42c161947e70460c4908ef1619a002ebf927e88b220",
                                "  - Result: 🟢 IDENTICAL REPLAY (0% DRIFT)",
                                "[STAGE-4] Cryptographic Seal Integrity Check...",
                                "  * Signature verify: RSA-SHA256 authenticated successfully via FIPS HSM Key",
                                "  - Result: 🟢 SEAL VALID",
                                "\n[STATUS] AUDIT VERIFICATION PASSED. Truth Container Certified.",
                              ]);
                            } else if (selectedEpoFile === "defi_nominal") {
                              setCliOutput(prev => [
                                ...prev,
                                "[STAGE-1] Load Artifacts: loaded EPO v2.1",
                                "[STAGE-2] Deterministic Re-execution: processing DeFi Liquid Pool state steps...",
                                "  - Step 1 (INITIALIZE_POOL): state_hash = 0xc01a... STATUS: PASS",
                                "  - Step 2 (DEPOSIT): state_hash = 0x88f9... STATUS: PASS",
                                "  - Step 3 (SWAP): state_hash = 0x12fa... STATUS: PASS",
                                "[STAGE-3] Hash Reconstruction: comparing checksum chains...",
                                "  * Expected Trace Root: 0x12fa39ca5a0134bb882ea77ef945bb0e93a0b120",
                                "  * Computed Trace Root: 0x12fa39ca5a0134bb882ea77ef945bb0e93a0b120",
                                "  - Result: 🟢 IDENTICAL REPLAY (0% DRIFT)",
                                "[STAGE-4] Cryptographic Seal Integrity Check...",
                                "  * Signature verify: RSA-SHA256 authenticated successfully",
                                "  - Result: 🟢 SEAL VALID",
                                "\n[STATUS] AUDIT VERIFICATION PASSED. Truth Container Certified.",
                              ]);
                            } else {
                              setCliOutput(prev => [
                                ...prev,
                                "[STAGE-1] Load Artifacts: loading report and checking parameters",
                                "[STAGE-2] Deterministic Re-execution: processing uas waypoint steps...",
                                "  - Step 1 (INITIALIZE): state_hash = 0x9b42... STATUS: PASS",
                                "  - Step 2 (SET_ALTITUDE): state_hash = 0xfa39... STATUS: PASS (BREACH INJECTED AT ALTITUDE 480ft)",
                                "  - Step 3 (UPDATE): state_hash = 0xe2a8... STATUS: PASS",
                                "  - Step 4 (WAYPOINT): state_hash = 0xbc01... STATUS: PASS",
                                "[STAGE-3] Hash Reconstruction: comparing checksum chains...",
                                "  * Expected Trace Root: 0xd3b8ef42c161947e70460c4908ef1619a002ebf927e88b220",
                                "  * Computed Trace Root: 0xbc0128a3f9e20a01bb4fa3901ca9f8a3d3c012ff1a00a09b",
                                "  - Result: 🔴 REPLAY DIVERGENCE DETECTED (State values do not match original trace)",
                                "[STAGE-4] Cryptographic Seal Integrity Check...",
                                "  * Signature verify: Signature validation failed (RSA decrypt mismatch)",
                                "  - Result: 🔴 COMPROMISED SEAL",
                                "\n[STATUS] AUDIT VERIFICATION FAILED: SUPPLY-CHAIN INTEGRITY BREACHED OR VALUE DRIFT IDENTIFIED.",
                              ]);
                            }
                            setCliRunning(false);
                          }, 900);
                        }, 500);
                      }}
                      disabled={cliRunning}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-white font-bold rounded text-[10px] tracking-wider uppercase transition flex items-center gap-1 shrink-0"
                    >
                      <Play className="w-3 h-3" />
                      <span>Run vek-verify</span>
                    </button>
                  </div>
                </div>

                {/* Terminal Console output */}
                <div className="bg-black border border-zinc-950 rounded-lg p-4 font-mono text-[10px] h-[180px] overflow-y-auto scrollbar-thin text-zinc-400 space-y-1.5">
                  {cliOutput.length === 0 ? (
                    <span className="text-zinc-600 italic">Select an EPO file and click 'Run vek-verify' to invoke the isolated verifier.</span>
                  ) : (
                    cliOutput.map((line, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-zinc-700 font-bold select-none">&gt;</span>
                        <span className={
                          line.includes("PASSED") || line.includes("🟢") 
                            ? "text-emerald-400 font-bold" 
                            : line.includes("FAILED") || line.includes("🔴") || line.includes("[CRITICAL]")
                            ? "text-red-400 font-bold"
                            : line.includes("[INIT]") || line.includes("[STAGE")
                            ? "text-amber-400 font-bold"
                            : "text-zinc-300"
                        }>
                          {line}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SECTION B: CANONICAL SCHEMA REGISTRY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Schema file selector */}
                <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4 font-mono">
                  <div className="border-b border-zinc-900 pb-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-400" />
                      Subsystem B — Schema Registry
                    </h4>
                    <p className="text-[9px] text-zinc-500 font-sans mt-0.5">
                      Prevents schema drift before execution loops
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { id: "epo_v1", file: "epo/v1.json", desc: "EPO v1.0 standard schema" },
                      { id: "epo_v2", file: "epo/v2.json", desc: "EPO v2.1 envelope & seal schema" },
                      { id: "trace_v1", file: "trace/v1.json", desc: "Transition trace verification schema" },
                      { id: "seal_v1", file: "seal/v1.json", desc: "Cryptographic seal envelope schema" }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSchemaFile(s.id as any)}
                        className={`w-full text-left p-2 border rounded transition-all text-[11px] flex justify-between items-center ${
                          selectedSchemaFile === s.id
                            ? "bg-blue-950/15 border-blue-500 text-blue-400 font-bold"
                            : "bg-black border-zinc-900 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div>
                          <span className="block font-bold">{s.file}</span>
                          <span className="text-[9px] text-zinc-500 font-sans block mt-0.5">{s.desc}</span>
                        </div>
                        <span className="text-[9px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500 border border-zinc-800">
                          Authority
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="p-2.5 bg-blue-950/10 border border-blue-500/10 text-blue-400 font-sans text-[10px] rounded leading-normal">
                    <strong>Hard Invariant Rule:</strong> If artifact's declared <code className="font-mono text-white text-[9px]">schema</code> or <code className="font-mono text-white text-[9px]">version</code> does not match the authority registry, verification fails instantly prior to any VM instruction execution.
                  </div>
                </div>

                {/* Schema JSON Code display */}
                <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-3 font-mono">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <span className="text-[10px] text-zinc-400 font-bold">registry/{
                      selectedSchemaFile === "epo_v1" ? "epo/v1.json" : selectedSchemaFile === "epo_v2" ? "epo/v2.json" : selectedSchemaFile === "trace_v1" ? "trace/v1.json" : "seal/v1.json"
                    }</span>
                    <span className="text-[8px] uppercase tracking-wider text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/10 font-bold">Enforced</span>
                  </div>

                  <div className="bg-black p-3.5 rounded text-[10px] text-zinc-400 h-[220px] overflow-y-auto scrollbar-thin overflow-x-auto border border-zinc-950">
                    <pre className="text-zinc-300">
                      {selectedSchemaFile === "epo_v1" && JSON.stringify({
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "title": "VEK_EPO_v1_Schema",
                        "type": "object",
                        "properties": {
                          "epo_version": { "type": "string", "enum": ["1.0"] },
                          "kernel_version": { "type": "string" },
                          "domain": { "type": "string" },
                          "execution_id": { "type": "string" },
                          "seed": { "type": ["string", "number"] },
                          "initial_state_hash": { "type": "string" },
                          "final_state_hash": { "type": "string" },
                          "inputs": { "type": "array" },
                          "trace": { "type": "array" },
                          "proof_hash": { "type": "string" }
                        },
                        "required": ["epo_version", "kernel_version", "domain", "execution_id", "seed", "initial_state_hash", "final_state_hash"]
                      }, null, 2)}

                      {selectedSchemaFile === "epo_v2" && JSON.stringify({
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "title": "VEK_EPO_v2_Schema",
                        "type": "object",
                        "properties": {
                          "epo_version": { "type": "string", "enum": ["2.1"] },
                          "domain": { "type": "string" },
                          "execution_id": { "type": "string" },
                          "seed": { "type": ["string", "number"] },
                          "final_state_hash": { "type": "string" },
                          "inputs": { "type": "array" },
                          "trace": { "type": "array" },
                          "proof_hash": { "type": "string" },
                          "signature": {
                            "type": "object",
                            "properties": {
                              "algorithm": { "type": "string" },
                              "public_key": { "type": "string" },
                              "signature": { "type": "string" }
                            },
                            "required": ["algorithm", "public_key", "signature"]
                          }
                        },
                        "required": ["epo_version", "domain", "execution_id", "seed", "final_state_hash", "proof_hash", "signature"]
                      }, null, 2)}

                      {selectedSchemaFile === "trace_v1" && JSON.stringify({
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "title": "VEK_Trace_v1_Schema",
                        "type": "object",
                        "properties": {
                          "step": { "type": "integer" },
                          "prev_hash": { "type": "string" },
                          "state_hash": { "type": "string" },
                          "input_hash": { "type": "string" }
                        },
                        "required": ["step", "prev_hash", "state_hash", "input_hash"]
                      }, null, 2)}

                      {selectedSchemaFile === "seal_v1" && JSON.stringify({
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "title": "VEK_Seal_v1_Schema",
                        "type": "object",
                        "properties": {
                          "algorithm": { "type": "string" },
                          "public_key": { "type": "string" },
                          "signature": { "type": "string" }
                        },
                        "required": ["algorithm", "public_key", "signature"]
                      }, null, 2)}
                    </pre>
                  </div>
                </div>

              </div>

              {/* SECTION C: CROSS-MACHINE REPRODUCIBILITY HARNESS */}
              <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      Subsystem C — Cross-Machine Reproducibility Harness
                    </h4>
                    <p className="text-[9px] text-zinc-500 font-sans mt-0.5 font-mono">
                      Checks hash invariance across environments to prove zero arithmetic drift
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (harnessRunning) return;
                      setHarnessRunning(true);
                      setHarnessProgress(10);
                      setHarnessReport(null);
                      setHarnessLog(["[INIT] Spawning environment testing subprocesses..."]);

                      setTimeout(() => {
                        setHarnessProgress(35);
                        setHarnessLog(prev => [...prev, "Spawning Node-18, Node-20, Linux-x64 containers..."]);
                        
                        setTimeout(() => {
                          setHarnessProgress(65);
                          setHarnessLog(prev => [
                            ...prev, 
                            "Spawning ARM64 Mac and WebAssembly emulated nodes...",
                            "Running 3 test suites: UAS-NOMINAL, DEFI-NOMINAL, CLINICAL-EDGE"
                          ]);
                          
                          setTimeout(() => {
                            setHarnessProgress(100);
                            setHarnessLog(prev => [
                              ...prev, 
                              "Comparing output state hashes & trace root chains across all 5 environments...",
                              "  - UAS-NOMINAL: state_hash matches identically (variance = 0)",
                              "  - DEFI-NOMINAL: state_hash matches identically (variance = 0)",
                              "  - CLINICAL-EDGE: state_hash matches identically (variance = 0)",
                              "  - Overall consensus: DETERMINISTIC (0% DRIFT)"
                            ]);
                            setHarnessReport({
                              deterministic: true,
                              variance: 0,
                              environmentsTested: 5,
                              failurePoints: [],
                              summaryPath: "repro-harness/results/summary.json"
                            });
                            setHarnessRunning(false);
                          }, 1000);
                        }, 800);
                      }, 600);
                    }}
                    disabled={harnessRunning}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-mono text-[10px] font-bold rounded uppercase tracking-wider transition flex items-center gap-1.5 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Invariance Harness</span>
                  </button>
                </div>

                {/* Progress bar */}
                {harnessRunning && (
                  <div className="space-y-1.5 font-mono text-[9px] text-zinc-500">
                    <div className="flex justify-between">
                      <span>Executing environments testing matrix...</span>
                      <span>{harnessProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-300" 
                        style={{ width: `${harnessProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Harness console logs */}
                  <div className="bg-black border border-zinc-950 rounded p-3.5 font-mono text-[9px] text-zinc-500 h-[140px] overflow-y-auto scrollbar-thin space-y-1">
                    {harnessLog.length === 0 ? (
                      <span className="italic text-zinc-600">No harness simulation run yet. Click 'Run Invariance Harness'.</span>
                    ) : (
                      harnessLog.map((log, idx) => (
                        <div key={idx} className="flex gap-1.5">
                          <span className="text-zinc-700 font-bold shrink-0">&gt;</span>
                          <span className={log.includes("consensus") || log.includes("variance = 0") ? "text-emerald-400 font-bold" : "text-zinc-400"}>{log}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Summary output report */}
                  <div className="bg-[#08080a] border border-zinc-950 rounded p-3.5 font-mono text-[10px] space-y-2 text-zinc-400">
                    <span className="text-[8px] bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded font-bold uppercase">
                      Harness Output Report
                    </span>

                    {harnessReport ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="text-emerald-400 font-bold">DETERMINISTIC</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hash Variance:</span>
                          <span className="text-white">0 (Absolute consensus)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Environments Checked:</span>
                          <span className="text-white">5 / 5 Target environments</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Failure Points:</span>
                          <span className="text-emerald-400">None detected</span>
                        </div>
                        <div className="text-[9px] text-zinc-600 leading-normal border-t border-zinc-900 pt-1.5 mt-1 font-sans">
                          * Secure summary successfully archived at: <code className="font-mono text-zinc-500 text-[8px]">{harnessReport.summaryPath}</code>
                        </div>
                      </div>
                    ) : (
                      <div className="text-zinc-600 italic text-[10px] flex items-center justify-center h-20">
                        Await harness test execution to populate results summary.
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

