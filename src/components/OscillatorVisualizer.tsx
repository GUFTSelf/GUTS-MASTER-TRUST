import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Sliders, AudioLines, Sparkles, Settings, Radio } from "lucide-react";

interface OscillatorVisualizerProps {
  isSpeaking: boolean;
  voiceName: string;
}

export default function OscillatorVisualizer({
  isSpeaking,
  voiceName
}: OscillatorVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Custom states for interactive controls
  const [dimensions, setDimensions] = useState({ width: 400, height: 120 });
  const [gain, setGain] = useState<number>(1.2);
  const [speed, setSpeed] = useState<number>(1.0);
  const [visMode, setVisMode] = useState<"oscilloscope" | "fft" | "hybrid">("hybrid");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [glitchFactor, setGlitchFactor] = useState<number>(0.05);

  const animationRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  // Responsive Canvas resize observing
  useEffect(() => {
    if (!containerRef.current) return;

    let timeoutId: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      
      // Debounce size updates to minimize render costs
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: width || 400,
          height: height || 120
        });
      }, 80);
    });

    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  // Voice configurations for aesthetic mapping
  const getVoiceColor = () => {
    const lower = voiceName.toLowerCase();
    if (lower.includes("aria")) return { primary: "#a855f7", secondary: "#ec4899", text: "text-purple-400" }; // Purple/Magenta
    if (lower.includes("cortex")) return { primary: "#10b981", secondary: "#06b6d4", text: "text-emerald-400" }; // Emerald/Cyan
    if (lower.includes("atlas")) return { primary: "#f59e0b", secondary: "#ef4444", text: "text-amber-500" }; // Amber/Red
    if (lower.includes("hera")) return { primary: "#3b82f6", secondary: "#8b5cf6", text: "text-blue-500" }; // Blue/Purple
    return { primary: "#a855f7", secondary: "#3b82f6", text: "text-purple-400" };
  };

  const colors = getVoiceColor();

  // Animation draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lowerVoice = voiceName.toLowerCase();
    
    // Custom voice wave modifiers
    let baseFreqMultiplier = 1.0;
    let waveComplexity = 3;
    let synthSharpness = 1.0; // 1 = Sine, >1 = Square/Triangle blend

    if (lowerVoice.includes("aria")) {
      baseFreqMultiplier = 1.8; // High pitch, fast frequency
      waveComplexity = 4;
      synthSharpness = 0.9;
    } else if (lowerVoice.includes("cortex")) {
      baseFreqMultiplier = 0.4; // Low sub-harmonics
      waveComplexity = 2;
      synthSharpness = 1.3; // More rugged wave
    } else if (lowerVoice.includes("atlas")) {
      baseFreqMultiplier = 1.0; // Monotone
      waveComplexity = 5; // Cyber static noise
      synthSharpness = 2.5; // Highly computerized, sharp edges
    } else if (lowerVoice.includes("hera")) {
      baseFreqMultiplier = 1.1; // Balanced organic
      waveComplexity = 3;
      synthSharpness = 0.8; // Smooth pure sines
    }

    const draw = () => {
      const w = dimensions.width;
      const h = dimensions.height;
      
      // Update canvas backing store
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      // Draw Background with high tech grid lines
      ctx.fillStyle = "rgba(12, 12, 14, 0.25)"; // Semitransparent smear for cool ghost trails
      ctx.fillRect(0, 0, w, h);

      // Sub-grid layout lines
      ctx.strokeStyle = "rgba(39, 39, 42, 0.15)";
      ctx.lineWidth = 1;
      
      // Horizontal midlines
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Vertical intervals
      for (let x = 0; x < w; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Voice signal dynamics
      // If speaking: high action, high amplitude, vocal cadence fluctuations
      // If idle: low ambient baseline vibration
      const timeFactor = Date.now() * 0.003 * speed;
      phaseRef.current += 0.05 * speed;

      // Human cadence simulation (envelope modulator)
      let voiceEnvelope = 0.15; // Gentle standby ripple
      if (isSpeaking) {
        // Compose multiple low frequency oscillators to simulate speech rhythm (syllabic envelopes)
        const envelope1 = Math.sin(timeFactor * 1.5) * 0.5 + 0.5;
        const envelope2 = Math.cos(timeFactor * 0.7) * 0.4 + 0.6;
        const envelope3 = Math.sin(timeFactor * 4.2) * 0.15 + 0.85;
        voiceEnvelope = envelope1 * envelope2 * envelope3 * gain * 1.5;
        
        // Ensure some random dynamic variance
        if (Math.random() < 0.05) voiceEnvelope *= 0.3; // Syllabic silent intervals
      }

      // Render mode selection
      if (visMode === "oscilloscope" || visMode === "hybrid") {
        // Draw primary oscillator lines (3 overlapping components for composite formants)
        for (let component = 0; component < waveComplexity; component++) {
          ctx.beginPath();
          ctx.lineWidth = component === 0 ? 2 : 1;
          
          // Blend gradient for ultimate futuristic glow
          const gradient = ctx.createLinearGradient(0, 0, w, 0);
          gradient.addColorStop(0, colors.primary);
          gradient.addColorStop(0.5, colors.secondary);
          gradient.addColorStop(1, colors.primary);
          ctx.strokeStyle = gradient;

          // Component variations
          const compFreq = baseFreqMultiplier * (1 + component * 0.45);
          const compPhase = phaseRef.current * (1 - component * 0.2) + component * Math.PI / 4;
          const maxAmp = (h / 3.2) * (1 / (component + 1)) * voiceEnvelope;

          // Jitter/static simulation
          const staticJitter = isSpeaking ? (Math.random() - 0.5) * glitchFactor * 15 : 0;

          for (let x = 0; x < w; x++) {
            const progress = x / w;
            // Apply gaussian boundary envelope so waves taper down beautifully on left and right edges
            const edgeTaper = Math.sin(progress * Math.PI);
            
            // Core coordinate formulas
            const angle = progress * Math.PI * 4.5 * compFreq + compPhase;
            
            let waveVal = Math.sin(angle);
            // Non-linear synthesizer shaping (sharpness mapping)
            if (synthSharpness > 1) {
              // Blend toward square / clipped waves
              waveVal = Math.tanh(waveVal * synthSharpness);
            } else if (synthSharpness < 1) {
              // Smoothed sine sub-harmonics
              waveVal = Math.sin(angle) * 0.85 + Math.sin(angle * 2) * 0.15;
            }

            const y = h / 2 + waveVal * maxAmp * edgeTaper + staticJitter * edgeTaper;

            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          // Alpha blending based on speaking state
          ctx.globalAlpha = isSpeaking ? (1.0 - component * 0.2) : (0.25 - component * 0.05);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }

      if (visMode === "fft" || visMode === "hybrid") {
        // Draw frequency spectrum vertical bars in the background/foreground
        const barCount = Math.floor(w / 12);
        const barWidth = 6;
        const gap = 6;

        ctx.fillStyle = colors.primary;
        
        for (let i = 0; i < barCount; i++) {
          const progress = i / barCount;
          const centerFactor = 1.0 - Math.abs(progress - 0.5) * 2.0; // Peak in the middle
          
          // Generate a dynamic height based on multiple sines + vocal envelope
          const noise = Math.sin(timeFactor * 5 + i * 0.2) * Math.cos(timeFactor * 2.5 - i * 0.4) * 0.5 + 0.5;
          const peakHeight = (h * 0.55) * noise * centerFactor * voiceEnvelope;
          
          // Baseline subtle vibration if idle
          const height = Math.max(isSpeaking ? 3 : 1.5, peakHeight);
          const x = i * (barWidth + gap) + (w - barCount * (barWidth + gap)) / 2;
          
          // Standard transparent/glow draw logic
          ctx.globalAlpha = isSpeaking ? 0.35 : 0.08;
          ctx.fillRect(x, h - height - 10, barWidth, height);
          ctx.globalAlpha = 1.0;

          // Tiny terminal peak dots on the top of each frequency band
          ctx.fillStyle = colors.secondary;
          ctx.globalAlpha = isSpeaking ? 0.75 : 0.15;
          ctx.fillRect(x, h - height - 12, barWidth, 1.5);
          ctx.fillStyle = colors.primary;
          ctx.globalAlpha = 1.0;
        }
      }

      // Overlay static telemetry labels inside the canvas corners for realistic sci-fi feel
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.font = "7px monospace";
      ctx.fillText(`BANDWIDTH: ${isSpeaking ? "DYNAMIC" : "STANDBY"}`, 12, 15);
      ctx.fillText(`MODULATION: ${isSpeaking ? (baseFreqMultiplier * 100).toFixed(0) + "Hz" : "0Hz"}`, 12, 25);
      ctx.fillText(`ENGINE: THOEUN_THEN_VOS_v3`, w - 110, 15);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, isSpeaking, voiceName, visMode, gain, speed, glitchFactor, colors]);

  return (
    <div 
      id="telemetry-oscillator-visualizer" 
      className="bg-[#09090b]/80 border border-[#27272a]/80 rounded-lg p-4 shadow-xl relative overflow-hidden"
    >
      {/* Visual background lights */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3 border-b border-[#27272a]/50 pb-2">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${colors.text} ${isSpeaking ? "animate-pulse" : "opacity-40"}`} />
          <h3 className="text-[10px] font-bold font-mono tracking-widest uppercase text-zinc-300">
            Real-Time Focal Formant Spectrum & Oscillator
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick visualization toggle buttons */}
          <div className="flex bg-black border border-[#27272a] rounded p-0.5 text-[8px] font-mono">
            {(["oscilloscope", "fft", "hybrid"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setVisMode(mode)}
                className={`px-1.5 py-0.5 rounded uppercase transition-colors ${
                  visMode === mode 
                    ? "bg-zinc-800 text-white font-bold" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {mode === "fft" ? "FFT" : mode === "hybrid" ? "HYB" : "OSC"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1 rounded border transition-colors ${
              showSettings 
                ? "bg-purple-950/20 border-purple-500/40 text-purple-400" 
                : "bg-black border-[#27272a] text-zinc-500 hover:text-zinc-300"
            }`}
            title="Configure Signal Telemetry Parameters"
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Responsive Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-28 relative rounded bg-black/90 border border-[#27272a]/50 overflow-hidden"
      >
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 block w-full h-full"
        />

        {/* Dynamic status badge overlays */}
        <div className="absolute bottom-2 left-3 font-mono text-[8px] flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? "bg-purple-500 animate-ping" : "bg-zinc-700"}`} />
          <span className="text-zinc-500">VOICE PRESET:</span>
          <span className={`font-bold uppercase ${colors.text}`}>
            {voiceName.split(" ")[0]}
          </span>
        </div>

        <div className="absolute bottom-2 right-3 font-mono text-[8px] text-zinc-600">
          GAIN: {(gain * 100).toFixed(0)}% | SPEED: {speed.toFixed(1)}x
        </div>
      </div>

      {/* Animated Interactive Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 bg-black/60 border border-[#27272a] rounded p-3 font-mono text-[9px] text-zinc-400 space-y-3 overflow-hidden"
          >
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-300 border-b border-zinc-900 pb-1.5 uppercase">
              <Sliders className="w-3.5 h-3.5 text-zinc-500" />
              <span>Calibrate Synthesis Parameters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between text-[8px] mb-1">
                  <span>SPECTRUM AMPLITUDE GAIN:</span>
                  <span className="text-zinc-300">{(gain * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={gain}
                  onChange={(e) => setGain(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[8px] mb-1">
                  <span>WAVE MODULATION SPEED:</span>
                  <span className="text-zinc-300">{speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[8px] mb-1">
                  <span>SIGNAL GLITCH HARMONIC JITTER:</span>
                  <span className="text-zinc-300">{(glitchFactor * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.3"
                  step="0.01"
                  value={glitchFactor}
                  onChange={(e) => setGlitchFactor(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
