import { useState } from "react";
import { TrendingDown, Droplets, Clock, Zap, Moon, Volume2, Award } from "lucide-react";
import { speakText } from "../utils/speech";

export default function SavingsLedger({ t, lang }) {
  const [baselineType, setBaselineType] = useState("B2"); // B2: Timer drip, B1: Flood
  const [speaking, setSpeaking] = useState(false);

  const waterSaved = baselineType === "B2" ? "13,200 L" : "31,400 L";
  const percentage = baselineType === "B2" ? "24%" : "48%";
  const energySaved = baselineType === "B2" ? "10.3 kWh" : "24.5 kWh";
  const pumpHours = baselineType === "B2" ? "10.2 hrs" : "22.8 hrs";

  const handleListen = () => {
    const text = lang === "kn"
      ? `ಪ್ರಮಾಣೀಕೃತ ಉಳಿತಾಯ ವರದಿ: ಈ ವಾರ ಸಾಂಪ್ರದಾಯಿಕ ನೀರಾವರಿಗೆ ಹೋಲಿಸಿದರೆ ${waterSaved} ನೀರು ಮತ್ತು ${pumpHours} ಪಂಪ್ ಸಮಯ ಉಳಿತಾಯವಾಗಿದೆ. ಶೇ.24 ರಷ್ಟು ನೀರಿನ ಸಂರಕ್ಷಣೆ ದಾಖಲಾಗಿದೆ ಮತ್ತು 4 ರಾತ್ರಿ ಹೊಲದ ಭೇಟಿಗಳು ತಪ್ಪಿವೆ.`
      : `Quantified Savings Ledger: This week AquaGrid saved ${waterSaved} of water and ${pumpHours} of pump runtime compared to traditional practice, achieving a ${percentage} water conservation rate with zero dangerous night trips.`;

    setSpeaking(true);
    speakText(text, lang, () => setSpeaking(false));
  };

  return (
    <section className="panel savings-panel">
      <div className="panel-title-row">
        <div>
          <div className="eyebrow">{t.savingsLedger}</div>
          <h3>{t.counterfactual}</h3>
          <span className="subtle">{t.seasonCumulative}</span>
        </div>
        <div className="card-top-actions">
          <button className="icon-speaker-btn" onClick={handleListen} title={t.listenAdvice}>
            <Volume2 size={17} />
          </button>
          <Award size={21} className="gold-color" />
        </div>
      </div>

      <div className="baseline-toggle-bar">
        <span>{lang === "kn" ? "ಹೋಲಿಕೆಯ ಆಧಾರ:" : "Baseline Benchmark:"}</span>
        <button
          className={`baseline-chip ${baselineType === "B2" ? "active" : ""}`}
          onClick={() => setBaselineType("B2")}
        >
          {lang === "kn" ? "B2: ಟೈಮರ್ ಡ್ರಿಪ್ (ನೈಜ ಮಾದರಿ)" : "B2: Drip on Fixed Timer"}
        </button>
        <button
          className={`baseline-chip ${baselineType === "B1" ? "active" : ""}`}
          onClick={() => setBaselineType("B1")}
        >
          {lang === "kn" ? "B1: ಹರಿವು ನೀರಾವರಿ (ಸಾಂಪ್ರದಾಯಿಕ)" : "B1: Furrow / Flood Baseline"}
        </button>
      </div>

      <div className="savings-kpi-grid">
        <div className="savings-kpi-card green-highlight">
          <div className="kpi-icon"><Droplets size={20} /></div>
          <div>
            <span className="kpi-label">{t.waterSaved}</span>
            <strong className="kpi-val">{waterSaved}</strong>
            <span className="kpi-sub">(-{percentage} vs baseline)</span>
          </div>
        </div>

        <div className="savings-kpi-card blue-highlight">
          <div className="kpi-icon"><Clock size={20} /></div>
          <div>
            <span className="kpi-label">{t.pumpHoursSaved}</span>
            <strong className="kpi-val">{pumpHours}</strong>
            <span className="kpi-sub">{lang === "kn" ? "ಮೋಟಾರ್ ಸವೆತ ತಡೆ" : "Motor runtime saved"}</span>
          </div>
        </div>

        <div className="savings-kpi-card purple-highlight">
          <div className="kpi-icon"><Zap size={20} /></div>
          <div>
            <span className="kpi-label">{t.energySaved}</span>
            <strong className="kpi-val">{energySaved}</strong>
            <span className="kpi-sub">{lang === "kn" ? "ಗ್ರಿಡ್ ಸಬ್ಸಿಡಿ ಉಳಿತಾಯ" : "Feeder load reduced"}</span>
          </div>
        </div>

        <div className="savings-kpi-card orange-highlight">
          <div className="kpi-icon"><Moon size={20} /></div>
          <div>
            <span className="kpi-label">{t.nightTripsAvoided}</span>
            <strong className="kpi-val">4 Trips</strong>
            <span className="kpi-sub">{lang === "kn" ? "ಸುರಕ್ಷತೆ ಮತ್ತು ನೆಮ್ಮದಿ" : "Farmer safety & sleep"}</span>
          </div>
        </div>
      </div>

      <div className="savings-summary-banner">
        <TrendingDown size={17} />
        <span>{t.vsBaseline}</span>
      </div>
    </section>
  );
}
