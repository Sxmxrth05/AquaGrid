import { useState, useEffect } from "react";
import { Clock, Zap, Sun, Moon, AlertCircle, Volume2, ShieldCheck } from "lucide-react";
import { speakText } from "../utils/speech";
import { getBescomSchedule } from "../utils/liveData";

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

export default function PowerWindowPlanner({ t, lang = "en", powerCut, setPowerCut }) {
  const [speaking, setSpeaking] = useState(false);
  const [schedule, setSchedule] = useState(() => getBescomSchedule(false));

  useEffect(() => {
    const update = () => setSchedule(getBescomSchedule(powerCut));
    update();
    const interval = setInterval(update, 60 * 1000);
    return () => clearInterval(interval);
  }, [powerCut]);

  const nextBatchHour = schedule.batches.find(b => {
    const now = new Date();
    const curFrac = now.getHours() + now.getMinutes() / 60;
    return b.start > curFrac;
  })?.start ?? schedule.batches[0]?.start;

  const nextBatchTimeStr = nextBatchHour != null ? formatHourTo12h(nextBatchHour) : "";

  const handleListen = () => {
    const powerStatus = schedule.isLiveWindow
      ? `Power is ON now. ${schedule.currentBatch?.label} window has ${formatMinutesToHours(schedule.minutesRemaining)} remaining.`
      : `Power is OFF now. Next window starts in ${formatMinutesToHours(schedule.nextBatchIn)} at ${nextBatchTimeStr}.`;

    const text = lang === "kn"
      ? (powerCut
          ? `ಎಚ್ಚರಿಕೆ: ವಿದ್ಯುತ್ ಕಡಿತ ಸಕ್ರಿಯವಾಗಿದೆ. ನೀರಾವರಿ ಅವಧಿ 3 ಗಂಟೆಗೆ ಇಳಿಕೆಯಾಗಿದೆ. ಹೂಬಿಡುವ ಹಂತದ ವಲಯ 2 ಬೆಳೆಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಲಾಗಿದೆ.`
          : `ಇಂದಿನ ಬೆಸ್ಕಾಂ 3-ಫೇಸ್ ಪೂರೈಕೆ: ${schedule.totalDailyHours} ಗಂಟೆಗಳು. ${powerStatus}`)
      : (powerCut
          ? `Alert: BESCOM power cut active. Available window reduced to 3 hours. AquaGrid re-allocated scarce energy to Zone 2 flowering crops.`
          : `Today's BESCOM 3-phase schedule allocates ${schedule.totalDailyHours} hours. ${powerStatus}`);

    setSpeaking(true);
    speakText(text, lang, () => setSpeaking(false));
  };

  return (
    <section className="panel power-window-panel">
      <div className="panel-title-row">
        <div>
          <div className="eyebrow">{lang === "kn" ? "ವಿದ್ಯುತ್ ಯೋಜನೆ" : "GRID POWER & SCHEDULING"}</div>
          <h3>{lang === "kn" ? "ಬೆಸ್ಕಾಂ 3-ಫೇಸ್ ವಿದ್ಯುತ್ ವಿಂಡೋ" : "Power-Window Planner (BESCOM 3-Phase)"}</h3>
          <span className="subtle">
            {powerCut
              ? (lang === "kn" ? "ವಿದ್ಯುತ್ ಕಡಿತ ಸಕ್ರಿಯ — ತುರ್ತು ಮರುಹಂಚಿಕೆ" : "Power cut scenario active — water rationed to priority zone")
              : (lang === "kn" ? "ದಿನಕ್ಕೆ 6 ಗಂಟೆ: ಹಗಲು ಮತ್ತು ರಾತ್ರಿ ಪಾಳಿಗಳಲ್ಲಿ ಹಂಚಿಕೆ" : "6h daily allocation split into Day & Night shifts")}
          </span>
        </div>
        <div className="card-top-actions" style={{ gap: "10px" }}>
          <button className="icon-speaker-btn" onClick={handleListen} title={t.listenAdvice || "Listen to status"}>
            <Volume2 size={17} />
          </button>
          <Zap size={22} className={powerCut ? "alert-color" : "good-color"} />
        </div>
      </div>

      {/* Live power status indicator */}
      <div className="power-live-status-card">
        <div className="power-status-clock-col">
          <Clock size={16} />
          <span>{lang === "kn" ? "ಸ್ಥಳೀಯ ಸಮಯ:" : "Local Time:"} <strong>{schedule.localTime}</strong></span>
        </div>
        <div className="power-status-pill-col">
          {schedule.isLiveWindow ? (
            <span className="status-power-on">
              <Zap size={13} /> {lang === "kn" ? "3-ಫೇಸ್ ವಿದ್ಯುತ್ ಚಾಲ್ತಿಯಲ್ಲಿದೆ" : "3-Phase Power Active"} ({formatMinutesToHours(schedule.minutesRemaining)} {lang === "kn" ? "ಬಾಕಿ" : "left"})
            </span>
          ) : (
            <span className="status-power-off">
              {lang === "kn" 
                ? `ವಿದ್ಯುತ್ ಆಫ್ ಆಗಿದೆ • ಮುಂದಿನ ಪಾಳಿ ${nextBatchTimeStr} (${formatMinutesToHours(schedule.nextBatchIn)} ರಲ್ಲಿ)`
                : `Power OFF • Next window starts at ${nextBatchTimeStr} (in ${formatMinutesToHours(schedule.nextBatchIn)})`}
            </span>
          )}
        </div>
      </div>

      <div className="power-batches-grid">
        {schedule.batches.map((b, i) => {
          const isActive = schedule.isLiveWindow && schedule.currentBatch?.label === b.label;
          const timeRange = `${formatHourTo12h(b.start)} – ${formatHourTo12h(b.end)}`;
          return (
            <div key={i} className={`batch-card ${isActive ? "active-batch" : powerCut && i > 0 ? "cancelled" : "pending-batch"}`}>
              <div className="batch-header">
                {b.type === "solar" ? <Sun size={17} className="sun-icon" /> : <Moon size={17} className="moon-icon" />}
                <strong>{b.label}</strong>
                <span className="batch-tag">
                  {isActive 
                    ? (lang === "kn" ? "ಈಗ ಸಕ್ರಿಯವಾಗಿದೆ" : "Active Now") 
                    : b.type === "solar" 
                    ? (lang === "kn" ? "ಸೌರ ಗರಿಷ್ಠ" : "Solar Peak") 
                    : (lang === "kn" ? "ಗ್ರಿಡ್ ಬ್ಯಾಚ್" : "Grid Batch")}
                </span>
              </div>
              <div className="batch-timeline">
                <span className={`time-block ${isActive ? "primary" : "secondary"}`}>
                  {timeRange} • {b.type === "solar" 
                    ? (lang === "kn" ? "ವಲಯ 2 (ಟೊಮೆಟೊ) ಆದ್ಯತೆ" : "Zone 2 (Tomato) Priority") 
                    : (lang === "kn" ? "ಕೃಷಿ ಹೊಂಡ / ಸ್ಟ್ಯಾಂಡ್‌ಬೈ" : "Farm Pond / Standby")}
                </span>
                {!powerCut && b.type === "solar" && (
                  <span className="time-block buffer">
                    {lang === "kn" ? "ಬೆಳಿಗ್ಗೆ 09:00 ನಂತರ • ಸೌರ ಬಫರ್ ಸಂಗ್ರಹಣೆ" : "After 09:00 • Solar Storage Buffer"}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {powerCut && (
          <div className="batch-card cancelled">
            <div className="batch-header">
              <Moon size={17} />
              <strong>{lang === "kn" ? "ರಾತ್ರಿ ಪಾಳಿ" : "Night Shift"}</strong>
              <span className="batch-tag cancelled-tag">{lang === "kn" ? "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ" : "Cancelled"}</span>
            </div>
            <div className="batch-timeline">
              <span className="time-block alert-text">
                {lang === "kn" ? "ವಿದ್ಯುತ್ ಕಡಿತ: ರಾತ್ರಿ ಸರಬರಾಜು ಇರುವುದಿಲ್ಲ" : "Grid Rationing: Night shift unavailable"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="planner-advice-note">
        <ShieldCheck size={18} className="advice-note-icon" />
        <span>
          {powerCut
            ? (lang === "kn"
              ? "ನ್ಯಾಪ್‌ಸ್ಯಾಕ್ ಅಲ್ಗಾರಿದಮ್ ಸಕ್ರಿಯ: ಸೀಮಿತ ವಿದ್ಯುತ್ ಅನ್ನು ಹೂಬಿಡುವ ಹಂತದಲ್ಲಿರುವ ಸೂಕ್ಷ್ಮ ವಲಯ 2 ಬೆಳೆಗಳಿಗೆ ಮಾತ್ರ ಹಂಚಿಕೆ ಮಾಡಲಾಗಿದೆ."
              : "Knapsack optimizer active: Limited grid energy allocated exclusively to high-sensitivity flowering crops (Zone 2).")
            : (lang === "kn"
              ? "ಬೆಳಿಗ್ಗೆ 6:00 ರಿಂದ 9:00 ರವರೆಗೆ ಸೌರ ಪಂಪ್ ಬಳಸಿ. ರಾತ್ರಿ ಪಾಳಿಯನ್ನು ಕೃಷಿ ಹೊಂಡ ಮರುತುಂಬಿಸಲು ಮೀಸಲಿಡಿ."
              : "Run high-priority drip between 06:00 - 09:00 using solar sync. Reserve night shift for pond refilling.")}
        </span>
      </div>

      <div className="power-cut-toggle-row">
        <button
          className={`toggle-scenario-btn ${powerCut ? "active-alert" : ""}`}
          onClick={() => setPowerCut(!powerCut)}
        >
          <AlertCircle size={15} />
          <span>
            {powerCut 
              ? (lang === "kn" ? "ಸಾಮಾನ್ಯ ವಿದ್ಯುತ್ ಮರುಸ್ಥಾಪಿಸಿ (6 ಗಂಟೆ)" : "Restore Normal Grid Power (6h)") 
              : (lang === "kn" ? "ಬೆಸ್ಕಾಂ ವಿದ್ಯುತ್ ಕಡಿತ ಅನುಕರಿಸಿ (3 ಗಂಟೆಗೆ ಕಡಿತ)" : "Simulate BESCOM Power Cut (Curtail to 3h)")}
          </span>
        </button>
      </div>
    </section>
  );
}
