import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AudioLines, Mic, MicOff, Settings, Sliders, Volume2, VolumeX, 
  Play, Square, Info, Activity, Radio, HelpCircle, Sparkles, Check
} from "lucide-react";

interface AudioVisualizerProps {
  isSpeaking: boolean;
  isVoiceActive: boolean;
  voiceName: string;
}

export default function AudioVisualizer({
  isSpeaking,
  isVoiceActive,
  voiceName
}: AudioVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio state refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const synthGainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const animationIdRef = useRef<number | null>(null);

  // Component configuration states
  const [dimensions, setDimensions] = useState({ width: 500, height: 160 });
  const [isMicAllowed, setIsMicAllowed] = useState<boolean | null>(null);
  const [useMicSource, setUseMicSource] = useState<boolean>(false);
  const [theme, setTheme] = useState<"cosmic" | "laser" | "solar">("cosmic");
  const [visStyle, setVisStyle] = useState<"bars" | "wave" | "radial" | "lines">("bars");
  const [fftSize, setFftSize] = useState<number>(256);
  const [smoothing, setSmoothing] = useState<number>(0.8);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [gainDb, setGainDb] = useState<number>(1.2);
  const [audioContextStatus, setAudioContextStatus] = useState<string>("uninitialized");

  // Track Peak Holds
  const peaksRef = useRef<number[]>([]);
  const peakDecayRef = useRef<number[]>([]);

  // Responsive Canvas container observation
  useEffect(() => {
    if (!containerRef.current) return;

    let resizeTimeout: NodeJS.Timeout;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setDimensions({
          width: width || 500,
          height: height || 160
        });
      }, 50);
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Sync mic source when parent state requests mic session active
  useEffect(() => {
    if (isVoiceActive) {
      setUseMicSource(true);
      initAudioEngine(true);
    } else {
      setUseMicSource(false);
      // Don't close context, let it fall back to synth
      if (audioCtxRef.current) {
        stopMicrophone();
      }
    }
  }, [isVoiceActive]);

  // Handle configuration changes on current AnalyserNode
  useEffect(() => {
    if (analyserRef.current) {
      analyserRef.current.fftSize = fftSize;
      analyserRef.current.smoothingTimeConstant = smoothing;
    }
  }, [fftSize, smoothing]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      cleanupAudioEngine();
    };
  }, []);

  const cleanupAudioEngine = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    stopMicrophone();
    stopSynthesizer();
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
    setAudioContextStatus("closed");
  };

  const stopMicrophone = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (micSourceNodeRef.current) {
      micSourceNodeRef.current.disconnect();
      micSourceNodeRef.current = null;
    }
  };

  const stopSynthesizer = () => {
    oscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    oscillatorsRef.current = [];
    if (synthGainNodeRef.current) {
      synthGainNodeRef.current.disconnect();
      synthGainNodeRef.current = null;
    }
  };

  // Lazy initialize the Web Audio engine
  const initAudioEngine = async (withMic: boolean) => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      setAudioContextStatus(ctx.state);

      if (ctx.state === "suspended") {
        await ctx.resume();
        setAudioContextStatus(ctx.state);
      }

      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = smoothing;
        analyserRef.current = analyser;
      }

      if (withMic) {
        stopSynthesizer();
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = stream;
          setIsMicAllowed(true);

          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          micSourceNodeRef.current = source;
        } catch (err) {
          console.warn("Microphone initialization failed or denied:", err);
          setIsMicAllowed(false);
          setUseMicSource(false);
          // Fallback to synthesized oscillators if mic is denied
          setupVocalSynthesizer();
        }
      } else {
        stopMicrophone();
        setupVocalSynthesizer();
      }

      // Resume animation loops
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      startRenderLoop();

    } catch (err) {
      console.error("Critical error setting up Web Audio context:", err);
    }
  };

  // Sets up an oscillator configuration connected to AnalyserNode
  const setupVocalSynthesizer = () => {
    const ctx = audioCtxRef.current;
    const analyser = analyserRef.current;
    if (!ctx || !analyser) return;

    stopSynthesizer();

    // Create a local master gain node for synthesis
    const synthGain = ctx.createGain();
    synthGain.gain.setValueAtTime(0.005, ctx.currentTime); // Keep output extremely quiet or silent, just for frequency signals
    synthGain.connect(analyser);
    // Also connect to destination but keep it mute to prevent annoying hum on user speakers, 
    // yet let frequency analysis flow perfectly!
    const localDestGain = ctx.createGain();
    localDestGain.gain.setValueAtTime(0.0, ctx.currentTime); // Mute output speakers
    synthGain.connect(localDestGain);
    localDestGain.connect(ctx.destination);

    synthGainNodeRef.current = synthGain;

    // Build 3 oscillators representing fundamental frequencies and formants
    const frequencies = [110, 220, 440]; // Fundamental, octave, and vocal formant harmonics
    const types: OscillatorType[] = ["sine", "triangle", "sine"];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = types[idx];
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(synthGain);
      osc.start();
      oscillatorsRef.current.push(osc);
    });
  };

  // Modulate oscillators in real-time to match AI speaking state
  useEffect(() => {
    const ctx = audioCtxRef.current;
    const gainNode = synthGainNodeRef.current;
    if (!ctx || !gainNode || useMicSource) return;

    if (isSpeaking) {
      // Modulate gain to simulate syllabic envelope spikes and dips
      gainNode.gain.cancelScheduledValues(ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.35 * gainDb, ctx.currentTime + 0.15);
      
      // Periodically shift oscillator frequencies slightly to simulate dynamic voice peaks
      oscillatorsRef.current.forEach((osc, idx) => {
        const baseFreq = idx === 0 ? 120 : idx === 1 ? 260 : 520;
        const targetFreq = baseFreq + (Math.random() - 0.5) * 80;
        osc.frequency.setValueAtTime(osc.frequency.value, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.2);
      });
    } else {
      // Idle mode - decay the synth frequencies to a silent, slow ripple
      gainNode.gain.cancelScheduledValues(ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      
      oscillatorsRef.current.forEach((osc, idx) => {
        const baseFreq = idx === 0 ? 90 : idx === 1 ? 180 : 360;
        osc.frequency.setValueAtTime(osc.frequency.value, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq, ctx.currentTime + 0.5);
      });
    }
  }, [isSpeaking, useMicSource, gainDb]);

  // Color mapping per preset themes
  const getThemePalette = () => {
    switch (theme) {
      case "laser":
        return {
          primary: "rgb(16, 185, 129)", // Emerald
          secondary: "rgb(6, 182, 212)", // Cyan
          accent: "rgb(52, 211, 153)",
          text: "text-emerald-400",
          border: "border-emerald-500/20",
          bg: "rgba(16, 185, 12 emerald, 0.05)"
        };
      case "solar":
        return {
          primary: "rgb(245, 158, 11)", // Amber
          secondary: "rgb(239, 68, 68)", // Red
          accent: "rgb(251, 191, 36)",
          text: "text-amber-500",
          border: "border-amber-500/20",
          bg: "rgba(245, 158, 11, 0.05)"
        };
      case "cosmic":
      default:
        return {
          primary: "rgb(168, 85, 247)", // Purple
          secondary: "rgb(59, 130, 246)", // Blue
          accent: "rgb(236, 72, 153)", // Pink
          text: "text-purple-400",
          border: "border-purple-500/20",
          bg: "rgba(168, 85, 247, 0.05)"
        };
    }
  };

  const palette = getThemePalette();

  // Canvas drawing render loop
  const startRenderLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const analyser = analyserRef.current;
      if (!analyser) {
        animationIdRef.current = requestAnimationFrame(render);
        return;
      }

      const w = dimensions.width;
      const h = dimensions.height;

      // Sync canvas dimensions
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Retrieve frequency data from Audio API Analyser
      analyser.getByteFrequencyData(dataArray);

      // Clean background frame
      ctx.fillStyle = "rgba(12, 12, 14, 0.3)";
      ctx.fillRect(0, 0, w, h);

      // Draw horizontal grid lines
      ctx.strokeStyle = "rgba(63, 63, 70, 0.08)";
      ctx.lineWidth = 1;
      const gridCount = 4;
      for (let i = 1; i < gridCount; i++) {
        const y = (h / gridCount) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw vertical grid bands
      const xGridCount = 10;
      for (let i = 1; i < xGridCount; i++) {
        const x = (w / xGridCount) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Keep dynamic scale for peak hold lines
      if (peaksRef.current.length !== bufferLength) {
        peaksRef.current = new Array(bufferLength).fill(0);
        peakDecayRef.current = new Array(bufferLength).fill(0);
      }

      // Render styles
      if (visStyle === "bars") {
        const barWidth = (w / bufferLength) * 1.6;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const rawVal = dataArray[i];
          barHeight = (rawVal / 255) * h * 0.85 * gainDb;

          // Apply gentle noise when idle so it always looks alive
          if (barHeight === 0) {
            barHeight = 1.5 + Math.sin(Date.now() * 0.005 + i * 0.1) * 0.5;
          }

          // Handle Peak Hold
          if (barHeight >= peaksRef.current[i]) {
            peaksRef.current[i] = barHeight;
            peakDecayRef.current[i] = 1.5; // linger rate
          } else {
            peaksRef.current[i] -= peakDecayRef.current[i];
            peakDecayRef.current[i] *= 1.05; // accelerate fall
            if (peaksRef.current[i] < 0) peaksRef.current[i] = 0;
          }

          // Bar Gradient fill
          const gradient = ctx.createLinearGradient(0, h, 0, h - barHeight);
          gradient.addColorStop(0, palette.primary);
          gradient.addColorStop(0.5, palette.secondary);
          gradient.addColorStop(1, palette.accent);

          ctx.fillStyle = gradient;
          ctx.fillRect(x, h - barHeight, barWidth - 1, barHeight);

          // Draw Peak Hold tiny dots
          if (peaksRef.current[i] > 1) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.fillRect(x, h - peaksRef.current[i] - 1.5, barWidth - 1, 1);
          }

          x += barWidth;
        }
      } else if (visStyle === "wave") {
        // Area filled wave layout
        ctx.beginPath();
        ctx.moveTo(0, h);
        
        const sliceWidth = w / (bufferLength - 1);
        for (let i = 0; i < bufferLength; i++) {
          const val = (dataArray[i] / 255) * h * 0.8 * gainDb + 2;
          const x = i * sliceWidth;
          const y = h - val;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // Cubic bezier connection for ultra-smooth liquid wave peaks
            const prevX = (i - 1) * sliceWidth;
            const prevY = h - ((dataArray[i-1] / 255) * h * 0.8 * gainDb + 2);
            ctx.bezierCurveTo(
              (prevX + x) / 2, prevY,
              (prevX + x) / 2, y,
              x, y
            );
          }
        }

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);

        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, palette.primary);
        gradient.addColorStop(0.5, palette.secondary);
        gradient.addColorStop(1, palette.accent);

        ctx.fillStyle = "rgba(15, 15, 18, 0.5)";
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.5;
        
        ctx.stroke();
        
        // Transparent fill
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.globalAlpha = 1.0;

      } else if (visStyle === "lines") {
        // Clean skeletal wireframe line frequency spectrum
        ctx.beginPath();
        const sliceWidth = w / (bufferLength - 1);
        
        for (let i = 0; i < bufferLength; i++) {
          const val = (dataArray[i] / 255) * h * 0.85 * gainDb;
          const x = i * sliceWidth;
          const y = h - val - 5;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = palette.primary;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Staggered shadow trace
        ctx.beginPath();
        for (let i = 0; i < bufferLength; i++) {
          const val = (dataArray[i] / 255) * h * 0.7 * gainDb;
          const x = i * sliceWidth;
          const y = h - val - 5;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = palette.secondary;
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1.0;

      } else if (visStyle === "radial") {
        // Futuristic radar-style circular radial spectrum
        const centerX = w / 2;
        const centerY = h / 2;
        const baseRadius = Math.min(w, h) * 0.2;
        const maxRadius = Math.min(w, h) * 0.45;

        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(63, 63, 70, 0.2)";
        ctx.stroke();

        for (let i = 0; i < bufferLength; i++) {
          const val = dataArray[i];
          const amp = (val / 255) * (maxRadius - baseRadius) * gainDb;
          const angle = (i / bufferLength) * Math.PI * 2;

          const startX = centerX + Math.cos(angle) * baseRadius;
          const startY = centerY + Math.sin(angle) * baseRadius;
          const endX = centerX + Math.cos(angle) * (baseRadius + amp + 1);
          const endY = centerY + Math.sin(angle) * (baseRadius + amp + 1);

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);

          // Render dynamic multi-color spokes
          ctx.strokeStyle = i % 2 === 0 ? palette.primary : palette.secondary;
          ctx.lineWidth = Math.max(1.5, w / bufferLength * 0.8);
          ctx.stroke();
        }
      }

      // Add neat micro-telemetry data
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.font = "8px monospace";
      ctx.fillText(`API: HTML5_WEBAUDIO_ANALYSER`, 15, h - 15);
      ctx.fillText(`CONTEXT: ${audioCtxRef.current?.state?.toUpperCase() || "OFFLINE"}`, 15, h - 25);
      ctx.fillText(`DECIBELS: ${analyser.minDecibels.toFixed(0)}dB to ${analyser.maxDecibels.toFixed(0)}dB`, w - 160, h - 15);
      ctx.fillText(`BUFFER: ${bufferLength} BIN / FFT_${fftSize}`, w - 160, h - 25);

      animationIdRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const handleToggleMic = () => {
    const nextState = !useMicSource;
    setUseMicSource(nextState);
    initAudioEngine(nextState);
  };

  const handleAudioCtxForceInit = () => {
    initAudioEngine(useMicSource);
  };

  return (
    <div 
      id="html5-analyser-visualizer-card" 
      className={`bg-zinc-950 border rounded-lg p-5 shadow-2xl relative overflow-hidden transition-all duration-300 ${palette.border}`}
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      
      {/* Background radial highlight */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-zinc-900/40 via-transparent opacity-50" />

      {/* Header layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg bg-zinc-900 border border-zinc-800`}>
            <AudioLines className={`w-4 h-4 ${palette.text}`} />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono tracking-widest text-zinc-100 uppercase">
              Web Audio Frequency Analyser & Signal Hub
            </h3>
            <p className="text-[9px] font-mono text-zinc-500 mt-0.5">
              Physical spectrum analyzer utilizing live AnalyserNode feedback
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Engine Status Indicator */}
          {audioContextStatus === "uninitialized" || audioContextStatus === "suspended" ? (
            <button
              onClick={handleAudioCtxForceInit}
              className="text-[9px] font-mono px-2 py-1 bg-purple-950/30 text-purple-400 border border-purple-500/30 rounded hover:bg-purple-950/50 transition-all flex items-center gap-1 animate-pulse"
              title="Initialize Web Audio Context"
            >
              <Radio className="w-3 h-3" />
              <span>ACTIVATE ENGINE</span>
            </button>
          ) : (
            <div className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-[#0d0d11] border border-zinc-900 flex items-center gap-1.5 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ACTIVE ({audioCtxRef.current?.sampleRate} Hz)</span>
            </div>
          )}

          {/* Quick theme selector */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded p-0.5 text-[8px] font-mono">
            {(["cosmic", "laser", "solar"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-1.5 py-0.5 rounded uppercase transition-colors ${
                  theme === t 
                    ? "bg-zinc-800 text-white font-bold" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t.slice(0, 3)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowControls(!showControls)}
            className={`p-1.5 rounded border transition-colors ${
              showControls 
                ? "bg-purple-950/20 border-purple-500/40 text-purple-400" 
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
            title="Configure Advanced Synthesis Parameters"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Responsive Canvas block */}
      <div 
        ref={containerRef} 
        className="w-full h-36 relative bg-[#09090b] border border-zinc-900 rounded overflow-hidden"
      >
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 block w-full h-full"
        />

        {/* Dynamic State badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <div className="px-2 py-0.5 bg-black/60 backdrop-blur-sm border border-zinc-900 rounded text-[8px] font-mono text-zinc-500 uppercase flex items-center gap-1.5">
            <span className="text-zinc-600">INPUT SOURCE:</span>
            <span className={`font-bold ${useMicSource ? "text-emerald-400" : "text-purple-400"}`}>
              {useMicSource ? "Microphone" : "Synthesizer"}
            </span>
          </div>

          <div className="px-2 py-0.5 bg-black/60 backdrop-blur-sm border border-zinc-900 rounded text-[8px] font-mono text-zinc-500 uppercase flex items-center gap-1.5">
            <span className="text-zinc-600">STATUS:</span>
            <span className={`font-bold ${isSpeaking || useMicSource ? "text-emerald-400 animate-pulse" : "text-zinc-400"}`}>
              {useMicSource ? "CAPTURING" : isSpeaking ? "AI_SPEAKING" : "STANDBY"}
            </span>
          </div>
        </div>

        {/* Dynamic peak stats block */}
        <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
          {voiceName && !useMicSource && (
            <div className="px-2 py-0.5 bg-black/60 backdrop-blur-sm border border-zinc-900 rounded text-[8px] font-mono text-zinc-400">
              VOICE MODEL: <span className="text-white font-bold uppercase">{voiceName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 border-t border-zinc-900 pt-3">
        {/* Toggle Source Button */}
        <button
          onClick={handleToggleMic}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border transition-all ${
            useMicSource 
              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/50" 
              : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          {useMicSource ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          <span>{useMicSource ? "Microphone Capturing" : "Use Microphine"}</span>
        </button>

        {/* Visualization Styles */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded p-0.5 text-[10px] font-mono">
          {([
            { id: "bars", name: "Frequencies" },
            { id: "wave", name: "Liquid Wave" },
            { id: "lines", name: "Trace Lines" },
            { id: "radial", name: "Radial Map" }
          ] as const).map((style) => (
            <button
              key={style.id}
              onClick={() => setVisStyle(style.id)}
              className={`px-2.5 py-1 rounded transition-colors ${
                visStyle === style.id 
                  ? "bg-zinc-800 text-white font-bold" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>

      {/* Expandable Advanced Parameters drawer */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 border-t border-zinc-900 pt-4 font-mono text-[9px] text-zinc-400 space-y-4 overflow-hidden"
          >
            <div className="flex items-center gap-1.5 font-bold text-zinc-300 uppercase border-b border-zinc-900 pb-1.5">
              <Sliders className="w-3.5 h-3.5 text-zinc-500" />
              <span>Advanced Signal Calibration Console</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* FFT Size Slider */}
              <div className="bg-black/40 border border-zinc-900 rounded p-2.5">
                <div className="flex justify-between text-[8px] mb-1.5">
                  <span>FFT RESOLUTION SIZE:</span>
                  <span className={`font-bold ${palette.text}`}>{fftSize} BINS</span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[32, 64, 128, 256, 512].map((size) => (
                    <button
                      key={size}
                      onClick={() => setFftSize(size)}
                      className={`py-1 rounded text-center border text-[8px] ${
                        fftSize === size
                          ? "bg-purple-950/20 border-purple-500/40 text-purple-400 font-bold"
                          : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smoothing Constant Slider */}
              <div className="bg-black/40 border border-zinc-900 rounded p-2.5">
                <div className="flex justify-between text-[8px] mb-1.5">
                  <span>SMOOTHING CONSTANT:</span>
                  <span className={`font-bold ${palette.text}`}>{smoothing.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={smoothing}
                  onChange={(e) => setSmoothing(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer mt-1"
                />
                <div className="flex justify-between text-[6px] text-zinc-600 mt-1">
                  <span>FAST / NOISY</span>
                  <span>SLOW / LIQUID</span>
                </div>
              </div>

              {/* Frequency Gain Boost Slider */}
              <div className="bg-black/40 border border-zinc-900 rounded p-2.5">
                <div className="flex justify-between text-[8px] mb-1.5">
                  <span>FREQUENCY BOOST GAIN:</span>
                  <span className={`font-bold ${palette.text}`}>{gainDb.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={gainDb}
                  onChange={(e) => setGainDb(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer mt-1"
                />
                <div className="flex justify-between text-[6px] text-zinc-600 mt-1">
                  <span>SOFT</span>
                  <span>BOOSTED</span>
                </div>
              </div>
            </div>

            {/* Mic Permission Helper status */}
            {useMicSource && isMicAllowed === false && (
              <div className="p-2.5 bg-red-950/10 border border-red-500/20 rounded text-red-400 text-[8px] flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">MICROPHONE STREAM ERROR</p>
                  <p className="mt-0.5 text-zinc-500 font-mono">
                    Failed to fetch user media stream. Check browser iframe permissions or device settings. Falling back to real-time synthetic speech oscillators automatically.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
