import { useState } from "react";
import { CheckCircle2, Droplets, Info, Play, Square, Sun, Volume2 } from "lucide-react";
import { speakText, stopSpeaking } from "../utils/speech";

export default function IrrigationRecommendation({ t, lang, zone, pumpOn, progress, onStart, onStop, completed }) {
  const [speaking, setSpeaking] = useState(false);
  if (!zone) return null;

  const handleListen = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    const message = completed
      ? (lang === "kn"
          ? `ವಲಯ ${zone.id} ರ ನೀರಾವರಿ ಪೂರ್ಣಗೊಂಡಿದೆ. ${zone.target} ಲೀಟರ್ ನೀರು ಯಶಸ್ವಿಯಾಗಿ ತಲುಪಿದೆ.`
          : `Watering complete for Zone ${zone.id}. Target of ${zone.target} Liters has been delivered.`)
      : (lang === "kn"
          ? `ಈಗ ಮಾಡಬೇಕಾದ ಕೆಲಸ: ವಲಯ ${zone.id} ರ ${zone.crop} ಬೆಳೆಗೆ ${zone.target} ಲೀಟರ್ ನೀರು ಹಾಕಿ. ಕಾರಣ: ${t.reasonText} ಸೌರಶಕ್ತಿ ಲಭ್ಯವಿದೆ.`
          : `What to do now: Water Zone ${zone.id} ${zone.crop} with ${zone.target} Liters. Reason: ${t.reasonText} Solar power is available.`);

    setSpeaking(true);
    speakText(message, lang, () => setSpeaking(false));
  };

  return (
    <section className="panel recommendation farmer-recommendation">
      <div className="panel-title-row">
        <div>
          <div className="eyebrow">{t.whatToDoNow}</div>
          <h2>
            <Droplets size={23} /> {t.zone} {zone.id}: {zone.crop}
          </h2>
        </div>
        <div className="card-top-actions">
          <button
            className={`icon-speaker-btn ${speaking ? "speaking" : ""}`}
            onClick={handleListen}
            title={t.listenAdvice}
            aria-label="Listen recommendation aloud"
          >
            <Volume2 size={18} />
          </button>
          {completed ? (
            <span className="success-badge">
              <CheckCircle2 size={15} /> {t.done}
            </span>
          ) : (
            <span className="priority high">{t.needWater}</span>
          )}
        </div>
      </div>

      {completed ? (
        <div className="completed-box">
          <CheckCircle2 size={28} />
          <div>
            <strong>{t.irrigationComplete}</strong>
            <div>{t.waterReached}: {zone.target.toLocaleString()} L</div>
          </div>
        </div>
      ) : (
        <>
          <div className="farmer-answer">
            <strong>{t.zone} {zone.id} {t.needsWater}</strong>
            <span>{zone.target.toLocaleString()} L</span>
          </div>
          <div className="reason">
            <Info size={18} />
            <div>
              <b>{t.whyWater}</b>
              <p>{t.reasonText}</p>
            </div>
          </div>
          <div className="energy-note">
            <Sun size={16} /> {t.solarReady}
          </div>
          {pumpOn && (
            <div className="progress-wrap">
              <div className="progress-label">
                <span>{t.wateringNow}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="progress">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <div className="action-row farmer-actions">
            {!pumpOn ? (
              <button className="primary-btn big-action" onClick={onStart}>
                <Play size={19} /> {t.startIrrigation}
              </button>
            ) : (
              <button className="danger-btn big-action" onClick={onStop}>
                <Square size={18} /> {t.stopIrrigation}
              </button>
            )}
            <button className="listen-action-btn" onClick={handleListen}>
              <Volume2 size={18} /> {speaking ? t.stopSpeaking : t.listenAdvice}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
