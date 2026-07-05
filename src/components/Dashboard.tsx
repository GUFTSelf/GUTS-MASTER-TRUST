import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Shield, RotateCcw, AlertTriangle, CheckCircle, HelpCircle, 
  Terminal, Sparkles, Cpu, Clock, RefreshCw, BarChart2, Info, ChevronRight, Hash,
  Volume2, VolumeX
} from "lucide-react";
import { VerificationReport, AuditRecord } from "../types";
import OracleIdentityPanel from "./OracleIdentityPanel";
import VoiceConversationPanel from "./VoiceConversationPanel";
import AudioVisualizer from "./AudioVisualizer";
import { speakText, stopSpeaking } from "../lib/speakHelper";

interface DashboardProps {
  onVerificationSuccess: (report: VerificationReport) => void;
  latestReport: VerificationReport | null;
  ledger: AuditRecord[];
  refreshLedger: () => void;
  aiAvatar: string;
  setAiAvatar: (val: string) => void;
  aiVoice: string;
  setAiVoice: (val: string) => void;
  isMimicked: boolean;
  setIsMimicked: (val: boolean) => void;
}

const PRESETS = [
  {
    title: "Aerospace UAS Route Validation",
    prompt: "Evaluate mission path navigation parameters for Autonomous UAS-04 under 400ft.",
    category: "Aerospace"
  },
  {
    title: "Smart-Contract Liquidation Rules",
    prompt: "Verify smart-contract liquid collateral liquidation transition rules with 135% collateralization factor.",
    category: "Finance"
  },
  {
    title: "Clinical Trial Pharmaceutical Bounds",
    prompt: "Synthesize dosage constraint bounds for clinical pharmaceutical validation trial and serum target levels.",
    category: "Healthcare"
  }
];

export default function Dashboard({ 
  onVerificationSuccess, 
  latestReport, 
  ledger, 
  refreshLedger,
  aiAvatar,
  setAiAvatar,
  aiVoice,
  setAiVoice,
  isMimicked,
  setIsMimicked
}: DashboardProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<"constraints" | "replay" | "evidence">("constraints");
  const [customConsoleLogs, setCustomConsoleLogs] = useState<string[]>([]);
  const [isOutputSpeaking, setIsOutputSpeaking] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [isSandboxSpeaking, setIsSandboxSpeaking] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const isAiSpeaking = isOutputSpeaking || isVoiceSpeaking || isSandboxSpeaking;

  const steps = [
    { title: "LLM Generation", desc: "Synthesizing candidate response statements" },
    { title: "VEK Contract", desc: "Validating policy constraint rules" },
    { title: "Deterministic Replay", desc: "Re-executing state machine logic" },
    { title: "Evidence Core", desc: "Correlating text outputs with baseline telemetry" },
    { title: "Confidence Engine", desc: "Scoring metrics & mathematical limits" },
    { title: "Engineering Report", desc: "Assembling final verifiable cryptographic proofs" }
  ];

  useEffect(() => {
    if (customConsoleLogs.length === 0) {
      setCustomConsoleLogs([
        "[SYSTEM_INIT] Verifiable Execution Kernel Console initialized.",
        `[KERNEL_READY] Standard contract verification keys loaded.`,
        "[STATUS] Monitoring atomic transitions and state replay channels."
      ]);
    }
  }, []);

  const addLog = (msg: string) => {
    setCustomConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-8));
  };

  const handleVerify = async (selectedPrompt?: string) => {
    const targetPrompt = selectedPrompt || prompt;
    if (!targetPrompt.trim()) return;

    setLoading(true);
    setCurrentStep(1);
    addLog(`Initiating verification protocol for: "${targetPrompt.substring(0, 45)}..."`);

    // Animation loop for progress bar
    const stepIntervals = [
      setTimeout(() => { setCurrentStep(2); addLog("Module 2: VEK Policy Layer checking transition state parameters..."); }, 800),
      setTimeout(() => { setCurrentStep(3); addLog("Module 3: Deterministic Replay simulation testing rule consistency..."); }, 1600),
      setTimeout(() => { setCurrentStep(4); addLog("Module 4: Evidence Correlative Analysis compiling support index..."); }, 2400),
      setTimeout(() => { setCurrentStep(5); addLog("Module 5: Computing confidence score and alternative risk profiles..."); }, 3000),
      setTimeout(() => { setCurrentStep(6); addLog("Module 6: Generating verifiable cryptographic decision hashes..."); }, 3600)
    ];

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: targetPrompt, simulateFailure })
      });
      
      const data = await response.json();
      
      // Complete final step
      setTimeout(() => {
        onVerificationSuccess(data);
        refreshLedger();
        setLoading(false);
        setCurrentStep(0);
        addLog(`[PASS] Verification complete. Trace ID: ${data.metadata.traceID}. Execution Hash: ${data.verification.executionHash}`);
      }, 4200);

    } catch (err: any) {
      console.error(err);
      stepIntervals.forEach(clearTimeout);
      setLoading(false);
      setCurrentStep(0);
      addLog(`[CRITICAL_ERROR] Verification sequence aborted: ${err.message}`);
    }
  };

  return (
    <div id="vek-dashboard-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* LEFT/CENTER: Workspace Panels */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Workspace: Prompts and Trigger */}
        <div id="prompt-workspace-card" className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl rounded-full" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-200 font-mono">
                VEK Verification Workspace
              </h2>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">v2.3.0 Standard Kernel</span>
          </div>

          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Specify safety-critical parameters, path rules, or system logic limits. 
            The Verifiable Execution Kernel will generate the candidate output, re-run replay assertions, validate safety policies, and compile evidence correlation.
          </p>

          {/* Quick Preset Badges */}
          <div className="mb-4">
            <span className="text-[10px] text-zinc-500 block mb-2 font-mono uppercase tracking-wider">Select Engineering Preset Targets:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  id={`preset-btn-${idx}`}
                  disabled={loading}
                  onClick={() => {
                    setPrompt(preset.prompt);
                    handleVerify(preset.prompt);
                  }}
                  className="bg-[#18181b]/60 hover:bg-[#18181b] border border-[#27272a] hover:border-blue-500/50 rounded-lg p-3 text-left transition duration-200 group flex flex-col justify-between"
                >
                  <span className="text-[10px] font-mono text-blue-500 mb-1 flex items-center justify-between">
                    {preset.category}
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="text-xs font-semibold text-zinc-300 line-clamp-2">{preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Form */}
          <div className="space-y-3">
            <textarea
              id="prompt-input-field"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Define and audit transition protocols for Autonomous UAS-04 collision safety bounds..."
              className="w-full bg-black border border-[#27272a] focus:border-blue-500 text-xs rounded-lg p-3 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono transition"
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <label id="simulate-failure-label" className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-400 hover:text-zinc-300">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="rounded bg-black border-[#27272a] text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Simulate Replay Determinism Defect (Replay FAIL)
                </span>
              </label>

              <button
                id="execute-verify-btn"
                onClick={() => handleVerify()}
                disabled={loading || !prompt.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-[#18181b] disabled:text-zinc-600 text-white text-[11px] font-bold uppercase tracking-[0.2em] font-sans px-5 py-2.5 rounded flex items-center gap-2 transition duration-200 shadow-lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Executing Pipeline...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Run Deterministic Verification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Oracle Identity & Voice Mimicry Engine Panel */}
        <OracleIdentityPanel 
          aiAvatar={aiAvatar}
          setAiAvatar={setAiAvatar}
          aiVoice={aiVoice}
          setAiVoice={setAiVoice}
          isMimicked={isMimicked}
          setIsMimicked={setIsMimicked}
          onSpeakingChange={setIsSandboxSpeaking}
        />

        {/* Real-Time Canvas & AnalyserNode Frequency Visualizer */}
        <AudioVisualizer 
          isSpeaking={isAiSpeaking}
          isVoiceActive={isVoiceActive}
          voiceName={aiVoice}
        />

        {/* Voice Conversation Mode Panel */}
        <VoiceConversationPanel
          latestReport={latestReport}
          handleVerify={handleVerify}
          loading={loading}
          aiVoice={aiVoice}
          aiAvatar={aiAvatar}
          onSpeakingChange={setIsVoiceSpeaking}
          onActiveChange={setIsVoiceActive}
        />

        {/* Dynamic Pipeline Progress Bar */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5 shadow-2xl relative"
            >
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">Pipeline Stages Executing:</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {steps.map((st, idx) => {
                  const stepNum = idx + 1;
                  const isActive = currentStep === stepNum;
                  const isCompleted = currentStep > stepNum;
                  return (
                    <div 
                      key={idx} 
                      className={`p-2.5 border rounded-lg transition duration-300 font-mono text-left flex flex-col justify-between ${
                        isActive 
                          ? "bg-blue-950/10 border-blue-500 text-blue-400" 
                          : isCompleted 
                          ? "bg-emerald-950/5 border-emerald-500/10 text-emerald-400" 
                          : "bg-black border-[#27272a] text-zinc-600"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider mb-1">
                          <span>Stage {stepNum}</span>
                          {isCompleted && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                          {isActive && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
                        </div>
                        <span className="text-[11px] font-bold block leading-snug">{st.title}</span>
                      </div>
                      <span className="text-[9px] text-zinc-500 mt-2 block line-clamp-2 leading-snug">{st.desc}</span>
                    </div>
                  );
                })}
              </div>

              {/* Graphical Loading line */}
              <div className="w-full bg-[#18181b] h-1 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  className="bg-blue-500 h-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(currentStep / 6) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS SPLIT PANEL */}
        {latestReport && (
          <div id="pipeline-results-workspace" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* COLUMN 1: AI Generated Candidate Response (Module 1) */}
            <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#27272a] pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    {/* Render active custom AI avatar */}
                    {aiAvatar.startsWith("data:image") ? (
                      <img 
                        src={aiAvatar} 
                        alt="Oracle Avatar" 
                        className="w-7 h-7 rounded-full object-cover border border-purple-500/30 ring-1 ring-purple-500/10"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-950/40 border border-blue-500/30 flex items-center justify-center font-bold text-[10px] text-blue-400">
                        O
                      </div>
                    )}
                    <div>
                      <h3 className="text-[10px] font-bold font-mono tracking-widest uppercase text-zinc-400 leading-none">
                        Module 1: LLM Candidate Output
                      </h3>
                      <span className="text-[9px] font-mono text-purple-400 uppercase tracking-wider block mt-0.5">
                        Oracle: {aiVoice.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                  {latestReport.metadata.isRealGemini ? (
                    <span className="text-[10px] bg-emerald-950/20 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded font-mono">
                      Gemini 3.5 Live API
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-950/20 text-amber-400 border border-amber-500/10 px-2 py-0.5 rounded font-mono">
                      VEK Synthesized
                    </span>
                  )}
                </div>

                <div className="bg-black border border-[#27272a] p-4 rounded font-mono text-[12px] text-zinc-300 h-[280px] overflow-y-auto whitespace-pre-wrap leading-relaxed scrollbar-thin">
                  {latestReport.output}
                </div>
              </div>

              {/* Dynamic waveform visualizer when speaking */}
              {isOutputSpeaking && (
                <div className="flex items-center bg-purple-950/10 border border-purple-500/20 px-3 py-1.5 rounded-lg mt-3">
                  <span className="text-[9px] font-mono text-purple-400 uppercase tracking-wider mr-3">Vocal Transmission waves:</span>
                  <div className="flex items-end gap-[2px] h-3">
                    <motion.div className="w-[3px] bg-purple-500 rounded-full" animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }} />
                    <motion.div className="w-[3px] bg-purple-400 rounded-full" animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut", delay: 0.1 }} />
                    <motion.div className="w-[3px] bg-purple-500 rounded-full" animate={{ height: [4, 15, 4] }} transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut", delay: 0.2 }} />
                    <motion.div className="w-[3px] bg-purple-300 rounded-full" animate={{ height: [4, 6, 4] }} transition={{ repeat: Infinity, duration: 0.4, ease: "easeInOut", delay: 0.3 }} />
                    <motion.div className="w-[3px] bg-purple-500 rounded-full" animate={{ height: [4, 11, 4] }} transition={{ repeat: Infinity, duration: 0.65, ease: "easeInOut", delay: 0.15 }} />
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-600" />
                  Latency: {latestReport.metadata.processingTimeMs}ms
                </span>
                
                <button
                  onClick={() => {
                    if (isOutputSpeaking) {
                      stopSpeaking();
                      setIsOutputSpeaking(false);
                    } else {
                      setIsOutputSpeaking(true);
                      speakText(latestReport.output, aiVoice, undefined, () => {
                        setIsOutputSpeaking(false);
                      });
                    }
                  }}
                  className={`px-3 py-1 rounded font-mono text-[9px] font-bold tracking-wider uppercase transition flex items-center gap-1 border ${
                    isOutputSpeaking 
                      ? "bg-red-950/20 text-red-400 border-red-500/30 hover:bg-red-900/20" 
                      : "bg-purple-950/30 text-purple-400 border-purple-500/20 hover:bg-purple-900/30"
                  }`}
                >
                  {isOutputSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-red-400" />
                      Mute Voice
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                      Speak Response
                    </>
                  )}
                </button>

                <span>Bytes: {new Blob([latestReport.output]).size}</span>
              </div>
            </div>

            {/* COLUMN 2: Verification, Replay & Evidence Panels */}
            <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5 shadow-xl flex flex-col justify-between">
              <div>
                {/* Navigation sub-tabs inside target info */}
                <div className="flex items-center gap-1 border-b border-[#27272a] pb-2 mb-4 font-mono text-[11px]">
                  <button
                    onClick={() => setActiveSubTab("constraints")}
                    className={`px-3 py-1.5 rounded transition ${
                      activeSubTab === "constraints" 
                        ? "bg-[#18181b] text-blue-400 font-semibold border-b-2 border-blue-500" 
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Policy Constraints
                  </button>
                  <button
                    onClick={() => setActiveSubTab("replay")}
                    className={`px-3 py-1.5 rounded transition ${
                      activeSubTab === "replay" 
                        ? "bg-[#18181b] text-blue-400 font-semibold border-b-2 border-blue-500" 
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Replay Simulation
                  </button>
                  <button
                    onClick={() => setActiveSubTab("evidence")}
                    className={`px-3 py-1.5 rounded transition ${
                      activeSubTab === "evidence" 
                        ? "bg-[#18181b] text-blue-400 font-semibold border-b-2 border-blue-500" 
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Evidence Analysis
                  </button>
                </div>

                {/* Sub Tab Content: Constraints */}
                {activeSubTab === "constraints" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-black p-2.5 border border-[#27272a] rounded text-xs font-mono">
                      <span className="text-zinc-500">Policy Conformity Status:</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        latestReport.verification.constraintStatus === "PASS" 
                          ? "bg-emerald-950/20 text-emerald-400 border border-emerald-500/10" 
                          : "bg-amber-950/20 text-amber-400 border border-amber-500/10"
                      }`}>
                        {latestReport.verification.constraintStatus}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin">
                      {latestReport.verification.constraintChecks.map((check, idx) => (
                        <div key={idx} className="bg-black border border-[#27272a] p-2.5 rounded flex items-start justify-between gap-3 text-xs">
                          <div>
                            <span className="font-mono text-[9px] text-zinc-500 block tracking-wider uppercase">{check.id} • POLICY CONSTRAINT</span>
                            <span className="font-semibold text-zinc-300 font-mono block">{check.name}</span>
                            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{check.description}</p>
                          </div>
                          <span className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                            check.status === "PASS" 
                              ? "text-emerald-400 bg-emerald-950/20 border border-emerald-500/10" 
                              : "text-amber-400 bg-amber-950/20 border border-amber-500/10"
                          }`}>
                            {check.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub Tab Content: Replay */}
                {activeSubTab === "replay" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-black p-2.5 border border-[#27272a] rounded text-xs font-mono">
                      <span className="text-zinc-500">State Transition Replay Status:</span>
                      <span className={`font-bold px-2.5 py-0.5 rounded text-[10px] ${
                        latestReport.verification.replayStatus === "PASS" 
                          ? "bg-emerald-950/20 text-emerald-400 border border-emerald-500/10" 
                          : "bg-red-950/20 text-red-400 border border-red-500/10"
                      }`}>
                        {latestReport.verification.replayStatus === "PASS" ? "PASS (100% Match)" : "FAIL (State Drift)"}
                      </span>
                    </div>

                    {/* Hashes Container */}
                    <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                      <div className="bg-black p-2 border border-[#27272a] rounded">
                        <span className="text-zinc-500 block mb-0.5">Execution Signature</span>
                        <span className="text-blue-500 font-semibold tracking-wider flex items-center gap-1 select-all">
                          <Hash className="w-3.5 h-3.5 opacity-60" />
                          {latestReport.verification.executionHash}
                        </span>
                      </div>
                      <div className="bg-black p-2 border border-[#27272a] rounded">
                        <span className="text-zinc-500 block mb-0.5">Replay Verification Sig</span>
                        <span className={`font-semibold tracking-wider flex items-center gap-1 select-all ${
                          latestReport.verification.replayStatus === "PASS" ? "text-emerald-400" : "text-red-400"
                        }`}>
                          <Hash className="w-3.5 h-3.5 opacity-60" />
                          {latestReport.verification.replayHash}
                        </span>
                      </div>
                    </div>

                    {/* Diff comparison visualization block */}
                    <div className="bg-black border border-[#27272a] rounded p-3 text-xs font-mono">
                      {latestReport.verification.replayStatus === "PASS" ? (
                        <div className="text-center py-4 space-y-2">
                          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                          <p className="text-zinc-300 font-semibold">Zero-Drift Execution Proof Valid</p>
                          <p className="text-[10px] text-zinc-500 max-w-[280px] mx-auto">Re-executing prompt state model verified exact byte-for-byte mathematical equivalence.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-red-400 font-bold">
                            <AlertTriangle className="w-4 h-4 animate-bounce" />
                            <span>Drift Warning Log:</span>
                          </div>
                          <p className="text-[11px] text-amber-200 bg-amber-950/20 border border-amber-500/20 p-2.5 rounded leading-relaxed select-all">
                            {latestReport.verification.replayDifference}
                          </p>
                          <span className="text-[10px] text-zinc-500 block">Verification Kernel enforces failure boundaries on ambient non-deterministic values.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub Tab Content: Evidence */}
                {activeSubTab === "evidence" && (
                  <div className="space-y-3">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block tracking-wider">Evidence Synthesis Mapping:</span>
                    
                    <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin">
                      {latestReport.evidence.correlation.map((ev, idx) => (
                        <div key={idx} className="bg-black border border-[#27272a] p-2 rounded flex items-center justify-between text-xs font-mono">
                          <div>
                            <span className="text-zinc-300 block font-semibold truncate max-w-[170px]">{ev.source}</span>
                            <span className="text-[10px] text-zinc-500">{ev.status} • Compliance: {ev.consistency}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-blue-500 block font-bold">{(ev.strength * 100).toFixed(0)}% Match</span>
                            <div className="w-16 bg-[#18181b] h-1 rounded-full overflow-hidden mt-1">
                              <div className="bg-blue-500 h-full" style={{ width: `${ev.strength * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Conflict detection alert block */}
                    <div className="bg-black border border-[#27272a] rounded p-2.5 text-xs font-mono flex items-start gap-2.5">
                      <Shield className={`w-4 h-4 mt-0.5 ${latestReport.evidence.conflict.hasConflict ? "text-amber-500" : "text-emerald-500"}`} />
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block tracking-wider">Conflict Detection Engine</span>
                        <p className={`text-[11px] leading-relaxed mt-0.5 ${latestReport.evidence.conflict.hasConflict ? "text-amber-200" : "text-zinc-400"}`}>
                          {latestReport.evidence.conflict.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Immutable Decision Hash Footer */}
              <div className="border-t border-[#27272a] pt-4 mt-4 font-mono text-[11px] text-zinc-500 flex justify-between items-center bg-black/40 p-2 rounded border">
                <span className="flex items-center gap-1.5 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  Decision Lock
                </span>
                <span className="text-zinc-300 tracking-wider font-semibold select-all">
                  {latestReport.verification.decisionHash}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Dynamic Simulation Terminal Log at Bottom */}
        <div className="bg-black border border-[#27272a] rounded-lg p-4 font-mono">
          <div className="flex items-center justify-between border-b border-[#18181b] pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">VEK Console Output logs (Real-time Audit Trail)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-emerald-500 tracking-wider">SYSTEM_LIVE</span>
            </div>
          </div>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto text-[11px] text-zinc-400 leading-relaxed scrollbar-thin">
            {customConsoleLogs.map((logStr, idx) => (
              <div key={idx} className="flex items-start gap-2 select-text hover:bg-zinc-900/10 p-0.5 rounded">
                <span className="text-zinc-600 font-bold shrink-0">{idx + 1}.</span>
                <span className={logStr.includes("[PASS]") ? "text-emerald-500 font-semibold" : logStr.includes("[CRITICAL_ERROR]") || logStr.includes("FAIL") ? "text-red-400 font-semibold font-mono" : "text-zinc-300"}>{logStr}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR: Status Overview Indicators */}
      <div className="space-y-6">
        
        {/* Verification Status Card */}
        <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest block mb-1">Governance Status</span>
          
          <AnimatePresence mode="wait">
            {latestReport ? (
              <motion.div
                key={latestReport.verification.status}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2 py-4"
              >
                <div className={`text-4xl font-extrabold font-mono tracking-tighter ${
                  latestReport.verification.status === "PASS" ? "text-emerald-500" : "text-red-500"
                }`}>
                  {latestReport.verification.status}
                </div>
                <div className="text-xs text-zinc-400 max-w-[180px] mx-auto font-mono">
                  {latestReport.verification.status === "PASS" 
                    ? "Execution complies with safety rules and state replays." 
                    : "Failure detected: Replay mismatch or rule conflict."}
                </div>
              </motion.div>
            ) : (
              <div className="py-8 text-zinc-600 font-mono text-xs">
                <HelpCircle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                Workspace Idle.<br />Submit prompt to start.
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Confidence Gauge Engine */}
        <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5 shadow-xl font-mono">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center justify-between border-b border-[#27272a] pb-2">
            <span>Confidence Engine</span>
            {latestReport && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                latestReport.confidence.level === "Very High" ? "text-emerald-400 bg-emerald-950/20" :
                latestReport.confidence.level === "High" ? "text-blue-400 bg-blue-950/20" :
                latestReport.confidence.level === "Medium" ? "text-amber-400 bg-amber-950/20" : "text-red-400 bg-red-950/20"
              }`}>
                {latestReport.confidence.level}
              </span>
            )}
          </h3>

          {latestReport ? (
            <div className="space-y-4">
              {/* Score Big Indicator */}
              <div className="flex items-baseline justify-between border-b border-[#18181b] pb-2">
                <span className="text-3xl font-bold text-white tracking-tight">{latestReport.confidence.score}%</span>
                <span className="text-[10px] text-zinc-500">Aggregate Integrity</span>
              </div>

              {/* Sub-scores sliders */}
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>Evidence Support:</span>
                    <span className="text-zinc-300 font-bold">{latestReport.confidence.metrics.evidenceSupport}%</span>
                  </div>
                  <div className="w-full bg-black h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${latestReport.confidence.metrics.evidenceSupport}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>State Consistency:</span>
                    <span className="text-zinc-300 font-bold">{latestReport.confidence.metrics.consistency}%</span>
                  </div>
                  <div className="w-full bg-black h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: `${latestReport.confidence.metrics.consistency}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>Risk Margin Separation:</span>
                    <span className="text-zinc-300 font-bold">{latestReport.confidence.metrics.alternativeSeparation}%</span>
                  </div>
                  <div className="w-full bg-black h-1 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: `${latestReport.confidence.metrics.alternativeSeparation}%` }} />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed bg-black p-2.5 rounded border border-[#27272a] italic">
                {latestReport.confidence.explanation}
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-600 text-xs">
              Waiting for analysis...
            </div>
          )}
        </div>

        {/* Verification Summary Bulletins (Warnings & Next Steps) */}
        {latestReport && (
          <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5 shadow-xl font-mono text-xs space-y-4">
            
            {/* Warnings List */}
            <div>
              <span className="text-zinc-500 uppercase tracking-widest block mb-2 font-bold text-[9px]">Warnings / Exceptions:</span>
              {latestReport.warnings.length > 0 ? (
                <div className="space-y-1.5">
                  {latestReport.warnings.map((warn, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-amber-400 bg-amber-950/10 border border-amber-500/20 p-2 rounded">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="text-[10px] leading-tight">{warn}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-emerald-400 block bg-emerald-950/10 border border-emerald-500/10 p-2 rounded text-[10px]">
                  ✓ Zero warnings detected.
                </span>
              )}
            </div>

            {/* Next Steps List */}
            <div>
              <span className="text-zinc-500 uppercase tracking-widest block mb-2 font-bold text-[9px]">Engineering Next Steps:</span>
              <ul className="space-y-2">
                {latestReport.suggestedNextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-1 text-zinc-300 leading-snug">
                    <span className="text-blue-500 font-bold shrink-0">→</span>
                    <span className="text-[11px]">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Live Immutable Ledger Snippet */}
        <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5 shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-2 mb-3">
            <span className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Active Session Log</span>
            <span className="text-[9px] text-zinc-500">Count: {ledger.length}</span>
          </div>
          <div className="space-y-2.5 max-h-[180px] overflow-y-auto scrollbar-thin">
            {ledger.slice(0, 4).map((record, idx) => (
              <div key={idx} className="border-b border-[#27272a]/40 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-blue-500">{record.id}</span>
                  <span className={record.status === "PASS" ? "text-emerald-500" : "text-red-500"}>
                    {record.status}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate mt-0.5">{record.prompt}</p>
                <div className="flex items-center justify-between text-[9px] text-zinc-600 mt-1">
                  <span>Hash: {record.executionHash}</span>
                  <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
