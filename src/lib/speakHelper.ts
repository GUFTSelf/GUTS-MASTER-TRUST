/**
 * Web Speech Synthesis helper for the Verifiable LLM Oracle.
 * Sanitizes markdown strings and applies pitch, rate, and gender voice mappings.
 */

export function speakText(
  text: string,
  voicePresetName: string,
  onStart?: () => void,
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("Speech synthesis is not supported in this browser environment.");
    return null;
  }

  // Cancel any running speech to avoid queuing overlaps
  window.speechSynthesis.cancel();

  // Strip markdown, bullet points, headers for clean pronunciation
  const cleanText = text
    .replace(/[#*`_\-\[\]\(\)]/g, " ") // replace markdown characters with spaces
    .replace(/\d+\./g, (match) => `Point ${match.slice(0, -1)}. `) // say "Point 1" instead of "1."
    .replace(/\s+/g, " ") // consolidate spaces
    .trim()
    .substring(0, 500); // limit payload size for performance

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Default parameters
  utterance.pitch = 1.0;
  utterance.rate = 1.0;

  const lowerName = voicePresetName.toLowerCase();

  // Map pitch/rate presets
  if (lowerName.includes("aria")) {
    utterance.pitch = 1.4;
    utterance.rate = 0.95;
  } else if (lowerName.includes("cortex")) {
    utterance.pitch = 0.55;
    utterance.rate = 0.85;
  } else if (lowerName.includes("atlas")) {
    utterance.pitch = 0.8;
    utterance.rate = 1.25;
  } else if (lowerName.includes("hera")) {
    utterance.pitch = 1.15;
    utterance.rate = 1.05;
  }

  // Load voices and match gender and language (en)
  const voices = window.speechSynthesis.getVoices();
  let matchedVoice = null;

  if (lowerName.includes("aria") || lowerName.includes("hera")) {
    // Look for female/soft/natural voices
    matchedVoice = voices.find(v => 
      v.lang.startsWith("en") && 
      (v.name.toLowerCase().includes("female") || 
       v.name.toLowerCase().includes("zira") || 
       v.name.toLowerCase().includes("samantha") || 
       v.name.toLowerCase().includes("hazel") ||
       v.name.toLowerCase().includes("google us english") ||
       v.name.toLowerCase().includes("moira"))
    );
  } else if (lowerName.includes("cortex") || lowerName.includes("atlas")) {
    // Look for deep/male/monotone voices
    matchedVoice = voices.find(v => 
      v.lang.startsWith("en") && 
      (v.name.toLowerCase().includes("male") || 
       v.name.toLowerCase().includes("david") || 
       v.name.toLowerCase().includes("george") ||
       v.name.toLowerCase().includes("google uk english male") ||
       v.name.toLowerCase().includes("ravi"))
    );
  }

  // If no gender voice was matched, try to find any English voice
  if (!matchedVoice) {
    matchedVoice = voices.find(v => v.lang.startsWith("en"));
  }

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  // Bind callbacks
  if (onStart) utterance.onstart = onStart;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = (e) => {
      console.error("Speech synthesis error occurred:", e);
      onEnd();
    };
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
