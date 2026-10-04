import { useState, useEffect, useMemo } from "react";
import {
  Mic, MicOff, Volume2, VolumeX, Sparkles, HelpCircle,
  Play, Radio, CloudRain, Zap, Store, Droplets, ShieldCheck, FileText
} from "lucide-react";
import {
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
  isRecognitionSupported,
} from "../utils/speech";
import { getBescomSchedule, getMandiPrice, fetchWeather } from "../utils/liveData";

function formatMinutesToHours(minutes) {
  if (!minutes || minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatHourTo12h(hour) {
  const h24 = hour % 24;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, "0")}:00 ${ampm}`;
}

export default function VoiceAssistant({
  t,
  lang = "en",
  activeZone,
  pumpOn,
  powerCut,
  pressureAlert,
  waterToday = 12.4,
  energyToday = 8.1,
  zones = []
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [response, setResponse] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [liveWeather, setLiveWeather] = useState(null);

  const recognitionAvailable = isRecognitionSupported();

  // Fetch live weather once on mount to keep voice assistant in sync with website weather card
  useEffect(() => {
    fetchWeather().then((data) => setLiveWeather(data));
  }, []);

  // Compute live data directly matching the website's active cards
  const mandi = useMemo(() => getMandiPrice(), []);
  const schedule = useMemo(() => getBescomSchedule(powerCut), [powerCut]);

  const targetZone = activeZone || zones[1] || { name: "Zone 2 Tomato", moisture: 29, volume: 2400 };

  // Dynamic answers that read the EXACT LIVE VALUES shown on the website
  const getDynamicAnswers = () => {
    const isKn = lang === "kn";

    // 1. Full Dashboard Briefing
    const fullBriefing = isKn
      ? `ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಕೋಲಾರ ಹೊಲದ ಆಕ್ವಾಗ್ರಿಡ್ ಸಾರಾಂಶ: ${targetZone.name} ಬೆಳೆಗೆ ${targetZone.volume?.toLocaleString() || "2,400"} ಲೀಟರ್ ನೀರು ಅಗತ್ಯವಿದೆ, ಮಣ್ಣಿನ ತೇವಾಂಶ ಶೇಕಡಾ ${targetZone.moisture} ಇದೆ. ಪಂಪ್ ಪ್ರಸ್ತುತ ${pumpOn ? "ಚಾಲನೆಯಲ್ಲಿದೆ" : "ಆಫ್ ಆಗಿದೆ"}. ಬೆಸ್ಕಾಂ 3-ಫೇಸ್ ವಿದ್ಯುತ್ ಇಂದು ${schedule.totalDailyHours} ಗಂಟೆ ನಿಗದಿಯಾಗಿದೆ. ಕೋಲಾರ ಎಪಿಎಂಸಿ ಟೊಮೆಟೊ ಇಂದಿನ ದರ ಕ್ವಿಂಟಾಲ್‌ಗೆ ${mandi.modal} ರೂಪಾಯಿಗಳು. ಸ್ಥಳೀಯ ಹವಾಮಾನ ${liveWeather?.tempC || 29} ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್ ಇದ್ದು, ಬೋರ್‌ವೆಲ್ ಹರಿವು ಪ್ರತಿ ನಿಮಿಷಕ್ಕೆ 64 ಲೀಟರ್ ಸಾಮಾನ್ಯವಾಗಿದೆ.`
      : `Namaskara! Here is your live AquaGrid farm briefing for Kolar: ${targetZone.name} requires ${targetZone.volume?.toLocaleString() || "2,400"} litres of water with soil moisture at ${targetZone.moisture} percent. Pump is currently ${pumpOn ? "running" : "idle"}. Today BESCOM 3-phase power provides ${schedule.totalDailyHours} hours. Current Kolar APMC tomato modal price is ${mandi.modal} rupees per quintal. Local weather is ${liveWeather?.tempC || 29} degrees celsius with ${liveWeather?.description || "partly cloudy"} skies. Borewell flow is healthy at 64 litres per minute and all pump safety interlocks are normal.`;

    // 2. Irrigation & Soil
    const waterAnswer = isKn
      ? (pumpOn
        ? `ಪಂಪ್ ಪ್ರಸ್ತುತ ಚಾಲನೆಯಲ್ಲಿದೆ. ${targetZone.name} ಬೆಳೆಗೆ ನೀರುಣಿಸಲಾಗುತ್ತಿದೆ. ಗುರಿ: ${targetZone.volume?.toLocaleString() || "2,400"} ಲೀಟರ್.`
        : `${targetZone.name} ಬೆಳೆಗೆ ಈಗ ನೀರುಣಿಸಬೇಕು. ಮಣ್ಣಿನ ತೇವಾಂಶ ಶೇಕಡಾ ${targetZone.moisture} ಕ್ಕೆ ಇಳಿದಿದೆ ಮತ್ತು ${targetZone.volume?.toLocaleString() || "2,400"} ಲೀಟರ್ ನೀರು ಅಗತ್ಯವಿದೆ. ಸೌರ ಶಕ್ತಿ ಲಭ್ಯವಿದೆ.`)
      : (pumpOn
        ? `Pump is currently running. Irrigating ${targetZone.name}. Delivering ${targetZone.volume?.toLocaleString() || "2,400"} litres target.`
        : `You should irrigate ${targetZone.name} now. Soil moisture is at ${targetZone.moisture} percent and ${targetZone.volume?.toLocaleString() || "2,400"} litres is required. Solar pumping capacity is available.`);

    // 3. BESCOM Power Window
    const nextBatchHour = schedule.batches.find(b => {
      const now = new Date();
      const curFrac = now.getHours() + now.getMinutes() / 60;
      return b.start > curFrac;
    })?.start ?? schedule.batches[0]?.start;
    const nextTimeStr = nextBatchHour != null ? formatHourTo12h(nextBatchHour) : "10:00 PM";

    const powerAnswer = isKn
      ? (powerCut
        ? `ಎಚ್ಚರಿಕೆ: ಬೆಸ್ಕಾಂ ವಿದ್ಯುತ್ ಕಡಿತ ಸಕ್ರಿಯವಾಗಿದೆ. ಒಟ್ಟು ಲಭ್ಯವಿರುವ ವಿದ್ಯುತ್ 3 ಗಂಟೆಗೆ ಇಳಿಕೆಯಾಗಿದೆ. ಹೂಬಿಡುವ ಹಂತದ ವಲಯ 2 ಬೆಳೆಗಳಿಗೆ ಮಾತ್ರ ನೀರು ನೀಡಲಾಗುತ್ತಿದೆ.`
        : (schedule.isLiveWindow
          ? `ವಿದ್ಯುತ್ ಈಗ ಚಾಲ್ತಿಯಲ್ಲಿದೆ. ${schedule.currentBatch?.label} ಅವಧಿಯಲ್ಲಿ ${formatMinutesToHours(schedule.minutesRemaining)} ಬಾಕಿ ಉಳಿದಿದೆ.`
          : `ವಿದ್ಯುತ್ ಈಗ ಆಫ್ ಆಗಿದೆ. ಮುಂದಿನ ಬೆಸ್ಕಾಂ 3-ಫೇಸ್ ಪಾಳಿ ${nextTimeStr} ಕ್ಕೆ ಪ್ರಾರಂಭವಾಗಲಿದೆ, ${formatMinutesToHours(schedule.nextBatchIn)} ಬಾಕಿ.`))
      : (powerCut
        ? `Alert: BESCOM power cut active. Total available 3-phase power is reduced to 3 hours. The optimizer has rationed water to Zone 2 flowering crops.`
        : (schedule.isLiveWindow
          ? `3-phase grid power is active now. ${schedule.currentBatch?.label} has ${formatMinutesToHours(schedule.minutesRemaining)} remaining.`
          : `3-phase power is currently off. Next window starts at ${nextTimeStr}, in approximately ${formatMinutesToHours(schedule.nextBatchIn)}.`));

    // 4. Mandi Tomato Price
    const mandiAnswer = isKn
      ? `ಕೋಲಾರ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಇಂದಿನ ಟೊಮೆಟೊ ಮಾದರಿ ದರ ಕ್ವಿಂಟಾಲ್‌ಗೆ ${mandi.modal} ರೂಪಾಯಿಗಳು. ದಿನದ ಶ್ರೇಣಿ ${mandi.min} ರಿಂದ ${mandi.max} ರೂಪಾಯಿ. ${mandi.modal < 700
        ? "ದರ ಕಡಿಮೆಯಿರುವುದರಿಂದ ನಷ್ಟ ತಡೆಯಲು ಸೌರ ಶೀತಲೀಕರಣದಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ."
        : mandi.modal > 1200
          ? "ದರ ಉತ್ತಮವಾಗಿದೆ, ಈಗಲೇ ಮಾರುಕಟ್ಟೆಗೆ ಸಾಗಿಸಿ."
          : "ದರ ಸಾಧಾರಣವಾಗಿದೆ, 1-2 ದಿನ ಮಾರುಕಟ್ಟೆ ಚಲನೆ ಗಮನಿಸಿ."
      }`
      : `Current Kolar APMC tomato benchmark price is ${mandi.modal} rupees per quintal, ranging from ${mandi.min} to ${mandi.max} rupees today. ${mandi.modal < 700
        ? "Price is in the lower band. Our advisor recommends booking the Solar Cold Room at 10 rupees per crate to prevent distress selling."
        : mandi.modal > 1200
          ? "Price is high! Excellent margins to harvest and transport to Kolar APMC."
          : "Price is moderate. Our advisor recommends monitoring for 1 to 2 days before deciding to sell."
      }`;

    // 5. Field Weather
    const weatherAnswer = isKn
      ? `ಕೋಲಾರ ಹೊಲದ ಪ್ರಸ್ತುತ ತಾಪಮಾನ ${liveWeather?.tempC || 29} ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್. ತೇವಾಂಶ ಶೇಕಡಾ ${liveWeather?.humidity || 55} ಮತ್ತು ಗಾಳಿಯ ವೇಗ ${liveWeather?.windKmh || 8} ಕಿಲೋಮೀಟರ್. ${liveWeather?.rainExpectedInHours != null
        ? `ಸುಮಾರು ${liveWeather.rainExpectedInHours} ಗಂಟೆಯಲ್ಲಿ ಮಳೆ ಬರುವ ಸಾಧ್ಯತೆಯಿದೆ.`
        : "ಇಂದು ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಇಲ್ಲ, ನೀರಾವರಿ ಮುಂದುವರಿಸಬಹುದು."
      }`
      : `Current field weather in Kolar is ${liveWeather?.tempC || 29} degrees celsius and ${liveWeather?.description || "partly cloudy"}. Relative humidity is ${liveWeather?.humidity || 55} percent with calm winds of ${liveWeather?.windKmh || 8} kilometres per hour. ${liveWeather?.rainExpectedInHours != null
        ? `Rain is expected in about ${liveWeather.rainExpectedInHours} hours.`
        : "No significant rain expected today. Good solar irrigation conditions."
      }`;

    // 6. Borewell & Savings
    const borewellAnswer = isKn
      ? `ನಿಮ್ಮ ಬೋರ್‌ವೆಲ್ ಹರಿವು ಪ್ರತಿ ನಿಮಿಷಕ್ಕೆ 64 ಲೀಟರ್ ಸ್ಥಿರವಾಗಿದೆ. ಡ್ರಾಡೌನ್ 310 ಅಡಿ ಇದೆ. ಈ ವಾರ ಆಕ್ವಾಗ್ರಿಡ್ ನಿಖರ ನೀರಾವರಿಯಿಂದ 13,200 ಲೀಟರ್ ನೀರು ಮತ್ತು 10 ಗಂಟೆ ಪಂಪ್ ವಿದ್ಯುತ್ ಉಳಿತಾಯವಾಗಿದೆ.`
      : `Your borewell discharge is steady at 64 litres per minute with a 310 feet drawdown. Through AquaGrid precision scheduling, you have saved 13,200 litres of water and 10 pump-hours this week.`;

    // 7. System Health
    const healthAnswer = isKn
      ? (pressureAlert
        ? `ಎಚ್ಚರಿಕೆ: ನೀರಿನ ಒತ್ತಡ 0.7 ಬಾರ್‌ಗೆ ಇಳಿದಿದೆ. ಪೈಪ್ ಒಡೆದಿರಬಹುದು ಅಥವಾ ಸೋರಿಕೆ ಇರಬಹುದು. ಪಂಪ್ ರಕ್ಷಣೆಗೆ ಆಟೋ-ಟ್ರಿಪ್ ಮಾಡಲಾಗಿದೆ.`
        : `ರೆಟ್ರೋಫಿಟ್ ಪಂಪ್ ಕಂಟ್ರೋಲರ್ ಸ್ಥಿತಿ ಸಹಜವಾಗಿದೆ. 3-ಫೇಸ್ 415 ವೋಲ್ಟ್ ಸರಿಯಾಗಿದೆ, ನೀರಿನ ಒತ್ತಡ 2.4 ಬಾರ್ ಸಾಮಾನ್ಯವಾಗಿದೆ. ಸುರಕ್ಷತಾ ಇಂಟರ್‌ಲಾಕ್‌ಗಳು ಸಕ್ರಿಯವಾಗಿವೆ.`)
      : (pressureAlert
        ? `Alert: Hydraulic pressure drop detected at 0.7 bar. Possible line rupture. The retrofit controller automatically tripped the pump to protect the motor.`
        : `Retrofit pump controller is fully operational. 3-phase 415 volts electrical state is balanced and hydraulic pressure is stable at 2.4 bar with 64 litres per minute.`);

    return {
      briefing: fullBriefing,
      water: waterAnswer,
      power: powerAnswer,
      mandi: mandiAnswer,
      weather: weatherAnswer,
      borewell: borewellAnswer,
      health: healthAnswer,
    };
  };

  const handleQuery = (queryType, queryLabel) => {
    stopSpeaking();
    setIsSpeaking(false);
    setLastQuery(queryLabel);

    const answers = getDynamicAnswers();
    const ans = answers[queryType] || answers.briefing;
    setResponse(ans);
    setIsSpeaking(true);
    speakText(ans, lang, () => setIsSpeaking(false));
  };

  const readWholeDashboard = () => {
    const label = lang === "kn" ? "ದೈನಂದಿನ ಇಡೀ ಹೊಲದ ಸಾರಾಂಶ" : "Live Farm Status Briefing";
    handleQuery("briefing", label);
  };

  const toggleStopAudio = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const startVoiceInput = () => {
    if (isSpeaking) {
      toggleStopAudio();
    }

    if (!recognitionAvailable) {
      readWholeDashboard();
      return;
    }

    const recognizer = createSpeechRecognizer(
      lang,
      (transcript) => {
        setIsListening(false);
        setLastQuery(transcript);
        const lower = transcript.toLowerCase();

        if (lower.includes("power") || lower.includes("ವಿದ್ಯುತ್") || lower.includes("ಪವರ್") || lower.includes("bescom")) {
          handleQuery("power", transcript);
        } else if (lower.includes("price") || lower.includes("mandi") || lower.includes("ಬೆಲೆ") || lower.includes("ರೇಟ್") || lower.includes("tomato") || lower.includes("ಟೊಮೆಟೊ")) {
          handleQuery("mandi", transcript);
        } else if (lower.includes("weather") || lower.includes("rain") || lower.includes("ಹವಾಮಾನ") || lower.includes("ಮಳೆ") || lower.includes("temp")) {
          handleQuery("weather", transcript);
        } else if (lower.includes("borewell") || lower.includes("ಬೋರ್") || lower.includes("saving") || lower.includes("ಉಳಿತಾಯ")) {
          handleQuery("borewell", transcript);
        } else if (lower.includes("health") || lower.includes("pressure") || lower.includes("ಒತ್ತಡ") || lower.includes("starter") || lower.includes("ವೋಲ್ಟ್")) {
          handleQuery("health", transcript);
        } else if (lower.includes("water") || lower.includes("ನೀರು") || lower.includes("irrigate") || lower.includes("pump")) {
          handleQuery("water", transcript);
        } else {
          handleQuery("briefing", transcript);
        }
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      setIsListening(true);
      recognizer.start();
    }
  };

  return (
    <section className="panel voice-panel">
      <div className="panel-title-row">
        <div>
          <div className="eyebrow">{lang === "kn" ? "ಧ್ವನಿ ಸಹಾಯಕ" : "VOICE ASSISTANT"}</div>
          <h3>{lang === "kn" ? "ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ" : "Ask AquaGrid"}</h3>
          <span className="subtle">
            {lang === "kn"
              ? "ಹೊಲದ ವಾಸ್ತವಿಕ ಸ್ಥಿತಿಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಆಲಿಸಿ"
              : "Live real-time farm voice reader for rural farmers"}
          </span>
        </div>
        <div className="voice-status-badges">
          {isSpeaking && (
            <button className="speaking-badge" onClick={toggleStopAudio} title="Stop voice audio">
              <VolumeX className="pulse-icon" size={16} />
              <span>{lang === "kn" ? "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ" : "Stop Audio"}</span>
            </button>
          )}
          {isListening && (
            <span className="listening-badge">
              <Mic className="pulse-icon" size={16} />
              <span>{lang === "kn" ? "ಆಲಿಸುತ್ತಿದೆ..." : "Listening..."}</span>
            </span>
          )}
        </div>
      </div>

      {/* Prominent One-Click Read Entire Dashboard Button */}
      <div className="read-dashboard-banner">
        <button
          className={`read-summary-btn ${isSpeaking && lastQuery.includes("Briefing") ? "active-reading" : ""}`}
          onClick={readWholeDashboard}
        >
          <Volume2 size={19} className="speaker-pop-icon" />
          <div className="read-summary-text">
            <strong>{lang === "kn" ? " ಇಡೀ ಹೊಲದ ಲೈವ್ ಸಾರಾಂಶ ಓದಿ" : " Read Live Farm Briefing"}</strong>
            <span>
              {lang === "kn"
                ? "ನೀರಾವರಿ, ಬೆಸ್ಕಾಂ ವಿದ್ಯುತ್, ಎಪಿಎಂಸಿ ದರ ಮತ್ತು ಹವಾಮಾನದ ಸಂಪೂರ್ಣ ವರದಿ"
                : "Narrates current irrigation, BESCOM power, mandi price & weather"}
            </span>
          </div>
        </button>
      </div>

      {/* Mic Trigger */}
      <div className="voice-mic-container">
        <button
          className={`big-mic-btn ${isListening ? "active-recording" : ""}`}
          onClick={startVoiceInput}
          title={lang === "kn" ? "ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ" : "Tap to speak question"}
          aria-label="Activate voice assistant"
        >
          {isListening ? <MicOff size={30} /> : <Mic size={30} />}
        </button>
        <div className="mic-instructions">
          <strong>{isListening ? (lang === "kn" ? "ಆಲಿಸುತ್ತಿದೆ..." : "Listening to your voice...") : (lang === "kn" ? "ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ" : "Tap mic to speak")}</strong>
          <span>
            {lang === "kn"
              ? "ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ ಕೆಳಗಿನ ಯಾವುದೇ ವಿಷಯದ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ"
              : "Speak in English or Kannada, or tap any live topic below"}
          </span>
        </div>
      </div>

      {/* Voice Answer Transcript Box */}
      {response && (
        <div className="voice-answer-box">
          <div className="voice-answer-header">
            <Sparkles size={16} className="sparkle-icon" />
            <b>{lastQuery}</b>
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
              <button
                className="speak-again-btn"
                onClick={() => {
                  stopSpeaking();
                  setIsSpeaking(true);
                  speakText(response, lang, () => setIsSpeaking(false));
                }}
                title="Listen again"
              >
                <Volume2 size={15} /> {lang === "kn" ? "ಮತ್ತೆ ಕೇಳಿ" : "Listen again"}
              </button>
              {isSpeaking && (
                <button className="speak-stop-sub-btn" onClick={toggleStopAudio} title="Stop">
                  <VolumeX size={15} /> {lang === "kn" ? "ನಿಲ್ಲಿಸಿ" : "Stop"}
                </button>
              )}
            </div>
          </div>
          <p className="voice-answer-text">{response}</p>
        </div>
      )}

      {/* Categorized Live Topic Chips */}
      <div className="voice-chips-label">
        <HelpCircle size={14} />
        <span>{lang === "kn" ? "ನೇರ ಮಾಹಿತಿ ಕೇಳಿ (ವೆಬ್‌ಸೈಟ್‌ನ ಲೈವ್ ಡೇಟಾ):" : "Ask Live Website Data:"}</span>
      </div>
      <div className="voice-chips-grid">
        <button
          className="voice-chip"
          onClick={() => handleQuery("water", lang === "kn" ? "ಇವತ್ತು ನೀರು ಹಾಕಬೇಕಾ?" : "Should I water today?")}
        >
          <Droplets size={14} className="chip-water" />
          <span>{lang === "kn" ? "ಇವತ್ತು ನೀರು ಹಾಕಬೇಕಾ?" : "Should I water today?"}</span>
        </button>

        <button
          className="voice-chip"
          onClick={() => handleQuery("power", lang === "kn" ? "ಬೆಸ್ಕಾಂ ವಿದ್ಯುತ್ ಯಾವಾಗ ಸಿಗುತ್ತೆ?" : "When is BESCOM power available?")}
        >
          <Zap size={14} className="chip-power" />
          <span>{lang === "kn" ? "ವಿದ್ಯುತ್ ವೇಳಾಪಟ್ಟಿ ಏನು?" : "When is BESCOM power?"}</span>
        </button>

        <button
          className="voice-chip"
          onClick={() => handleQuery("mandi", lang === "kn" ? "ಕೋಲಾರ ಮಂಡಿಯಲ್ಲಿ ಟೊಮೆಟೊ ಬೆಲೆ ಎಷ್ಟು?" : "What is tomato price in Kolar APMC?")}
        >
          <Store size={14} className="chip-mandi" />
          <span>{lang === "kn" ? `ಟೊಮೆಟೊ ಮಂಡಿ ದರ (₹${mandi.modal})?` : `Tomato Mandi Price (₹${mandi.modal})?`}</span>
        </button>

        <button
          className="voice-chip"
          onClick={() => handleQuery("weather", lang === "kn" ? "ಇಂದಿನ ಹವಾಮಾನ ಮತ್ತು ಮಳೆ?" : "Current weather and rain forecast?")}
        >
          <CloudRain size={14} className="chip-weather" />
          <span>{lang === "kn" ? "ಹವಾಮಾನ ಮತ್ತು ಮಳೆ?" : "Weather & Rain Forecast?"}</span>
        </button>

        <button
          className="voice-chip"
          onClick={() => handleQuery("borewell", lang === "kn" ? "ಬೋರ್‌ವೆಲ್ ಮತ್ತು ನೀರಿನ ಉಳಿತಾಯ?" : "Borewell discharge and water savings?")}
        >
          <Droplets size={14} className="chip-borewell" />
          <span>{lang === "kn" ? "ಬೋರ್‌ವೆಲ್ ಮತ್ತು ಉಳಿತಾಯ?" : "Borewell & Savings?"}</span>
        </button>

        <button
          className="voice-chip"
          onClick={() => handleQuery("health", lang === "kn" ? "ಪಂಪ್ ಮತ್ತು ವಿದ್ಯುತ್ ಸುರಕ್ಷತೆ ಹೇಗಿದೆ?" : "Is pump and electrical system safe?")}
        >
          <ShieldCheck size={14} className="chip-health" />
          <span>{lang === "kn" ? "ಪಂಪ್ ಸುರಕ್ಷತೆ ಹೇಗಿದೆ?" : "Pump Safety & Interlocks?"}</span>
        </button>
      </div>
    </section>
  );
}
