import React from "react";

export interface AvatarPreset {
  id: string;
  name: string;
  color: string;
  svgContent: string;
}

export interface VoicePreset {
  id: string;
  name: string;
  description: string;
  pitch: number;
  rate: number;
  lang: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "preset-quantum",
    name: "Quantum Nova",
    color: "#3b82f6", // Blue
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="#1d4ed8" stroke-width="2" stroke-dasharray="4 4" />
      <circle cx="50" cy="50" r="30" stroke="#3b82f6" stroke-width="1.5" />
      <circle cx="50" cy="50" r="10" fill="#60a5fa" />
      <path d="M50 5 L50 20 M50 80 L50 95 M5 50 L20 50 M80 50 L95 50" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" />
      <path d="M18 18 L30 30 M70 70 L82 82 M82 18 L70 30 M30 70 L18 82" stroke="#1d4ed8" stroke-width="1.5" />
      <circle cx="50" cy="50" r="4" fill="#ffffff" />
    </svg>`
  },
  {
    id: "preset-holographic",
    name: "Bio-Hologram",
    color: "#10b981", // Emerald
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="#047857" stroke-width="2" />
      <path d="M50 5 A45 45 0 0 1 95 50" stroke="#10b981" stroke-width="4" stroke-linecap="round" />
      <path d="M20 50 C20 30, 80 30, 80 50 C80 70, 20 70, 20 50" stroke="#059669" stroke-width="1.5" stroke-dasharray="2 2" />
      <path d="M35 50 C35 40, 65 40, 65 50 C65 60, 35 60, 35 50" stroke="#10b981" stroke-width="2" />
      <circle cx="50" cy="50" r="8" fill="#10b981" fill-opacity="0.6" />
      <circle cx="50" cy="50" r="3" fill="#ffffff" />
    </svg>`
  },
  {
    id: "preset-reactor",
    name: "Atlas Reactor",
    color: "#f59e0b", // Amber
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="80" height="80" rx="10" stroke="#b45309" stroke-width="2" />
      <circle cx="50" cy="50" r="30" stroke="#f59e0b" stroke-width="2" />
      <path d="M50 15 L50 85" stroke="#d97706" stroke-width="1.5" />
      <path d="M15 50 L85 50" stroke="#d97706" stroke-width="1.5" />
      <circle cx="50" cy="50" r="20" fill="#000000" stroke="#f59e0b" stroke-width="1" />
      <polygon points="50,40 58,55 42,55" fill="#f59e0b" />
      <circle cx="50" cy="50" r="4" fill="#ffffff" />
    </svg>`
  },
  {
    id: "preset-synth",
    name: "Vesper Soundwave",
    color: "#8b5cf6", // Purple
    svgContent: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="#6d28d9" stroke-width="2" />
      <path d="M20 50 L30 30 L40 70 L50 20 L60 80 L70 40 L80 50" stroke="#8b5cf6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M20 50 L30 40 L40 60 L50 35 L60 65 L70 45 L80 50" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="20" cy="50" r="3" fill="#8b5cf6" />
      <circle cx="80" cy="50" r="3" fill="#8b5cf6" />
    </svg>`
  }
];

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: "aria",
    name: "Aria (Holographic Alt-Tenor)",
    description: "Femme-resonant holographic guide with clear, clinical inflections.",
    pitch: 1.35,
    rate: 0.95,
    lang: "en-US"
  },
  {
    id: "cortex",
    name: "Cortex (Sub-Zero Frequency)",
    description: "Deep, ultra-low subharmonic node. Calm and highly analytical.",
    pitch: 0.55,
    rate: 0.90,
    lang: "en-US"
  },
  {
    id: "atlas",
    name: "Atlas (Cyber-Monotone Oracle)",
    description: "Static-isolated synthesized monotone beacon. Direct safety reporting.",
    pitch: 0.85,
    rate: 1.15,
    lang: "en-US"
  },
  {
    id: "hera",
    name: "Hera (Bio-Resonant Lyric)",
    description: "Warm, lyric-alto organic simulation. Reassuring safety margin checks.",
    pitch: 1.15,
    rate: 1.05,
    lang: "en-US"
  }
];

// Helper to convert inline SVG string to dynamic SVG Data URL
export function getSvgDataUrl(svgStr: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;
}
