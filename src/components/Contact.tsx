import React, { useState } from "react";
import { 
  Building2, Mail, Globe, Shield, Phone, MapPin, 
  CheckCircle, Copy, ExternalLink, HelpCircle, FileText
} from "lucide-react";

export default function Contact() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div id="vek-contact-root" className="space-y-6 font-mono text-xs">
      
      {/* Entity Credentials Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Main Entity Card */}
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-950/40 p-2 rounded-lg border border-blue-500/20 text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 font-bold block uppercase">Licensing Entity</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-tight">
                  GUTS DETERMINISTIC TECHNOLOGY LLC
                </h3>
              </div>
            </div>

            <p className="text-zinc-400 font-sans leading-relaxed text-[11px]">
              GUTS DETERMINISTIC TECHNOLOGY LLC holds the exclusive global commercialization and licensing rights for the high-assurance software portfolio held by the GUTS MASTER TRUST.
            </p>

            <div className="border-t border-zinc-900 pt-3 space-y-2 text-[10px]">
              <div className="flex items-center justify-between p-2 bg-black rounded border border-zinc-900">
                <span className="text-zinc-500 uppercase font-semibold">Unique Entity ID (UEI)</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-extrabold select-all">FQJUJKVKSAS3</span>
                  <button 
                    onClick={() => handleCopy("FQJUJKVKSAS3", "UEI")}
                    className="text-zinc-500 hover:text-zinc-300 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-black rounded border border-zinc-900">
                <span className="text-zinc-500 uppercase font-semibold">CAGE Code</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-extrabold select-all">1ZMG9</span>
                  <button 
                    onClick={() => handleCopy("1ZMG9", "CAGE")}
                    className="text-zinc-500 hover:text-zinc-300 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-black rounded border border-zinc-900">
                <span className="text-zinc-500 uppercase font-semibold">IP Holding Trust</span>
                <span className="text-blue-400 font-bold uppercase">GUTS MASTER TRUST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Channels Card */}
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-indigo-500" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-purple-950/40 p-2 rounded-lg border border-purple-500/20 text-purple-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 font-bold block uppercase">Communications Desk</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-tight">
                  Direct Contact & Portals
                </h3>
              </div>
            </div>

            <p className="text-zinc-400 font-sans leading-relaxed text-[11px]">
              Our legal and engineering review teams are prepared to facilitate source-code access, security audits, and field-of-use licensing inquiries.
            </p>

            <div className="border-t border-zinc-900 pt-3 space-y-2 text-[10px]">
              <a 
                href="mailto:thoeunceo@gdtsi.com" 
                className="flex items-center justify-between p-2 bg-black rounded border border-zinc-900 hover:border-zinc-700 transition text-zinc-300 hover:text-white"
              >
                <span className="text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  Principal Email
                </span>
                <span className="font-bold">thoeunceo@gdtsi.com</span>
              </a>

              <a 
                href="https://gdtsi.com" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-2 bg-black rounded border border-zinc-900 hover:border-zinc-700 transition text-zinc-300 hover:text-white"
              >
                <span className="text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                  Official Website
                </span>
                <span className="font-bold flex items-center gap-1">
                  gdtsi.com
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>

              <div className="flex items-center justify-between p-2 bg-black rounded border border-zinc-900">
                <span className="text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  Corporate Headquarters
                </span>
                <span className="text-zinc-300 font-medium">Clearwater, Florida, USA</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Copy Alert HUD */}
      {copiedText && (
        <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 p-2.5 rounded-lg flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            <span>Copied GUTS {copiedText} credential successfully to clipboard.</span>
          </span>
          <span className="text-[10px] text-zinc-500 uppercase font-bold">[BUFFER CLONED]</span>
        </div>
      )}

      {/* Specialty Licensing Pathways */}
      <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-5">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Specialty Licensing Pathways
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/40 border border-zinc-950 p-3 rounded-lg space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase block">Aerospace & Defense</span>
            <p className="text-zinc-400 font-sans text-[11px]">
              Available configurations for air-gapped facility nodes matching military DO-178C or critical SCADA guidelines.
            </p>
          </div>
          <div className="bg-black/40 border border-zinc-950 p-3 rounded-lg space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase block">Enterprise FinTech</span>
            <p className="text-zinc-400 font-sans text-[11px]">
              For strict margin calculations, synchronized transaction ledgers, and zero-latency hardware clock validation.
            </p>
          </div>
          <div className="bg-black/40 border border-zinc-950 p-3 rounded-lg space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase block">High-Assurance AI</span>
            <p className="text-zinc-400 font-sans text-[11px]">
              Direct software integration of the VEK real-time constraint engine directly into custom model deployment setups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
