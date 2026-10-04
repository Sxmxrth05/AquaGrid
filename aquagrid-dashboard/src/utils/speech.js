// Web Speech API utility tailored for clear, robust reading of the AquaGrid dashboard
// Supports both English (with Indian accent priority) and Kannada

export const isSpeechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

export const isRecognitionSupported = () =>
  typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

let availableVoices = [];

function loadVoices() {
  if (!isSpeechSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    availableVoices = voices;
  }
  return availableVoices;
}

if (isSpeechSupported()) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
    };
  }
}

/**
 * Finds the most natural voice available for the language
 */
export function getIndianVoice(lang = "en") {
  const voices = availableVoices.length > 0 ? availableVoices : loadVoices();
  const isKannada = lang === "kn";

  if (isKannada) {
    // 1. Native Kannada voice
    const knVoice = voices.find(
      (v) =>
        v.lang === "kn-IN" ||
        v.lang === "kn_IN" ||
        v.name.toLowerCase().includes("kannada") ||
        v.name.toLowerCase().includes("kn-in")
    );
    if (knVoice) return knVoice;

    // 2. Indian Hindi / multilingual voice which handles Indic phonetics
    const indicVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === "hi-in" ||
        v.lang.toLowerCase() === "hi_in" ||
        v.name.toLowerCase().includes("hindi") ||
        v.name.toLowerCase().includes("kalpana") ||
        v.name.toLowerCase().includes("madhav") ||
        v.name.toLowerCase().includes("hemant")
    );
    if (indicVoice) return indicVoice;
  }

  // English: Priority for authentic Indian accents (en-IN)
  const indianEnVoice = voices.find((v) => {
    const langCode = (v.lang || "").toLowerCase().replace("_", "-");
    const name = (v.name || "").toLowerCase();
    return (
      langCode === "en-in" ||
      name.includes("india") ||
      name.includes("ravi") ||
      name.includes("heera") ||
      name.includes("neerja") ||
      name.includes("veena") ||
      name.includes("rishi") ||
      name.includes("prabhat")
    );
  });
  if (indianEnVoice) return indianEnVoice;

  // High-clarity English fallback voices
  const clearEnVoice = voices.find((v) => {
    const name = (v.name || "").toLowerCase();
    return (
      name.includes("google us english") ||
      name.includes("google uk english") ||
      name.includes("natural") ||
      name.includes("zira") ||
      name.includes("david")
    );
  });
  if (clearEnVoice) return clearEnVoice;

  return voices.find((v) => (v.lang || "").toLowerCase().startsWith("en")) || null;
}

/**
 * Pre-processes text so that abbreviations, symbols, and agricultural metrics
 * are read aloud cleanly without stumbling.
 */
export function formatSpeechText(text, lang = "en") {
  if (!text) return "";
  let formatted = String(text);

  if (lang !== "kn") {
    formatted = formatted
      // Currency & rates
      .replace(/₹\s*([0-9,.]+)\s*\/\s*(?:quintal|qtl)/gi, "$1 rupees per quintal")
      .replace(/₹\s*([0-9,.]+)\s*\/\s*crate/gi, "$1 rupees per crate")
      .replace(/₹\s*([0-9,.]+)/g, "$1 rupees")
      // Temperature & weather
      .replace(/([0-9]+)\s*°\s*C\b/gi, "$1 degrees celsius")
      .replace(/([0-9]+)\s*°/g, "$1 degrees")
      .replace(/~\s*([0-9]+)\s*h\b/gi, "about $1 hours")
      // Units
      .replace(/([0-9,.]+)\s*L\/min/gi, "$1 litres per minute")
      .replace(/([0-9,.]+)\s*L\b/g, "$1 litres")
      .replace(/([0-9,.]+)\s*kWh\b/gi, "$1 kilowatt hours")
      .replace(/([0-9,.]+)\s*bar\b/gi, "$1 bar")
      .replace(/([0-9,.]+)\s*mm\b/gi, "$1 millimetres")
      .replace(/([0-9,.]+)\s*km\/h/gi, "$1 kilometres per hour")
      .replace(/([0-9]+)\s*h\b/gi, "$1 hours")
      .replace(/([0-9]+)\s*min\b/gi, "$1 minutes")
      .replace(/([0-9]+)\s*ft\b/gi, "$1 feet")
      .replace(/([0-9]+)\s*%/g, "$1 percent")
      // Acronyms
      .replace(/\bBESCOM\b/gi, "Bescom")
      .replace(/\bAPMC\b/gi, "A P M C mandi")
      .replace(/\bFPO\b/gi, "F P O")
      .replace(/\bDOL\b/gi, "D O L starter")
      .replace(/\bVFD\b/gi, "V F D pump drive")
      .replace(/\b3-Phase\b/gi, "three phase")
      .replace(/415V/gi, "415 volts")
      .replace(/7\.2A/gi, "7.2 amperes")
      // Separator bullets
      .replace(/[•|◆]/g, ", ");
  } else {
    // Kannada natural expansions
    formatted = formatted
      .replace(/₹\s*([0-9,.]+)/g, "$1 ರೂಪಾಯಿ")
      .replace(/([0-9,.]+)\s*L\/min/g, "$1 ಲೀಟರ್ ಪ್ರತಿ ನಿಮಿಷ")
      .replace(/([0-9,.]+)\s*L/g, "$1 ಲೀಟರ್")
      .replace(/([0-9,.]+)\s*kWh/g, "$1 ಕಿಲೋವ್ಯಾಟ್ ಅವರ್")
      .replace(/([0-9]+)\s*°\s*C/g, "$1 ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್")
      .replace(/([0-9]+)\s*%/g, "ಶೇಕಡಾ $1")
      .replace(/\b3-ಫೇಸ್\b/g, "ಮೂರು ಫೇಸ್")
      .replace(/[•|◆]/g, ", ");
  }

  return formatted;
}

// Keep-alive timer for Chromium speech synthesis bug
let speechKeepAliveTimer = null;

function clearKeepAlive() {
  if (speechKeepAliveTimer) {
    clearInterval(speechKeepAliveTimer);
    speechKeepAliveTimer = null;
  }
}

/**
 * Splits text into natural sentence chunks to prevent browser speech synthesis
 * from stalling or cutting off on long responses.
 */
function splitIntoSentences(text) {
  const rawSentences = text.split(/(?<=[.!?])\s+/);
  return rawSentences.map((s) => s.trim()).filter(Boolean);
}

/**
 * Speaks text using the best natural browser voice.
 * Features chunked streaming to prevent Chromium speech cancellation bugs.
 */
export function speakText(rawText, lang = "en", onEnd = () => {}) {
  if (!isSpeechSupported()) {
    console.warn("Speech synthesis is not supported on this device/browser.");
    onEnd();
    return false;
  }

  // Cancel any currently ongoing speech
  stopSpeaking();

  const formattedText = formatSpeechText(rawText, lang);
  const sentences = splitIntoSentences(formattedText);
  if (sentences.length === 0) {
    onEnd();
    return false;
  }

  const voice = getIndianVoice(lang);
  const isKannada = lang === "kn";

  let currentIndex = 0;

  function speakNextChunk() {
    if (currentIndex >= sentences.length) {
      clearKeepAlive();
      onEnd();
      return;
    }

    const chunk = sentences[currentIndex];
    const utterance = new SpeechSynthesisUtterance(chunk);

    // Natural, articulate cadence for easy farmer comprehension
    utterance.rate = isKannada ? 0.86 : 0.92;
    utterance.pitch = 1.0;

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || (isKannada ? "kn-IN" : "en-IN");
    } else {
      utterance.lang = isKannada ? "kn-IN" : "en-IN";
    }

    utterance.onend = () => {
      currentIndex++;
      speakNextChunk();
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled" && e.error !== "interrupted") {
        console.warn("[AquaGrid Voice] Speech error:", e.error);
      }
      clearKeepAlive();
      onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Chromium bug workaround: periodic resume() ensures audio doesn't hang mid-sentence
  clearKeepAlive();
  speechKeepAliveTimer = setInterval(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      clearKeepAlive();
    }
  }, 9000);

  speakNextChunk();
  return true;
}

export function stopSpeaking() {
  clearKeepAlive();
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speech Recognition (Microphone) tailored to Indian accents
 */
export function createSpeechRecognizer(lang = "en", onTranscript = () => {}, onError = () => {}) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = lang === "kn" ? "kn-IN" : "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    if (event.results && event.results[0]) {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    }
  };

  recognition.onerror = (event) => {
    onError(event.error);
  };

  return recognition;
}

export function getVoiceDiagnostics() {
  const voices = availableVoices.length > 0 ? availableVoices : loadVoices();
  const indianVoices = voices.filter((v) => {
    const lang = (v.lang || "").toLowerCase();
    const name = (v.name || "").toLowerCase();
    return lang.includes("in") || name.includes("india") || lang.startsWith("kn") || lang.startsWith("hi");
  });

  return {
    totalVoices: voices.length,
    indianVoices: indianVoices.map((v) => `${v.name} (${v.lang})`),
    activeVoiceEn: getIndianVoice("en")?.name || "System Default English",
    activeVoiceKn: getIndianVoice("kn")?.name || "System Indic / Kannada",
  };
}
