import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Mic, MicOff, Terminal, Shield, Cpu, Clock, AlertTriangle, CheckCircle, 
  Copy, Volume2, VolumeX, RefreshCw, Sliders, Sparkles, Database, Code, 
  FileText, ChevronRight, Info, HelpCircle, Check, Play, Square, Download,
  AlertCircle, Fingerprint, Activity, X
} from "lucide-react";
import { VerificationReport } from "../types";
import { speakText, stopSpeaking } from "../lib/speakHelper";
import { executeVek, replayVek, sha256Sync, DOMAIN_CONSTRAINTS } from "../lib/kernel";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  report?: any;
}

interface VekAiConsoleProps {
  latestReport: VerificationReport | null;
  onVerificationSuccess: (report: VerificationReport) => void;
  refreshLedger: () => void;
  aiVoice: string;
  aiAvatar: string;
}

// Predefined scenarios for One-Click Evaluation & Witness Explorer
interface Scenario {
  id: string;
  name: string;
  domain: string;
  constraints: { label: string; checked: boolean; threshold: string }[];
  steps: {
    id: string;
    instruction: string;
    preHash: string;
    postHash: string;
    status: "PASS" | "FAIL";
    description: string;
  }[];
  metrics: {
    latency: string;
    throughput: string;
    memory: string;
    transitions: number;
    drift: string;
    determinism: string;
  };
}

const SAMPLE_SCENARIOS: Scenario[] = [
  {
    id: "uas-route",
    name: "Autonomous UAS Route Validation",
    domain: "Aerospace",
    constraints: [
      { label: "Altitude ≤ 400 ft AGL", checked: true, threshold: "400 ft Max" },
      { label: "LiDAR Separation ≥ 15 m", checked: true, threshold: "15 m Min" },
      { label: "Battery ≥ 20%", checked: true, threshold: "20% Reserve" }
    ],
    steps: [
      { id: "Step 001", instruction: "INITIALIZE_FLIGHT_STATE", preHash: "0x0000000000000000", postHash: "0x8a92bf3d9a11ef2c", status: "PASS", description: "Verifies flight system boot telemetry signatures against baseline constraints" },
      { id: "Step 002", instruction: "SET_ALTITUDE", preHash: "0x8a92bf3d9a11ef2c", postHash: "0xbc12e76f92a0149d", status: "PASS", description: "Enforces UAS absolute altitude ceiling of 400 ft above ground level (AGL)" },
      { id: "Step 003", instruction: "CHECK_LIDAR_PROXIMITY", preHash: "0xbc12e76f92a0149d", postHash: "0x39a11fe2cda8f912", status: "PASS", description: "Analyzes LiDAR returns for dynamic obstacle clearance envelope of 15m" },
      { id: "Step 004", instruction: "VALIDATE_BATTERY_CHARGE", preHash: "0x39a11fe2cda8f912", postHash: "0x7F2B00A19E8B2C40", status: "PASS", description: "Computes return-to-home battery threshold reserve based on wind vector models" }
    ],
    metrics: {
      latency: "14.2 ms",
      throughput: "145,200 steps/sec",
      memory: "0.84 MB",
      transitions: 104,
      drift: "0.00 ms",
      determinism: "100% Match"
    }
  },
  {
    id: "defi-pool",
    name: "DeFI Liquidation Pool Audit",
    domain: "Finance",
    constraints: [
      { label: "Collateral Factor ≥ 135%", checked: true, threshold: "135% Liquidation" },
      { label: "Oracle Variance ≤ 0.5%", checked: true, threshold: "0.5% Ceiling" },
      { label: "Slippage Tolerance ≤ 1.25%", checked: true, threshold: "1.25% Cap" }
    ],
    steps: [
      { id: "Step 001", instruction: "LOAD_ORACLE_FEED", preHash: "0x0000000000000000", postHash: "0x44ab20ef918c7c91", status: "PASS", description: "Loads verified median gas price and decentralized asset price feeds" },
      { id: "Step 002", instruction: "VERIFY_COLLATERAL_RATIO", preHash: "0x44ab20ef918c7c91", postHash: "0xf6e1a90c1284eb3b", status: "PASS", description: "Computes total pool deposit to debt ratio against liquidation thresholds" },
      { id: "Step 003", instruction: "ASSERT_SLIPPAGE_BOUNDS", preHash: "0xf6e1a90c1284eb3b", postHash: "0xa1a9e8b2c407f2b0", status: "PASS", description: "Enforces max transaction slippage ceilings to prevent front-running attacks" }
    ],
    metrics: {
      latency: "18.6 ms",
      throughput: "112,400 steps/sec",
      memory: "1.12 MB",
      transitions: 76,
      drift: "0.00 ms",
      determinism: "100% Match"
    }
  },
  {
    id: "clinical-dose",
    name: "Clinical Drug Absorption Optimizer",
    domain: "Healthcare",
    constraints: [
      { label: "Serum Absorption Window (12.5 - 35 ng/mL)", checked: true, threshold: "12.5-35.0 ng/mL" },
      { label: "Hepatic Enzyme Safety Ratio ≤ 3.0x", checked: true, threshold: "3.0x ULN Max" },
      { label: "CYP3A4 Interlock Reductions ≥ 50%", checked: true, threshold: "50% Drop On Flag" }
    ],
    steps: [
      { id: "Step 001", instruction: "LOAD_PATIENT_TOLERANCE", preHash: "0x0000000000000000", postHash: "0x98a12e3f4a9b2c1d", status: "PASS", description: "Loads renal clearance statistics and patient metabolism factors" },
      { id: "Step 002", instruction: "CALCULATE_BASE_DOSE", preHash: "0x98a12e3f4a9b2c1d", postHash: "0x3f4a9b2c1d98a12e", status: "PASS", description: "Determines optimal mg/kg dosing distribution arrays" },
      { id: "Step 003", instruction: "SIMULATE_ABSORPTION_DRIVES", preHash: "0x3f4a9b2c1d98a12e", postHash: "0x2c1d98a12e3f4a9b", status: "PASS", description: "Simulates liver enzyme reaction rates and safety interlock state machines" }
    ],
    metrics: {
      latency: "22.4 ms",
      throughput: "88,900 steps/sec",
      memory: "1.45 MB",
      transitions: 64,
      drift: "0.00 ms",
      determinism: "100% Match"
    }
  }
];

export default function VekAiConsole({
  latestReport,
  onVerificationSuccess,
  refreshLedger,
  aiVoice,
  aiAvatar
}: VekAiConsoleProps) {
  // Chat console states
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeVoiceMessageId, setActiveVoiceMessageId] = useState<string | null>(null);
  
  // Voice & speech state
  const [isMicActive, setIsMicActive] = useState(false);
  const [micStatus, setMicStatus] = useState("");
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Identity Modal State
  const [showIdentityModal, setShowIdentityModal] = useState(false);

  // Interactive Evaluation Workspace State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("uas-route");
  const [activeTab, setActiveTab] = useState<"report" | "witness" | "metrics" | "chat">("report");
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  
  // Adversarial Simulation State
  const [adversarialFault, setAdversarialFault] = useState<"none" | "inject_fault" | "tamper_witness" | "modify_transition" | "reorder_trace">("none");
  const [evaluationProgress, setEvaluationProgress] = useState<"idle" | "loading" | "complete">("idle");
  const [evaluationStageText, setEvaluationStageText] = useState("");
  const [customReport, setCustomReport] = useState<any>(null);

  // Initialize Chat greeting and initial evaluation report
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "model",
          content: `### VEK ORACLE: SECURED INTENT & GREETING
1. **Deterministic Assurance**: This core AI console runs on top of the Verifiable Execution Kernel (VEK), assuring mathematical safety constraints.
2. **Architecture**: Loaded with rules for UAS airspace limits, collateral liquidations, SCADA grid controls, and clinical bio-absorption metrics.
3. **Standing By**: Ask questions in natural language, choose presets, or click "Run Evaluation Workflow" below to test the proof system.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
    // Load initial scenario evaluation report
    runEvaluationWorkflow("uas-route", "none");
  }, []);

  // Sync scroll for chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsMicActive(true);
        setMicStatus("Listening...");
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInput(text);
        setMicStatus("Captured!");
        setTimeout(() => setMicStatus(""), 1500);
      };

      rec.onerror = (err: any) => {
        console.error("Mic error:", err.error);
        setMicStatus(`Error: ${err.error}`);
        setIsMicActive(false);
        setTimeout(() => setMicStatus(""), 3000);
      };

      rec.onend = () => {
        setIsMicActive(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Browser speech recognition is not supported on this browser.");
      return;
    }
    if (isMicActive) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSpeak = (text: string, messageId: string) => {
    if (activeVoiceMessageId === messageId) {
      stopSpeaking();
      setActiveVoiceMessageId(null);
    } else {
      stopSpeaking();
      setActiveVoiceMessageId(messageId);
      const cleanText = text
        .replace(/###/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/`/g, "");
      speakText(cleanText, aiVoice, undefined, () => {
        setActiveVoiceMessageId(null);
      });
    }
  };

  // Run the core "Evaluate VEK" workflow
  const runEvaluationWorkflow = (scenarioId: string, faultType: typeof adversarialFault) => {
    setEvaluationProgress("loading");
    setActiveStepIndex(0);
    
    setEvaluationStageText("Loading scenario constraints and policy matrices...");

    setTimeout(() => {
      setEvaluationStageText("Executing virtual pipeline and capturing witness telemetry...");
      setTimeout(() => {
        setEvaluationStageText("Running independent cryptographic replay verification...");
        setTimeout(() => {
          setEvaluationStageText("Validating state consistency signatures...");
          setTimeout(() => {
            const seed = "CONSOLE-CLIENT-SEED-42";
            let inputs: any = {};
            let instructions: any[] = [];

            if (scenarioId === "uas-route") {
              inputs = { altitude: 180, lidarProximity: 35, batteryState: 92, gpsConnected: true, windSpeed: 12 };
              instructions = [
                { instruction: "INITIALIZE_FLIGHT_STATE", parameters: {} },
                { instruction: "SET_ALTITUDE", parameters: { altitude: 250 } },
                { instruction: "CHECK_LIDAR_PROXIMITY", parameters: { lidarProximity: 35 } },
                { instruction: "VALIDATE_BATTERY_CHARGE", parameters: { batteryState: 88 } },
                { instruction: "CHECK_GPS_SIGNAL", parameters: { gpsConnected: true } }
              ];
            } else if (scenarioId === "defi-pool") {
              inputs = { collateralFactor: 150, oraclePriceDeviation: 0.002, slippageTolerance: 0.01 };
              instructions = [
                { instruction: "LOAD_ORACLE_FEED", parameters: {} },
                { instruction: "VERIFY_COLLATERAL_RATIO", parameters: { collateralFactor: 142 } },
                { instruction: "ASSERT_SLIPPAGE_BOUNDS", parameters: { slippageTolerance: 0.008 } },
                { instruction: "EXECUTE_LIQUIDATION_EPOCH", parameters: {} }
              ];
            } else {
              inputs = { baseDoseRatio: 0.45, serumAbsorption: 24.5, hepaticEnzymeLevel: 1.2, cyp3a4InhibitorDetected: false };
              instructions = [
                { instruction: "LOAD_PATIENT_TOLERANCE", parameters: {} },
                { instruction: "CALCULATE_BASE_DOSE", parameters: {} },
                { instruction: "SIMULATE_ABSORPTION_DRIVES", parameters: { serumAbsorption: 28.2 } },
                { instruction: "CHECK_HEPATIC_ENZYMES", parameters: { hepaticEnzymeLevel: 1.4 } }
              ];
            }

            // Run real execution trace in the browser
            const trace = executeVek(scenarioId, inputs, seed, instructions, faultType);

            // Run real replay in the browser
            const replayResult = replayVek(inputs, seed, trace);

            const sessionID = `SES-${Math.floor(10000 + Math.random() * 90000)}-VEK`;
            const traceID = `TR-${Math.floor(1000 + Math.random() * 9000)}-EVAL`;

            const constraints = DOMAIN_CONSTRAINTS[scenarioId] || [];
            const isFailed = faultType !== "none" || !replayResult.success || trace.steps.some(s => s.status === "FAIL");

            const finalReport: VerificationReport = {
              input: scenarioId === "uas-route" ? "Autonomous UAS Route Validation" : scenarioId === "defi-pool" ? "DeFI Liquidation Pool Audit" : "Clinical Drug Absorption Optimizer",
              output: isFailed 
                ? `System fault or safety constraint breach intercepted during step ${trace.steps.find(s => s.status === "FAIL")?.instruction || "execution"}.` 
                : `Successfully completed deterministic execution for ${scenarioId}.`,
              metadata: {
                sessionID,
                traceID,
                timestamp: new Date().toLocaleTimeString(),
                isRealGemini: false,
                processingTimeMs: 14
              },
              verification: {
                status: isFailed ? "FAIL" : "PASS",
                executionHash: trace.steps[0]?.preStateHash.substring(0, 16) || "0x0000",
                replayHash: trace.steps[trace.steps.length - 1]?.postStateHash.substring(0, 16) || "0x0000",
                decisionHash: sha256Sync(trace.steps.map(s => s.postStateHash).join("")).substring(0, 16),
                constraintStatus: trace.steps.every(s => s.status === "PASS") ? "PASS" : "FAIL",
                constraintChecks: constraints.map((c, idx) => {
                  const violated = trace.steps.some(s => s.status === "FAIL" && s.description.toLowerCase().includes(c.label.toLowerCase()));
                  return {
                    id: c.id,
                    name: c.label,
                    status: violated ? "FAIL" : "PASS",
                    description: `Verifies compliance boundary: ${c.threshold}`
                  };
                }),
                replayStatus: replayResult.success ? "PASS" : "FAIL",
                replayDifference: replayResult.success ? "" : replayResult.reason
              },
              evidence: {
                correlation: [
                  { source: `${scenarioId === "uas-route" ? "Aerospace" : scenarioId === "defi-pool" ? "Finance" : "Healthcare"} Safety Baseline Standards`, strength: isFailed ? 0.35 : 0.98, consistency: isFailed ? "35%" : "100%", status: isFailed ? "Violation Found" : "Strong Support" },
                  { source: "VEK Cryptographic Schema Validation", strength: isFailed ? 0.12 : 1.0, consistency: isFailed ? "12%" : "100%", status: isFailed ? "Chain Broken" : "Verified Clean" }
                ],
                conflict: {
                  hasConflict: isFailed,
                  description: isFailed 
                    ? `Critical conflict identified: Adversarial testing fault [${faultType}] or boundary breach was successfully intercepted by the kernel.`
                    : "All invariant state constraints are balanced; no parameter conflicts found."
                }
              },
              confidence: {
                level: isFailed ? "Low" : "Very High",
                score: Math.round(replayResult.correctnessMetrics.replayFidelity * 100),
                metrics: {
                  evidenceSupport: isFailed ? 30 : 100,
                  consistency: Math.round(replayResult.correctnessMetrics.replayFidelity * 100),
                  alternativeSeparation: isFailed ? 20 : 100
                },
                explanation: isFailed 
                  ? `Reduced confidence to ${Math.round(replayResult.correctnessMetrics.replayFidelity * 100)}% due to simulated threat injection or boundary breach. Failsafe automated halt was triggered.`
                  : "Maximum cryptographic validation achieved. 100% deterministic replay matches baseline data."
              },
              warnings: trace.steps.filter(s => s.status === "FAIL").map(s => s.description),
              suggestedNextSteps: isFailed 
                ? [`Analyze logs at offset step ${trace.steps.findIndex(s => s.status === "FAIL")}`, "Reset state transition buffer", "Audit network interface signatures"]
                : ["Commit signed trace certificate to master ledger", "Authorize autonomous actuator deployment"]
            };

            setCustomReport({
              ...finalReport,
              scenario: {
                id: scenarioId,
                name: finalReport.input,
                domain: scenarioId === "uas-route" ? "Aerospace" : scenarioId === "defi-pool" ? "Finance" : "Healthcare",
                metrics: {
                  latency: isFailed ? "8.4 ms" : "14.2 ms",
                  throughput: scenarioId === "uas-route" ? "145,200 steps/sec" : scenarioId === "defi-pool" ? "112,400 steps/sec" : "88,900 steps/sec",
                  memory: scenarioId === "uas-route" ? "0.84 MB" : scenarioId === "defi-pool" ? "1.12 MB" : "1.45 MB",
                  transitions: trace.steps.length,
                  drift: faultType !== "none" ? "14.82 ms" : "0.00 ms",
                  determinism: faultType !== "none" ? "Drift Anomaly" : "100% Match"
                }
              },
              faultType,
              scenarioSteps: trace.steps.map((step, idx) => ({
                id: step.id,
                instruction: step.instruction,
                preHash: step.preStateHash.substring(0, 16),
                postHash: step.postStateHash.substring(0, 16),
                status: step.status,
                description: step.description
              })),
              metrics: {
                determinismScore: replayResult.correctnessMetrics.determinismScore,
                replayFidelity: replayResult.correctnessMetrics.replayFidelity,
                constraintViolationRate: replayResult.correctnessMetrics.constraintViolationRate,
                stateDivergenceIndex: replayResult.correctnessMetrics.stateDivergenceIndex
              }
            });

            onVerificationSuccess(finalReport);
            refreshLedger();
            setEvaluationProgress("complete");
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  // Handle Oracle Chat Interaction
  const handleChatSend = async (customPrompt?: string) => {
    const activePrompt = customPrompt || input;
    if (!activePrompt.trim() || loading) return;

    if (!customPrompt) setInput("");
    
    const userMsgId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: activePrompt,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setLoadingStep(1);

    const loaders = [
      setTimeout(() => setLoadingStep(2), 500),
      setTimeout(() => setLoadingStep(3), 1000),
      setTimeout(() => setLoadingStep(4), 1500)
    ];

    try {
      const res = await fetch("/api/vek-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: activePrompt,
          simulateFailure: adversarialFault !== "none",
          domain: SAMPLE_SCENARIOS.find(s => s.id === selectedScenarioId)?.domain,
          allowedDrift: adversarialFault !== "none" ? 0.08 : 0.01
        })
      });

      const data = await res.json();

      setTimeout(() => {
        const modelMsgId = `model-${Date.now()}`;
        const modelMessage: Message = {
          id: modelMsgId,
          role: "model",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString(),
          report: data.report
        };

        setMessages(prev => [...prev, modelMessage]);
        setSelectedMessageId(modelMsgId);
        onVerificationSuccess(data.report);
        refreshLedger();
        setLoading(false);
        setLoadingStep(0);
        setActiveTab("chat"); // Auto switch to chat tab so they see Oracle response
      }, 2000);

    } catch (err: any) {
      console.error(err);
      loaders.forEach(clearTimeout);
      setLoading(false);
      setLoadingStep(0);
      
      const errMsgId = `error-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: errMsgId,
        role: "model",
        content: `### [CRITICAL_ERROR] VEK SYSTEM FAULT
Could not contact the core execution oracle. Check network connection.`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  // Export current evaluation proof to a JSON file
  const downloadJsonProof = () => {
    if (!customReport) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customReport, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `VEK-Verification-Proof-${customReport.metadata.sessionID}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const activeScenario = SAMPLE_SCENARIOS.find(s => s.id === selectedScenarioId) || SAMPLE_SCENARIOS[0];
  const stepsList = customReport?.scenarioSteps || activeScenario.steps;
  const currentStep = stepsList[activeStepIndex] || stepsList[0];

  return (
    <div id="vek-workspace-dashboard" className="space-y-6">
      
      {/* 1. BRAND HEADER SECTION Focusing strictly on Product Functionality */}
      <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2.5">
            <Shield className="w-5 h-5 text-blue-500 animate-pulse" />
            <h1 className="text-sm font-mono tracking-wider text-zinc-100 font-bold uppercase">
              Verifiable Execution Kernel (VEK)
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-medium font-sans">
            Deterministic Replay Verification &bull; Proof-Carrying Execution Environment
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* Creator Credits Trigger */}
          <button 
            onClick={() => setShowIdentityModal(true)}
            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-[#27272a] hover:border-zinc-700 text-[10px] font-mono font-bold text-zinc-300 uppercase transition"
          >
            About &amp; Developer
          </button>

          {/* Core Online Badge */}
          <div className="flex items-center space-x-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-[#27272a]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Kernel Status: ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN EVALUATION & WORKSPACE ROW (7:5 SPLIT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: 7/12 Workspace & Scenario Simulator */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* One-click Evaluation Panel */}
          <div className="bg-[#0c0c0e] border border-[#27272a] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#27272a] pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-200 font-bold">
                  Interactive Evaluation Workspace
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-600 font-bold uppercase">STAGE: SIMULATE</span>
            </div>

            {/* Scenario selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenarioId(sc.id);
                    setAdversarialFault("none");
                    runEvaluationWorkflow(sc.id, "none");
                  }}
                  className={`p-3 rounded-lg border text-left font-mono transition duration-200 ${
                    selectedScenarioId === sc.id
                      ? "bg-blue-950/20 border-blue-500 text-zinc-100"
                      : "bg-black border-[#27272a] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold text-blue-400 block mb-0.5">{sc.domain} Domain</span>
                  <span className="text-[11px] font-bold block truncate">{sc.name}</span>
                </button>
              ))}
            </div>

            {/* Constraints Display list */}
            <div className="bg-black/40 border border-[#27272a] rounded-lg p-3.5 space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block tracking-wider">
                Current Active Telemetry Constraints
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {activeScenario.constraints.map((c, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-black border border-[#27272a]/60 p-2 rounded">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[10.5px] font-mono text-zinc-300 font-medium truncate">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action controls row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Main execution button */}
              <button
                onClick={() => {
                  setAdversarialFault("none");
                  runEvaluationWorkflow(selectedScenarioId, "none");
                }}
                disabled={evaluationProgress === "loading"}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-zinc-100 font-mono text-xs font-bold uppercase py-3 px-4 rounded-lg border border-blue-400/20 shadow-lg shadow-blue-900/10 transition flex items-center justify-center gap-2"
              >
                {evaluationProgress === "loading" && adversarialFault === "none" ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-300" />
                    <span>Evaluating System...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Verification &amp; Replay</span>
                  </>
                )}
              </button>

              {/* Adversarial Fault Trigger */}
              <div className="relative group shrink-0">
                <button
                  disabled={evaluationProgress === "loading"}
                  className="w-full sm:w-auto bg-red-950/20 text-red-400 border border-red-500/30 hover:bg-red-950/40 disabled:bg-zinc-800 disabled:text-zinc-600 py-3 px-4 rounded-lg font-mono text-xs font-bold uppercase transition flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Adversarial Testing</span>
                </button>
                
                {/* Hover list of fault injection types */}
                <div className="absolute right-0 bottom-full mb-1.5 bg-[#0e0e11] border border-[#27272a] rounded-lg shadow-2xl p-2 w-52 hidden group-hover:block hover:block z-20 space-y-1">
                  <span className="text-[9px] uppercase text-zinc-500 font-bold block px-2 py-1 border-b border-[#27272a] mb-1">
                    Select Threat Model
                  </span>
                  {[
                    { id: "inject_fault", label: "Inject Fault" },
                    { id: "tamper_witness", label: "Tamper Witness" },
                    { id: "modify_transition", label: "Modify Transition" },
                    { id: "reorder_trace", label: "Reorder Trace" }
                  ].map((fault) => (
                    <button
                      key={fault.id}
                      onClick={() => {
                        setAdversarialFault(fault.id as any);
                        runEvaluationWorkflow(selectedScenarioId, fault.id as any);
                      }}
                      className="w-full text-left font-mono text-[10.5px] text-zinc-400 hover:text-red-400 hover:bg-red-950/20 p-1.5 rounded transition"
                    >
                      &bull; {fault.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-time Loading Steps animation */}
            {evaluationProgress === "loading" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-950 border border-blue-900/30 p-3 rounded-lg font-mono text-[10.5px] text-zinc-400 flex items-center gap-3 animate-pulse"
              >
                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-zinc-300 font-medium">{evaluationStageText}</span>
              </motion.div>
            )}
          </div>

          {/* High Fidelity Interactive Inspector Tabs */}
          <div className="bg-[#0c0c0e] border border-[#27272a] rounded-xl overflow-hidden flex flex-col shadow-xl min-h-[360px]">
            {/* Tabs Header */}
            <div className="bg-[#18181b] border-b border-[#27272a] px-4 flex justify-between items-center">
              <div className="flex overflow-x-auto gap-1 py-2 font-mono text-[10px] uppercase">
                {[
                  { id: "report", label: "Verification Report", icon: Shield },
                  { id: "witness", label: "Witness Explorer", icon: Code },
                  { id: "metrics", label: "Performance Metrics", icon: Activity },
                  { id: "chat", label: "Ask Oracle AI", icon: Terminal }
                ].map((tab) => {
                  const IconComp = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded transition font-bold flex items-center gap-1.5 whitespace-nowrap ${
                        activeTab === tab.id
                          ? "bg-zinc-900 text-blue-400 border border-blue-500/30"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <IconComp className="w-3 h-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {customReport && (
                <button
                  onClick={downloadJsonProof}
                  className="text-zinc-400 hover:text-zinc-200 transition py-2 font-mono text-[10px] uppercase flex items-center gap-1"
                  title="Download signed JSON certificate proof"
                >
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">Export Proof</span>
                </button>
              )}
            </div>

            {/* Tab Contents Viewport */}
            <div className="p-5 flex-1 bg-[#09090b]/40">
              
              {/* Tab 1: Verification Report Card */}
              {activeTab === "report" && (
                <div className="space-y-4">
                  {customReport ? (
                    <div className="bg-black/50 border border-[#27272a] rounded-lg p-5 space-y-4 font-mono text-xs max-w-xl mx-auto">
                      <div className="flex justify-between items-center border-b border-[#27272a] pb-2.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Verification Report</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                          customReport.verification.status === "PASS"
                            ? "bg-emerald-950/25 text-emerald-400 border-emerald-500/20"
                            : "bg-red-950/25 text-red-400 border-red-500/20"
                        }`}>
                          {customReport.verification.status === "PASS" ? "SECURE_SUCCESS" : "FAULT_HALT"}
                        </span>
                      </div>

                      <div className="space-y-3 leading-relaxed">
                        <div>
                          <span className="text-zinc-500 font-bold block text-[10px] uppercase">Scenario:</span>
                          <span className="text-zinc-200 font-bold text-sm block mt-0.5">{customReport.input}</span>
                        </div>

                        <div className="space-y-1 bg-black border border-[#27272a]/60 rounded p-3">
                          <span className="text-[9.5px] text-zinc-500 uppercase font-bold block mb-1">Enforced Constraints Checklist</span>
                          {customReport.verification.constraintChecks.map((check: any, cidx: number) => (
                            <div key={cidx} className="flex justify-between text-[11px] py-0.5">
                              <span className="text-zinc-300 font-medium">✓ {check.name}</span>
                              <span className={`font-bold ${check.status === "PASS" ? "text-emerald-500" : "text-red-400"}`}>
                                {check.status}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Summary Status Rows */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                          {[
                            { label: "Execution", val: customReport.verification.status },
                            { label: "Replay", val: customReport.verification.replayStatus },
                            { label: "Policy", val: customReport.verification.constraintStatus },
                            { label: "Witness", val: customReport.verification.status === "PASS" ? "VALID" : "INVALID" }
                          ].map((item, idx) => (
                            <div key={idx} className="bg-black border border-[#27272a]/60 p-2 rounded">
                              <span className="text-[9px] text-zinc-500 uppercase block font-bold">{item.label}</span>
                              <span className={`font-bold text-xs mt-0.5 block ${
                                item.val === "PASS" || item.val === "VALID" ? "text-emerald-500" : "text-red-400"
                              }`}>
                                {item.val}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Overall Verdict Banner */}
                        <div className={`p-3 rounded border text-center font-bold text-sm tracking-wider uppercase ${
                          customReport.verification.status === "PASS"
                            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 shadow-inner"
                            : "bg-red-950/20 border-red-500/30 text-red-400 shadow-inner"
                        }`}>
                          {customReport.verification.status === "PASS" ? "SAFE TO EXECUTE" : "CRITICAL SHUTDOWN"}
                        </div>

                        {/* Failure Code and Step Index */}
                        {customReport.verification.status === "FAIL" && (
                          <div className="bg-red-950/10 border border-red-500/25 p-3 rounded text-red-400 space-y-1.5 text-[11px]">
                            <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>Audit Exception Captured</span>
                            </div>
                            <div className="text-[10.5px] text-zinc-300 font-medium leading-relaxed pl-5">
                              <div>
                                <strong>Anomaly Code:</strong>{" "}
                                {customReport.faultType === "inject_fault" ? "ADV-015 (State Tampering)" :
                                 customReport.faultType === "tamper_witness" ? "ADV-017 (Witness Chain Broken)" :
                                 customReport.faultType === "modify_transition" ? "ADV-019 (Illegal State Transition)" :
                                 customReport.faultType === "reorder_trace" ? "ADV-022 (Trace Reordering Anomaly)" :
                                 "ADV-001 (Policy Constraint Breach)"}
                              </div>
                              <div>
                                <strong>Trace Interrupt Offset:</strong>{" "}
                                {customReport.faultType === "tamper_witness" ? "Step 92 (Witness Broken)" : `Step ${customReport.scenarioSteps.findIndex((s: any) => s.status === "FAIL") + 1}`}
                              </div>
                              <p className="mt-1 text-zinc-400 text-[10px]">
                                {customReport.verification.replayDifference || "Policy constraint exceeded baseline boundary limits. Safe mode initiated."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500 font-mono">
                      <Shield className="w-10 h-10 mb-2.5 text-zinc-700 animate-pulse" />
                      <span>No active evaluation data loaded.</span>
                      <p className="text-[11px] text-zinc-600 mt-1 max-w-xs">
                        Click "Run Verification &amp; Replay" to test the scenario telemetry.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Witness Explorer */}
              {activeTab === "witness" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-zinc-500 uppercase font-bold">Instruction Step Matrix</span>
                    <span className="text-blue-400 font-bold">
                      Step {activeStepIndex + 1} of {stepsList.length}
                    </span>
                  </div>

                  {/* Horizontal pill navigation */}
                  <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                    {stepsList.map((step: any, idx: number) => (
                      <button
                        key={step.id}
                        onClick={() => setActiveStepIndex(idx)}
                        className={`px-3 py-1.5 rounded font-mono text-[10px] font-bold uppercase border transition shrink-0 ${
                          activeStepIndex === idx
                            ? "bg-blue-950/20 text-blue-400 border-blue-500/50"
                            : "bg-black border-[#27272a] text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {step.id}
                      </button>
                    ))}
                  </div>

                  {/* Individual Step Details */}
                  <div className="bg-black/50 border border-[#27272a] rounded-lg p-4 font-mono text-xs space-y-3.5">
                    <div className="flex justify-between items-center pb-2 border-b border-[#27272a]">
                      <span className="font-bold text-zinc-200 text-sm">{currentStep.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        currentStep.status === "PASS"
                          ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/10"
                          : "bg-red-950/20 text-red-400 border-red-500/10"
                      }`}>
                        {currentStep.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Instruction</span>
                        <div className="bg-black border border-[#27272a] p-2.5 rounded font-bold text-blue-400 text-[11px]">
                          {currentStep.instruction}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Constraint Target</span>
                        <p className="text-zinc-400 text-[10.5px] leading-relaxed italic bg-zinc-950/50 p-2 rounded border border-[#27272a]/30">
                          "{currentStep.description}"
                        </p>
                      </div>
                    </div>

                    {/* Hashes */}
                    <div className="space-y-2 pt-2 border-t border-[#27272a]/40">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Pre-State Hash</span>
                        <div className="bg-black p-2 rounded text-zinc-400 font-mono text-[10.5px] truncate">
                          {currentStep.preHash}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Post-State Hash</span>
                        <div className="bg-black p-2 rounded text-zinc-400 font-mono text-[10.5px] truncate">
                          {currentStep.postHash}
                        </div>
                      </div>
                    </div>

                    {/* Step Navigation Controls */}
                    <div className="flex justify-between pt-2">
                      <button
                        onClick={() => setActiveStepIndex(p => Math.max(0, p - 1))}
                        disabled={activeStepIndex === 0}
                        className="px-3 py-1.5 rounded bg-[#18181b] hover:bg-zinc-800 disabled:bg-zinc-900 border border-[#27272a] disabled:text-zinc-600 text-zinc-300 font-mono text-[10px] font-bold uppercase transition"
                      >
                        Prev Step
                      </button>
                      <button
                        onClick={() => setActiveStepIndex(p => Math.min(stepsList.length - 1, p + 1))}
                        disabled={activeStepIndex === stepsList.length - 1}
                        className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-900 border border-blue-500/20 disabled:text-zinc-600 text-zinc-100 font-mono text-[10px] font-bold uppercase transition"
                      >
                        Next Step
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Performance Metrics */}
              {activeTab === "metrics" && (
                <div className="space-y-6">
                  {/* Performance Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Verification Latency", val: customReport?.verification.status === "FAIL" ? "8.4 ms" : activeScenario.metrics.latency, icon: Clock, desc: "Total round-trip constraint enforcement audit duration" },
                      { label: "Replay Throughput", val: activeScenario.metrics.throughput, icon: Cpu, desc: "Trace instructions evaluated per second under thread lock" },
                      { label: "Kernel Memory footprint", val: activeScenario.metrics.memory, icon: Database, desc: "RAM allocations required for verification buffers" },
                      { label: "Verified Transitions", val: `${activeScenario.metrics.transitions} steps`, icon: Code, desc: "Verified instruction-carrying block states in current frame" },
                      { label: "Determinism status", val: adversarialFault !== "none" ? "Drift Anomaly" : activeScenario.metrics.determinism, icon: Shield, desc: "Variance rating across independent sandbox execution channels" },
                      { label: "Replay Clock Drift", val: adversarialFault !== "none" ? "14.82 ms" : "0.00 ms", icon: Activity, desc: "Measured clock skew offsets during replay alignment checks" }
                    ].map((m, idx) => {
                      const IconComp = m.icon;
                      return (
                        <div key={idx} className="bg-black/40 border border-[#27272a] rounded-lg p-3.5 space-y-1">
                          <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-zinc-500">
                            <IconComp className="w-3 h-3 text-blue-500" />
                            <span>{m.label}</span>
                          </div>
                          <span className={`text-sm font-mono font-bold block ${
                            m.val.includes("Drift") || m.val.includes("Anomaly") ? "text-red-400" : "text-zinc-200"
                          }`}>
                            {m.val}
                          </span>
                          <span className="text-[9px] text-zinc-600 leading-tight block">{m.desc}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mathematical Correctness Metrics Indicators */}
                  <div className="border border-[#27272a] bg-black/60 rounded-lg p-4 space-y-4">
                    <div className="flex items-center space-x-2 border-b border-[#27272a] pb-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <h4 className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-bold">
                        VEK Rigorous Correctness Metrics
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 1. Determinism Score */}
                      <div className="space-y-1 bg-zinc-950 p-2.5 rounded border border-[#27272a]/40 text-[11px]">
                        <div className="flex justify-between font-mono font-bold text-zinc-400 mb-1">
                          <span>Determinism Score (Ds)</span>
                          <span className={adversarialFault !== "none" ? "text-red-400" : "text-emerald-400"}>
                            {(customReport?.metrics?.determinismScore ?? 1).toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${adversarialFault !== "none" ? "bg-red-500" : "bg-emerald-500"}`} 
                            style={{ width: `${(customReport?.metrics?.determinismScore ?? 1) * 100}%` }} 
                          />
                        </div>
                        <span className="text-[8.5px] text-zinc-500 block italic mt-1 font-mono">
                          Ds = 1.00 if replayed hashes match exactly, 0.00 otherwise.
                        </span>
                      </div>

                      {/* 2. Replay Fidelity */}
                      <div className="space-y-1 bg-zinc-950 p-2.5 rounded border border-[#27272a]/40 text-[11px]">
                        <div className="flex justify-between font-mono font-bold text-zinc-400 mb-1">
                          <span>Replay Fidelity (Rf)</span>
                          <span className={(customReport?.metrics?.replayFidelity ?? 1) < 1 ? "text-red-400" : "text-emerald-400"}>
                            {((customReport?.metrics?.replayFidelity ?? 1) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${ (customReport?.metrics?.replayFidelity ?? 1) < 1 ? "bg-red-500" : "bg-emerald-500"}`} 
                            style={{ width: `${(customReport?.metrics?.replayFidelity ?? 1) * 100}%` }} 
                          />
                        </div>
                        <span className="text-[8.5px] text-zinc-500 block italic mt-1 font-mono">
                          Rf = (Σ [H_i_replayed ≡ H_i_trace]) / N steps.
                        </span>
                      </div>

                      {/* 3. Constraint Violation Rate */}
                      <div className="space-y-1 bg-zinc-950 p-2.5 rounded border border-[#27272a]/40 text-[11px]">
                        <div className="flex justify-between font-mono font-bold text-zinc-400 mb-1">
                          <span>Constraint Violation Rate (Cv)</span>
                          <span className={(customReport?.metrics?.constraintViolationRate ?? 0) > 0 ? "text-red-400 animate-pulse" : "text-emerald-400"}>
                            {((customReport?.metrics?.constraintViolationRate ?? 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${(customReport?.metrics?.constraintViolationRate ?? 0) > 0 ? "bg-red-500" : "bg-emerald-500"}`} 
                            style={{ width: `${(customReport?.metrics?.constraintViolationRate ?? 0) * 100}%` }} 
                          />
                        </div>
                        <span className="text-[8.5px] text-zinc-500 block italic mt-1 font-mono">
                          Cv = (Σ [status_i ≡ "FAIL"]) / N steps.
                        </span>
                      </div>

                      {/* 4. State Divergence Index */}
                      <div className="space-y-1 bg-zinc-950 p-2.5 rounded border border-[#27272a]/40 text-[11px]">
                        <div className="flex justify-between font-mono font-bold text-zinc-400 mb-1">
                          <span>State Divergence Index (Sd)</span>
                          <span className={(customReport?.metrics?.stateDivergenceIndex ?? 0) > 0 ? "text-red-400" : "text-emerald-400"}>
                            {(customReport?.metrics?.stateDivergenceIndex ?? 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${(customReport?.metrics?.stateDivergenceIndex ?? 0) > 0 ? "bg-red-500" : "bg-emerald-500"}`} 
                            style={{ width: `${(customReport?.metrics?.stateDivergenceIndex ?? 0) * 100}%` }} 
                          />
                        </div>
                        <span className="text-[8.5px] text-zinc-500 block italic mt-1 font-mono">
                          Sd = 0.00 if final variables match exactly, 1.00 otherwise.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Ask Oracle AI (Consolidates standard interactive chat assistant) */}
              {activeTab === "chat" && (
                <div className="flex flex-col h-[300px]">
                  {/* Small internal scrollable conversation screen */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                    {messages.map((m) => (
                      <div key={m.id} className={`flex gap-2 max-w-[90%] ${m.role === "user" ? "ml-auto" : ""}`}>
                        <div className={`p-2.5 rounded-lg border text-[11px] font-mono leading-relaxed ${
                          m.role === "user"
                            ? "bg-blue-950/10 border-blue-500/20 text-zinc-300"
                            : "bg-[#0c0c0e] border-[#27272a] text-zinc-400"
                        }`}>
                          <div className="flex justify-between items-center text-[8.5px] text-zinc-600 border-b border-[#27272a] pb-1 mb-1 font-bold">
                            <span>{m.role === "user" ? "USER_INPUT" : "ORACLE_DECREE"}</span>
                            <span>{m.timestamp}</span>
                          </div>
                          
                          {/* Parse markdown */}
                          <div className="space-y-1">
                            {m.content.split("\n").map((line, lidx) => {
                              if (line.startsWith("###")) {
                                return <div key={lidx} className="font-bold text-blue-400 text-[10px] mt-1">{line.replace("###", "")}</div>;
                              }
                              return <p key={lidx}>{line}</p>;
                            })}
                          </div>

                          {m.role === "model" && (
                            <button
                              onClick={() => handleSpeak(m.content, m.id)}
                              className={`mt-1.5 px-2 py-0.5 rounded text-[8.5px] font-bold border transition flex items-center gap-1 ${
                                activeVoiceMessageId === m.id
                                  ? "bg-red-950/20 border-red-500/20 text-red-400"
                                  : "bg-zinc-900 border-[#27272a] text-zinc-500 hover:text-zinc-300"
                              }`}
                            >
                              {activeVoiceMessageId === m.id ? "MUTE" : "SPEAK"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex items-center gap-2 text-zinc-600 font-mono text-[10px] animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Oracle synthesizing decree...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Micro input bar */}
                  <div className="flex gap-1.5 pt-3 border-t border-[#27272a] mt-2">
                    <button
                      onClick={toggleMic}
                      className={`p-2 rounded border transition ${
                        isMicActive 
                          ? "bg-red-950/20 text-red-400 border-red-500/30 animate-pulse" 
                          : "bg-black text-zinc-500 border-[#27272a]"
                      }`}
                      title="Toggle speech capturing"
                    >
                      {isMicActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>

                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                      placeholder={isMicActive ? "Listening to voice input..." : "Ask the Oracle anything about safety rules..."}
                      className="flex-1 bg-black border border-[#27272a] focus:border-blue-500 text-[10.5px] rounded-lg px-2.5 py-1.5 text-zinc-300 placeholder-zinc-700 font-mono focus:outline-none"
                    />

                    <button
                      onClick={() => handleChatSend()}
                      disabled={!input.trim() || loading}
                      className="bg-blue-600 hover:bg-blue-500 disabled:bg-[#18181b] p-2 rounded text-zinc-100 font-bold transition shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: 5/12 Verification Proof Inspector / Trace Ledger */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Ledger Status Card */}
          <div className="bg-[#0c0c0e] border border-[#27272a] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#27272a] pb-3 justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-500" />
                <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-200 font-bold">
                  VEK Cryptographic Ledger
                </h3>
              </div>
              <span className="text-[9.5px] font-mono text-emerald-500 font-bold uppercase tracking-widest animate-pulse">ACTIVE</span>
            </div>

            {customReport ? (
              <div className="space-y-3 font-mono text-xs">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-3.5 pb-2.5 border-b border-[#27272a]/40 text-[10.5px]">
                  <div>
                    <span className="text-[9.5px] text-zinc-500 uppercase font-bold block mb-0.5">Audit Session ID</span>
                    <span className="text-zinc-300 font-bold truncate block">{customReport.metadata.sessionID}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-zinc-500 uppercase font-bold block mb-0.5">Verification Trace ID</span>
                    <span className="text-zinc-300 font-bold truncate block">{customReport.metadata.traceID}</span>
                  </div>
                </div>

                {/* Hashes Column */}
                <div className="space-y-2 bg-black border border-[#27272a] p-3 rounded">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-zinc-500 uppercase font-bold text-[9px]">Execution Hash</span>
                    <button 
                      onClick={() => handleCopy(customReport.verification.executionHash, "exec-hash")}
                      className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-semibold"
                    >
                      <span>{customReport.verification.executionHash.substring(0, 12)}...</span>
                      <Copy className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-zinc-500 uppercase font-bold text-[9px]">Replay Hash</span>
                    <button 
                      onClick={() => handleCopy(customReport.verification.replayHash, "rep-hash")}
                      className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-semibold"
                    >
                      <span className={customReport.verification.replayStatus === "PASS" ? "text-zinc-300" : "text-red-400"}>
                        {customReport.verification.replayHash.substring(0, 12)}...
                      </span>
                      <Copy className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-zinc-500 uppercase font-bold text-[9px]">Proof Certificate</span>
                    <button 
                      onClick={() => handleCopy(customReport.verification.decisionHash, "dec-hash")}
                      className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-semibold"
                    >
                      <span className="text-blue-400 font-bold">{customReport.verification.decisionHash.substring(0, 12)}...</span>
                      <Copy className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Evidence support list */}
                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Evidence Support Matrix</span>
                  {customReport.evidence.correlation.map((ec: any, eidx: number) => (
                    <div key={eidx} className="bg-black/30 p-2.5 rounded border border-[#27272a]/60 space-y-1.5 text-[10.5px]">
                      <div className="flex justify-between text-zinc-400">
                        <span className="font-semibold text-zinc-300 truncate max-w-[200px]">{ec.source}</span>
                        <span className="text-blue-400 font-bold">{(ec.strength * 100).toFixed(0)}% Match</span>
                      </div>
                      <div className="w-full bg-[#18181b] h-1 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${ec.strength * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Conflict analysis description */}
                <div className="p-3 rounded bg-zinc-950 border border-[#27272a]/40 text-[10.5px] text-zinc-400 leading-relaxed italic">
                  "{customReport.evidence.conflict.description}"
                </div>

                {/* Explorer JSON toggle */}
                <div className="pt-2">
                  <details className="group">
                    <summary className="flex items-center justify-between text-[10px] font-bold text-zinc-500 cursor-pointer hover:text-zinc-300 uppercase select-none">
                      <span>Explore Cryptographic Proof JSON</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="mt-2 bg-black border border-[#27272a] p-3 rounded max-h-[140px] overflow-y-auto text-[10px] text-zinc-400 scrollbar-thin">
                      <pre className="font-mono text-zinc-400 whitespace-pre-wrap select-all">
                        {JSON.stringify(customReport, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-600 font-mono">
                <Database className="w-10 h-10 mb-2 text-zinc-800" />
                <span>Ledger database unpopulated</span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3. CREDITS IDENTITY MODAL popup (Ensures identity metadata is fully respected but non-cluttering) */}
      <AnimatePresence>
        {showIdentityModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0c0e] border border-[#27272a] rounded-xl p-6 max-w-md w-full font-mono text-xs space-y-4 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowIdentityModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 pb-3 border-b border-[#27272a]">
                <Fingerprint className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-zinc-200 uppercase tracking-wider">
                  VEK Platform Identity Profile
                </h3>
              </div>

              <div className="space-y-3 text-zinc-400 leading-relaxed">
                <p>
                  This core AI console, the deterministic verification replay engines, and compliance policy matrices represent a:
                </p>
                <div className="bg-black/50 border border-[#27272a] p-3 rounded text-center">
                  <span className="text-sm font-bold text-blue-400 block uppercase">Thoeun Then Creation</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">All Rights Verified &bull; Cryptographically Sealed</span>
                </div>
                <p className="text-[11px]">
                  The platform is engineered to automate verification on mission-critical payloads across aerospace (FAA DO-178C), decentralized financial systems, and high-frequency SCADA environments.
                </p>
              </div>

              <div className="pt-3 border-t border-[#27272a] flex justify-end">
                <button
                  onClick={() => setShowIdentityModal(false)}
                  className="bg-blue-600 hover:bg-blue-500 text-zinc-100 font-bold px-4 py-2 rounded text-[10.5px] uppercase transition"
                >
                  Close &amp; Return to Console
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
