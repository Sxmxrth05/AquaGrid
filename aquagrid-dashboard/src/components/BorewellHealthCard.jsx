import { useState } from "react";
import { Activity, Gauge, MapPin, AlertTriangle, CheckCircle2, Volume2, Droplet } from "lucide-react";
import { speakText } from "../utils/speech";

export default function BorewellHealthCard({ t, lang }) {
  const [speaking, setSpeaking] = useState(false);

  const handleListen = () => {
    const text = lang === "kn"
      ? `ಬೋರ್‌ವೆಲ್ ಹೆಲ್ತ್ ಕಾರ್ಡ್ ಮಾಹಿತಿ: ನಿಮ್ಮ ಕೊಳವೆಬಾವಿಯ ನೀರಿನ ಹರಿವು ಪ್ರತಿ ನಿಮಿಷಕ್ಕೆ 64 ಲೀಟರ್ ಇದ್ದು, ನೀರಿನ ಇಳಿಕೆ ಸ್ಥಿರವಾಗಿದೆ. ಕೋಲಾರ ತಾಲೂಕಿನಲ್ಲಿ ಶೇ.193 ಭೂಗರ್ಭಜಲ ಹೊರತೆಗೆಯಲಾಗುತ್ತಿದೆ. ಗ್ರಾಮ ಪಂಚಾಯತ್ ನೀರಿನ ಬಜೆಟ್‌ನ ಶೇ.82 ರಷ್ಟು ಬಳಕೆಯಾಗಿದೆ.`
      : `Borewell Health Card: Current discharge is 64 Liters per minute with stable drawdown. Kolar taluk is in the 193% over-exploited basin. Gram Panchayat water budget is at 82% monthly allocation. Estimated reserve: 5.5 months.`;

    setSpeaking(true);
    speakText(text, lang, () => setSpeaking(false));
  };

  return (
    <section className="panel borewell-panel">
      <div className="panel-title-row">
        <div>
          <div className="eyebrow">{t.borewellHealth}</div>
          <h3>{t.borewellSub}</h3>
          <span className="subtle">{lang === "kn" ? "ಕರ್ನಾಟಕ ನೀರು ಭದ್ರತೆ ಯೋಜನೆಯಡಿ ಶಿಫಾರಸು" : "Per Karnataka Planning Board Water Security Guideline"}</span>
        </div>
        <div className="card-top-actions">
          <button className="icon-speaker-btn" onClick={handleListen} title={t.listenAdvice}>
            <Volume2 size={17} />
          </button>
          <Activity size={20} className="good-color" />
        </div>
      </div>

      <div className="borewell-stats-row">
        <div className="borewell-stat">
          <div className="stat-label"><Gauge size={15} /> {t.dischargeRate}</div>
          <div className="stat-value">64 L/min</div>
          <span className="stat-badge good"><CheckCircle2 size={12} /> {t.normal}</span>
        </div>

        <div className="borewell-stat">
          <div className="stat-label"><Droplet size={15} /> {t.drawdown}</div>
          <div className="stat-value">310 ft Depth</div>
          <span className="stat-badge good"><CheckCircle2 size={12} /> Stable</span>
        </div>

        <div className="borewell-stat">
          <div className="stat-label"><MapPin size={15} /> {lang === "kn" ? "ಅಂದಾಜು ಸಂಗ್ರಹ" : "Est. Reserve"}</div>
          <div className="stat-value">5.5 Months</div>
          <span className="stat-badge warn"><AlertTriangle size={12} /> Critical Basin</span>
        </div>
      </div>

      <div className="gp-budget-box">
        <div className="gp-budget-header">
          <strong>{t.gpWaterBudget}</strong>
          <span>82% Used (18% Buffer)</span>
        </div>
        <div className="gp-progress-bar">
          <div className="gp-progress-fill" style={{ width: "82%" }} />
        </div>
        <span className="gp-note">
          {lang === "kn"
            ? "ಗ್ರಾಮ ಪಂಚಾಯತ್ ಬಜೆಟ್ ರಕ್ಷಿಸಲು ನಿಯಂತ್ರಿತ ಹನಿ ನೀರಾವರಿ ಪಾಲಿಸಿ ಮುಂದುವರಿಸಿ."
            : "Under 'Water is Future' pilot: 525 Gram Panchayats tracking collective aquifer recharge."}
        </span>
      </div>
    </section>
  );
}
