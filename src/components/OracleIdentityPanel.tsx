import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, Sparkles, Volume2, Play, Check, ShieldCheck, 
  HelpCircle, RefreshCw, Cpu, AudioLines, Terminal, FileImage, ShieldAlert
} from "lucide-react";
import { AVATAR_PRESETS, VOICE_PRESETS, AvatarPreset, VoicePreset, getSvgDataUrl } from "../lib/avatarPresets";
import { speakText, stopSpeaking } from "../lib/speakHelper";

interface OracleIdentityPanelProps {
  aiAvatar: string;
  setAiAvatar: (val: string) => void;
  aiVoice: string;
  setAiVoice: (val: string) => void;
  isMimicked: boolean;
  setIsMimicked: (val: boolean) => void;
  onSpeakingChange?: (speaking: boolean) => void;
}

export default function OracleIdentityPanel({
  aiAvatar,
  setAiAvatar,
  aiVoice,
  setAiVoice,
  isMimicked,
  setIsMimicked,
  onSpeakingChange
}: OracleIdentityPanelProps) {
  // Local customization selection before committing via mimicry
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset-quantum");
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("aria");
  
  // Mimicry sequence states
  const [isMimicking, setIsMimicking] = useState(false);
  const [mimicProgress, setMimicProgress] = useState(0);
  const [mimicLogs, setMimicLogs] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  
  // Sandbox testing
  const [sandboxText, setSandboxText] = useState("Verifiable Execution Kernel is currently running at nominal safety parameters.");
  const [isSandboxSpeaking, setIsSandboxSpeaking] = useState(false);

  useEffect(() => {
    if (onSpeakingChange) {
      onSpeakingChange(isSandboxSpeaking);
    }
  }, [isSandboxSpeaking, onSpeakingChange]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if already mimicked
  useEffect(() => {
    if (isMimicked) {
      // Try to find if active avatar corresponds to a preset or is custom
      const preset = AVATAR_PRESETS.find(p => p.id === aiAvatar || getSvgDataUrl(p.svgContent) === aiAvatar);
      if (preset) {
        setSelectedPresetId(preset.id);
      } else if (aiAvatar.startsWith("data:image")) {
        setCustomImageBase64(aiAvatar);
        setSelectedPresetId("custom");
      }

      const voice = VOICE_PRESETS.find(v => v.name === aiVoice || v.id === aiVoice);
      if (voice) {
        setSelectedVoiceId(voice.id);
      }
    }
  }, [isMimicked, aiAvatar, aiVoice]);

  // Handle preset avatar selection
  const handleSelectPreset = (preset: AvatarPreset) => {
    setSelectedPresetId(preset.id);
    setCustomImageBase64(null);
  };

  // Process selected file
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Invalid file format. Please upload an image file (PNG, JPG, SVG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setCustomImageBase64(e.target.result);
        setSelectedPresetId("custom");
      }
    };
    reader.readAsDataURL(file);
  };

  // File Input Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Play vocal preset preview sample
  const handlePlayVoicePreview = (voice: VoicePreset) => {
    const previewSentence = `Biometric calibration payload loaded. Testing vocal signature for ${voice.name}.`;
    setIsSandboxSpeaking(true);
    speakText(previewSentence, voice.name, undefined, () => {
      setIsSandboxSpeaking(false);
    });
  };

  // Web Audio synth chime during mimicry sequence
  const playSynthesisAcoustics = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Low-frequency carrier sweep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(90, now);
      osc1.frequency.exponentialRampToValueAtTime(350, now + 2.5);
      
      // High frequency resonance
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(400, now + 0.8);
      osc2.frequency.exponentialRampToValueAtTime(1200, now + 3.0);

      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      gain2.gain.setValueAtTime(0.05, now + 0.8);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 2.5);
      osc2.start(now + 0.8);
      osc2.stop(now + 3.0);
    } catch (err) {
      console.warn("Synthesis acoustic sweep bypassed: ", err);
    }
  };

  // Trigger mimicry sequence simulation
  const handleStartMimicry = () => {
    if (isMimicking) return;
    stopSpeaking();
    setIsMimicking(true);
    setMimicProgress(0);
    setMimicLogs(["[MIMIC_INIT] Initializing biometric identity transfer bridge..."]);
    playSynthesisAcoustics();

    const selectedVoiceObj = VOICE_PRESETS.find(v => v.id === selectedVoiceId) || VOICE_PRESETS[0];

    const logsAndIntervals = [
      { prg: 15, log: "[MIMIC_STAGE_1] Decoupling default core avatar visual matrices..." },
      { prg: 30, log: `[MIMIC_STAGE_2] Sampling voice signature [${selectedVoiceObj.name}] formant spectrum...` },
      { prg: 50, log: "[MIMIC_STAGE_3] Synthesizing envelope filters and carrier multipliers..." },
      { prg: 65, log: "[MIMIC_STAGE_4] Aligning pitch-rate parameters with the kernel state-machine..." },
      { prg: 80, log: "[MIMIC_STAGE_5] Merging pixel dimensions and base64 identity vector hashes..." },
      { prg: 95, log: "[MIMIC_STAGE_6] Verifying neural core integrity and locking vocal credentials..." },
      { prg: 100, log: "[MIMIC_SUCCESS] Identity mimicking complete. Locking VEK Oracle Oracle profile." }
    ];

    logsAndIntervals.forEach((step, index) => {
      setTimeout(() => {
        setMimicProgress(step.prg);
        setMimicLogs(prev => [...prev, step.log]);

        if (step.prg === 100) {
          // Commit identity
          const targetAvatar = customImageBase64 || 
            getSvgDataUrl(AVATAR_PRESETS.find(p => p.id === selectedPresetId)?.svgContent || AVATAR_PRESETS[0].svgContent);
          
          setAiAvatar(targetAvatar);
          setAiVoice(selectedVoiceObj.name);
          setIsMimicked(true);
          setIsMimicking(false);

          // Success announcement in the voice
          setTimeout(() => {
            setIsSandboxSpeaking(true);
            speakText(
              `Calibrated successfully. I am now configured with your custom avatar and vocal signature. Verifiable Execution Kernel Oracle active.`,
              selectedVoiceObj.name,
              undefined,
              () => {
                setIsSandboxSpeaking(false);
              }
            );
          }, 300);
        }
      }, (index + 1) * 600);
    });
  };

  // Speak sandbox text
  const handleSpeakSandbox = () => {
    if (isSandboxSpeaking) {
      stopSpeaking();
      setIsSandboxSpeaking(false);
      return;
    }
    setIsSandboxSpeaking(true);
    speakText(sandboxText, aiVoice, undefined, () => {
      setIsSandboxSpeaking(false);
    });
  };

  // Active avatar render helper
  const renderActiveAvatar = (sizeClass = "w-20 h-20") => {
    if (customImageBase64) {
      return (
        <img 
          src={customImageBase64} 
          alt="Custom Avatar" 
          className={`${sizeClass} rounded-full object-cover border border-blue-500/30`}
          referrerPolicy="no-referrer"
        />
      );
    }
    
    const matchedPreset = AVATAR_PRESETS.find(p => p.id === selectedPresetId);
    if (matchedPreset) {
      return (
        <div 
          className={`${sizeClass} rounded-full p-2 bg-black/50 border border-zinc-800 flex items-center justify-center`}
          dangerouslySetInnerHTML={{ __html: matchedPreset.svgContent }}
        />
      );
    }

    // Default fallback
    return (
      <div className={`${sizeClass} bg-blue-950/40 rounded-full border border-blue-500/20 flex items-center justify-center`}>
        <Cpu className="w-10 h-10 text-blue-400" />
      </div>
    );
  };

  const selectedVoiceObj = VOICE_PRESETS.find(v => v.id === selectedVoiceId) || VOICE_PRESETS[0];

  return (
    <div id="oracle-identity-customizer" className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-5 shadow-2xl relative overflow-hidden">
      {/* Absolute high-tech aesthetics */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#27272a] mb-5">
        <div className="flex items-center gap-2">
          <AudioLines className="w-4 h-4 text-purple-400" />
          <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-200 font-mono">
            Oracle Identity & Vocal Mimicry Engine
          </h2>
        </div>
        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase transition-colors ${
          isMimicked 
            ? "bg-purple-950/20 text-purple-400 border-purple-500/30 animate-pulse" 
            : "bg-zinc-900 text-zinc-500 border-zinc-800"
        }`}>
          {isMimicked ? "MIMICRY REGISTERED" : "STANDARD KERNEL IDENTITY"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE IDENTITY DISPLAY */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center bg-black/40 border border-[#27272a] rounded-lg p-5 text-center relative">
          
          {/* Scanning/Calibration Laser Ring Effects */}
          <div className="relative mb-4">
            <AnimatePresence>
              {isMimicking && (
                <motion.div 
                  className="absolute -inset-2.5 rounded-full border-2 border-dashed border-purple-500/40"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                />
              )}
            </AnimatePresence>
            <motion.div 
              className={`p-1 rounded-full border-2 transition-colors duration-500 ${
                isMimicked ? "border-purple-500/40" : "border-blue-500/20"
              }`}
              animate={isMimicking ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {renderActiveAvatar()}
            </motion.div>
            
            {/* Holographic scanner laser line bar */}
            {isMimicking && (
              <motion.div 
                className="absolute left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] z-10"
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
            )}
          </div>

          <div className="space-y-1 z-10">
            <h3 className="text-xs font-bold text-white font-mono">
              {isMimicked ? "VERIFIABLE ORACLE" : "DEFAULT CORE ORACLE"}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono flex items-center justify-center gap-1.5 uppercase">
              <Volume2 className="w-3 h-3 text-zinc-600" />
              Signature: <span className={isMimicked ? "text-purple-400 font-bold" : "text-zinc-400"}>{aiVoice}</span>
            </p>
          </div>

          {/* Core Telemetry parameters */}
          <div className="w-full mt-5 pt-3 border-t border-[#27272a]/80 grid grid-cols-2 gap-2 text-left font-mono text-[9px] text-zinc-500">
            <div>
              <span>FORMANT SHIFT:</span>
              <span className="block font-bold text-zinc-300">
                {isMimicked ? "0.85 - 1.45" : "1.00 (FLAT)"}
              </span>
            </div>
            <div>
              <span>STATE VECTOR:</span>
              <span className="block font-bold text-zinc-300">
                {isMimicked ? "CLONED_REG" : "STANDARD"}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTION AND ACTION PANEL */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Step 1: Image Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-zinc-300 uppercase tracking-wider">Step 1: Calibrate Avatar Profile</span>
              <span className="text-zinc-500">Preset or Upload Custom Image</span>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`h-11 rounded-md bg-black/60 border p-1 transition flex items-center justify-center group ${
                      isSelected 
                        ? "border-purple-500 bg-purple-950/10" 
                        : "border-[#27272a] hover:border-zinc-700"
                    }`}
                    title={p.name}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 group-hover:opacity-100"
                      dangerouslySetInnerHTML={{ __html: p.svgContent }}
                    />
                  </button>
                );
              })}

              {/* File drag upload button box */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`col-span-1 h-11 rounded-md border border-dashed flex flex-col items-center justify-center cursor-pointer transition text-center group ${
                  selectedPresetId === "custom" 
                    ? "border-purple-500 bg-purple-950/10 text-purple-400" 
                    : dragOver 
                    ? "border-blue-500 bg-blue-950/10 text-blue-400" 
                    : "border-[#27272a] hover:border-zinc-700 text-zinc-500"
                }`}
                title="Drag or click to upload custom image"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden" 
                />
                {customImageBase64 ? (
                  <img 
                    src={customImageBase64} 
                    alt="Custom file" 
                    className="w-8 h-8 rounded-full object-cover border border-purple-500"
                  />
                ) : (
                  <Upload className="w-4 h-4 group-hover:text-zinc-300 transition-colors" />
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Vocal Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-zinc-300 uppercase tracking-wider">Step 2: Select Vocal Signature Target</span>
              <span className="text-zinc-500">Preset Formant Signatures</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {VOICE_PRESETS.map((v) => {
                const isSelected = selectedVoiceId === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVoiceId(v.id)}
                    className={`p-2 rounded-lg bg-black/50 border flex items-center justify-between gap-2 cursor-pointer transition ${
                      isSelected 
                        ? "border-purple-500 bg-purple-950/5 text-zinc-200" 
                        : "border-[#27272a] text-zinc-400 hover:border-zinc-800"
                    }`}
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-purple-500" : "bg-zinc-600"}`} />
                        <span className="text-xs font-bold font-mono">{v.name.split(" ")[0]}</span>
                      </div>
                      <span className="text-[9px] text-zinc-500 block leading-tight truncate max-w-[170px] mt-0.5">{v.description}</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVoicePreview(v);
                      }}
                      className="p-1 rounded bg-[#18181b] hover:bg-[#27272a] text-zinc-400 hover:text-white transition"
                      title="Test Audio Sample"
                    >
                      <Play className="w-3 h-3 fill-zinc-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Trigger Synthesis / Mimicry log */}
          <div className="space-y-3 pt-2">
            
            {/* Run Button */}
            <button
              id="execute-mimicry-btn"
              disabled={isMimicking}
              onClick={handleStartMimicry}
              className={`w-full py-2.5 rounded font-sans font-bold uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 transition duration-300 shadow-xl border ${
                isMimicking 
                  ? "bg-[#18181b] text-zinc-600 border-[#27272a]"
                  : "bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-purple-500/10"
              }`}
            >
              {isMimicking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Calibrating Neural Mimicry [{mimicProgress}%]...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-white" />
                  Mimic Voice & Transfer Identity
                </>
              )}
            </button>

            {/* Simulated Live Terminal output logs during mimicry */}
            <AnimatePresence>
              {isMimicking && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-black border border-[#27272a] rounded p-3 font-mono text-[9px] text-purple-400 space-y-1 overflow-hidden"
                >
                  <div className="flex items-center gap-1.5 text-zinc-500 pb-1.5 border-b border-zinc-900 mb-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>IDENTITY VERIFICATION LEDGER CO-PROCESSOR LOGS</span>
                  </div>
                  {mimicLogs.map((l, i) => (
                    <div key={i} className="flex gap-1.5">
                      <span className="text-zinc-600 select-none">&gt;</span>
                      <span className="leading-normal break-all">{l}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sandbox Voice playground once calibrated */}
          {isMimicked && !isMimicking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#18181b]/30 border border-[#27272a] rounded-lg p-3.5 space-y-3"
            >
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide">
                <Volume2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Voice Mimic Sandbox Playground</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sandboxText}
                  onChange={(e) => setSandboxText(e.target.value)}
                  placeholder="Enter message for the Oracle..."
                  className="flex-1 bg-black border border-[#27272a] rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 font-mono transition"
                />
                <button
                  onClick={handleSpeakSandbox}
                  className={`px-4 py-1.5 rounded font-mono text-xs font-bold transition flex items-center gap-1.5 ${
                    isSandboxSpeaking 
                      ? "bg-red-950/20 text-red-400 border border-red-500/30 hover:bg-red-900/20" 
                      : "bg-purple-950/30 text-purple-400 border border-purple-500/20 hover:bg-purple-900/30"
                  }`}
                >
                  {isSandboxSpeaking ? (
                    <>
                      <div className="flex gap-0.5 items-center justify-center">
                        <span className="w-1 h-3 bg-red-400 animate-pulse rounded-full" />
                        <span className="w-1 h-2 bg-red-400 animate-pulse rounded-full delay-75" />
                        <span className="w-1 h-4 bg-red-400 animate-pulse rounded-full delay-150" />
                      </div>
                      Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      Transmit
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
