import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, MicOff, Volume2, VolumeX, RefreshCw, Sparkles, AlertCircle, 
  Play, Square, Terminal, HelpCircle, Check, Info, ShieldAlert
} from "lucide-react";
import { speakText, stopSpeaking } from "../lib/speakHelper";
import { VerificationReport } from "../types";

// Extracted interface for the browser SpeechRecognition API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechResultList;
}

interface SpeechResultList {
  length: number;
  item(index: number): SpeechResult;
  [index: number]: SpeechResult;
}

interface SpeechResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechAlternative;
  [index: number]: SpeechAlternative;
}

interface SpeechAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudiostart: (ev: Event) => void;
  onaudioend: (ev: Event) => void;
  onend: (ev: Event) => void;
  onerror: (ev: SpeechRecognitionErrorEvent) => void;
  onnomatch: (ev: Event) => void;
  onresult: (ev: SpeechRecognitionEvent) => void;
  onsoundstart: (ev: Event) => void;
  onsoundend: (ev: Event) => void;
  onspeechstart: (ev: Event) => void;
  onspeechend: (ev: Event) => void;
  onstart: (ev: Event) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface VoiceConversationPanelProps {
  latestReport: VerificationReport | null;
  handleVerify: (selectedPrompt?: string) => Promise<void>;
  loading: boolean;
  aiVoice: string;
  aiAvatar: string;
  onSpeakingChange?: (speaking: boolean) => void;
}

export default function VoiceConversationPanel({
  latestReport,
  handleVerify,
  loading,
  aiVoice,
  aiAvatar,
  onSpeakingChange
}: VoiceConversationPanelProps) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "listening" | "processing" | "speaking" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (onSpeakingChange) {
      onSpeakingChange(status === "speaking");
    }
  }, [status, onSpeakingChange]);
  
  // Transcripts
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  
  // Mic volume wave simulation
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const levelIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Recognition reference
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Track if we are currently waiting for a report response
  const [isWaitingForReport, setIsWaitingForReport] = useState<boolean>(false);
  const [spokenReportId, setSpokenReportId] = useState<string | null>(null);

  // Keep latest mutable references to avoid stale states in speech callbacks
  const loadingRef = useRef<boolean>(loading);
  const isActiveRef = useRef<boolean>(isActive);
  const latestReportRef = useRef<VerificationReport | null>(latestReport);
  const spokenReportIdRef = useRef<string | null>(spokenReportId);
  const aiVoiceRef = useRef<string>(aiVoice);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    latestReportRef.current = latestReport;
  }, [latestReport]);

  useEffect(() => {
    spokenReportIdRef.current = spokenReportId;
  }, [spokenReportId]);

  useEffect(() => {
    aiVoiceRef.current = aiVoice;
  }, [aiVoice]);

  // Check Web Speech recognition compatibility
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionClass = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognitionClass) {
        setIsSupported(false);
      }
    }
  }, []);

  // Monitor report generation and trigger voice playback in standard loop
  useEffect(() => {
    if (isActive && isWaitingForReport && latestReport && !loading) {
      const reportId = latestReport.metadata?.traceID || "";
      if (reportId !== spokenReportIdRef.current) {
        // We received the new report from our voice request!
        setIsWaitingForReport(false);
        setSpokenReportId(reportId);
        playReportAudio(latestReport);
      }
    }
  }, [latestReport, loading, isActive, isWaitingForReport]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSession();
      if (levelIntervalRef.current) clearInterval(levelIntervalRef.current);
    };
  }, []);

  // Speech Recognition initializer
  const initializeRecognition = () => {
    if (recognitionRef.current) return recognitionRef.current;

    const SpeechRecognitionClass = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return null;

    const rec = new SpeechRecognitionClass() as SpeechRecognition;
    rec.continuous = false; // We want single phrase segments for turn-based conversation
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      setStatus("listening");
      setErrorMessage("");
      startAudioLevelSimulation();
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let finalStr = "";
      let interimStr = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalStr += result[0].transcript;
        } else {
          interimStr += result[0].transcript;
        }
      }

      if (finalStr) {
        setTranscript(finalStr);
      }
      setInterimTranscript(interimStr);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setErrorMessage("Microphone access denied. Please verify frame permissions.");
        setStatus("error");
        setIsActive(false);
      } else if (event.error === "no-speech") {
        // This is fine, auto-restart will handle it if still active
      } else {
        setErrorMessage(`Audio Interface Fault: ${event.error}`);
        setStatus("error");
      }
    };

    rec.onend = () => {
      stopAudioLevelSimulation();
      
      // Access current transcript from react state indirectly
      setTranscript(prev => {
        const trimmed = prev.trim();
        if (trimmed && isActiveRef.current && !loadingRef.current) {
          // Trigger the submission
          setStatus("processing");
          setIsWaitingForReport(true);
          setTranscript("");
          setInterimTranscript("");
          
          // Submit to parent state
          handleVerify(trimmed).catch((err) => {
            console.error(err);
            setStatus("error");
            setErrorMessage("Failed to process transaction query.");
            restartListeningWithDelay();
          });
        } else if (isActiveRef.current && !loadingRef.current) {
          // No text heard, but session is active - restart listening
          restartListeningWithDelay();
        }
        return "";
      });
    };

    recognitionRef.current = rec;
    return rec;
  };

  const restartListeningWithDelay = () => {
    setTimeout(() => {
      if (isActiveRef.current && !loadingRef.current && status !== "speaking") {
        startListening();
      }
    }, 400);
  };

  const startListening = () => {
    try {
      const rec = initializeRecognition();
      if (rec) {
        rec.start();
      }
    } catch (err: any) {
      console.warn("Speech recognition already running or failed to start: ", err);
    }
  };

  const playReportAudio = (report: VerificationReport) => {
    setStatus("speaking");
    stopSpeaking();

    // Generate a clean summary to speak instead of the entire dry raw code
    const statusWord = report.verification?.status === "PASS" ? "passed" : "failed";
    const confidenceScoreNum = report.confidence?.score ? Math.round(report.confidence.score * 100) : 95;
    const speakTextContent = `Verification complete for trace ${report.metadata.traceID.slice(-4)}. The execution status is ${statusWord} with a deterministic confidence score of ${confidenceScoreNum} percent. ${report.output.substring(0, 180)}...`;

    speakText(
      speakTextContent,
      aiVoiceRef.current,
      () => {
        setStatus("speaking");
      },
      () => {
        // When finished speaking, automatically resume listening if session is still active
        if (isActiveRef.current) {
          setStatus("listening");
          startListening();
        } else {
          setStatus("idle");
        }
      }
    );
  };

  // Simulates microphone activity
  const startAudioLevelSimulation = () => {
    if (levelIntervalRef.current) clearInterval(levelIntervalRef.current);
    levelIntervalRef.current = setInterval(() => {
      setAudioLevel(Math.floor(Math.random() * 80) + 10);
    }, 100);
  };

  const stopAudioLevelSimulation = () => {
    if (levelIntervalRef.current) clearInterval(levelIntervalRef.current);
    setAudioLevel(0);
  };

  // Toggle session state
  const toggleSession = () => {
    if (isActive) {
      stopSession();
    } else {
      setIsActive(true);
      setStatus("listening");
      // Give state update a brief moment before starting
      setTimeout(() => {
        startListening();
      }, 50);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus("idle");
    setIsWaitingForReport(false);
    stopSpeaking();
    stopAudioLevelSimulation();
    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    } catch (err) {
      // Ignored
    }
  };

  return (
    <div id="voice-conversation-container" className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5 shadow-2xl relative overflow-hidden mt-6">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full" />
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#27272a] mb-4">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-200 font-mono">
            Hands-Free Voice Conversation Mode
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            isActive ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"
          }`} />
          <span className="text-[10px] font-mono text-zinc-500 uppercase">
            {isActive ? "SESSION ACTIVE" : "SESSION OFFLINE"}
          </span>
        </div>
      </div>

      {!isSupported ? (
        <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-4 flex gap-3 text-zinc-400 text-xs font-mono">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-400 block mb-1">Web Speech Recognition Unavailable</span>
            Speech synthesis and microphone transcription require the SpeechRecognition API. This is supported in modern versions of Google Chrome, Apple Safari, and Microsoft Edge. Please access this app via one of these browsers.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed font-mono">
            Enable hands-free mode to talk directly to the Oracle. Speak your query, the system will verify, and the calibrated oracle voice will speak the verification outcomes back to you automatically.
          </p>

          <div className="flex flex-col md:flex-row items-center gap-4 bg-black/40 border border-[#27272a] rounded-lg p-4">
            
            {/* Left Button Block */}
            <div className="flex flex-col items-center justify-center">
              <button
                id="voice-session-toggle-btn"
                onClick={toggleSession}
                className={`w-16 h-16 rounded-full border flex items-center justify-center shadow-lg transition-all duration-300 ${
                  isActive 
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/10 scale-105" 
                    : "bg-[#18181b] hover:bg-[#222226] text-zinc-400 hover:text-white border-[#27272a]"
                }`}
                title={isActive ? "Stop Voice Session" : "Start Voice Session"}
              >
                {isActive ? (
                  <Mic className="w-7 h-7 text-white" />
                ) : (
                  <MicOff className="w-7 h-7 text-zinc-500" />
                )}
              </button>
              <span className="text-[9px] font-mono text-zinc-500 mt-2 uppercase tracking-wider">
                {isActive ? "Tap to Stop" : "Tap to Speak"}
              </span>
            </div>

            {/* Visualizer and Live Status Grid */}
            <div className="flex-1 w-full space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-500 uppercase">SYSTEM STATE:</span>
                <span className={`font-bold uppercase ${
                  status === "listening" ? "text-emerald-400 animate-pulse" :
                  status === "processing" ? "text-blue-400" :
                  status === "speaking" ? "text-purple-400" :
                  status === "error" ? "text-red-400" : "text-zinc-500"
                }`}>
                  {status === "listening" && "Listening (Speak your query now...)"}
                  {status === "processing" && "VEK Core analyzing telemetry..."}
                  {status === "speaking" && "Transmitting synthesized audio..."}
                  {status === "error" && "Pipeline Error"}
                  {status === "idle" && "System Standby / Idle"}
                </span>
              </div>

              {/* Glowing Interactive Waveform Visualizer */}
              <div className="h-10 bg-black/80 rounded border border-zinc-900 flex items-center justify-center overflow-hidden relative px-4">
                <AnimatePresence mode="wait">
                  {status === "listening" && (
                    <motion.div 
                      key="listening-wave"
                      className="flex items-center gap-[3px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {[...Array(16)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-[3px] bg-emerald-500 rounded-full"
                          style={{ height: "6px" }}
                          animate={{ 
                            height: [
                              "6px", 
                              `${Math.max(6, audioLevel * (0.3 + Math.sin(i / 2) * 0.5))}px`, 
                              "6px"
                            ] 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 0.5 + (i % 3) * 0.1, 
                            ease: "easeInOut" 
                          }}
                        />
                      ))}
                    </motion.div>
                  )}

                  {status === "processing" && (
                    <motion.div 
                      key="processing-wave"
                      className="flex items-center gap-1 text-[9px] font-mono text-blue-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      COMPILING TELEMETRY decision ledgers...
                    </motion.div>
                  )}

                  {status === "speaking" && (
                    <motion.div 
                      key="speaking-wave"
                      className="flex items-center gap-[4px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Avatar next to waves */}
                      {aiAvatar && (
                        <img 
                          src={aiAvatar} 
                          alt="AI Oracle" 
                          className="w-5 h-5 rounded-full object-cover border border-purple-500/40 mr-1.5"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-[4px] bg-purple-500 rounded-full"
                          style={{ height: "4px" }}
                          animate={{ 
                            height: ["4px", `${10 + Math.sin(Date.now() / 200 + i) * 18}px`, "4px"]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 0.6 + (i % 4) * 0.08, 
                            ease: "easeInOut" 
                          }}
                        />
                      ))}
                    </motion.div>
                  )}

                  {status === "idle" && (
                    <motion.div 
                      key="idle-line"
                      className="w-full flex items-center justify-center gap-1.5 text-[9px] font-mono text-zinc-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="w-full h-[1px] bg-zinc-900 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                      </div>
                      <span className="shrink-0">MIC INTERFACE DISCONNECTED</span>
                      <div className="w-full h-[1px] bg-zinc-900 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                      </div>
                    </motion.div>
                  )}

                  {status === "error" && (
                    <motion.div 
                      key="error-warning"
                      className="flex items-center gap-1.5 text-[9px] font-mono text-red-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                      {errorMessage || "Audio capture error occurred."}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dynamic Live Interim Transcript Display */}
              {(interimTranscript || transcript) && (
                <div className="bg-black border border-zinc-900 rounded p-2 text-[10px] font-mono text-zinc-300">
                  <span className="text-zinc-600 block text-[8px] uppercase mb-0.5 tracking-wider">Live Biometric Capture:</span>
                  <p className="italic leading-normal">
                    {transcript}
                    <span className="text-emerald-500 font-bold">{interimTranscript}</span>
                  </p>
                </div>
              )}
            </div>

          </div>
          
          {/* Diagnostic info footer */}
          <div className="text-[9px] font-mono text-zinc-600 flex items-center justify-between border-t border-[#27272a]/40 pt-2.5">
            <span>INTERFACE MODEL: WEBSPEECH_DUAL_STREAM</span>
            <span>VOICE: {aiVoice.split(" ")[0]}</span>
          </div>
        </div>
      )}
    </div>
  );
}
