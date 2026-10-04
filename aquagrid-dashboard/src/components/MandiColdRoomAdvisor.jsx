import { useState, useMemo } from "react";
import { Store, Snowflake, TrendingDown, TrendingUp, CheckCircle2, Volume2, Info } from "lucide-react";
import { speakText } from "../utils/speech";
import { getMandiPrice } from "../utils/liveData";

export default function MandiColdRoomAdvisor({ t, lang = "en" }) {
  const [booked, setBooked] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Price is derived once per render (changes daily based on Kolar APMC data)
  const price = useMemo(() => getMandiPrice(), []);

  const isLow = price.modal < 700;
  const isHigh = price.modal > 1200;

  // Calculate position in the min-max range (0 to 100%)
  const rangePercent = Math.min(
    100,
    Math.max(0, Math.round(((price.modal - price.min) / (price.max - price.min)) * 100))
  );

  const adviceEn = isLow
    ? `Price is in the lower bracket (₹${price.modal}/qtl). Store in Solar Cold Room (Sindhanur FPO @ ₹10/crate) for 3–5 days to prevent distress selling.`
    : isHigh
    ? `Price is high at ₹${price.modal}/qtl. Excellent profit margin! Transport harvested crates directly to Kolar APMC.`
    : `Price is moderate at ₹${price.modal}/qtl. Market is stable. Monitor for 1–2 days or store in cold room to time higher prices.`;

  const adviceKn = isLow
    ? `ದರವು ಕಡಿಮೆ ಮಟ್ಟದಲ್ಲಿದೆ (₹${price.modal}/ಕ್ವಿಂಟಾಲ್). ನಷ್ಟ ತಡೆಯಲು ಸೌರ ಶೀತಲೀಕರಣದಲ್ಲಿ (ಸಿಂಧನೂರು ಎಫ್‌ಪಿಒ @ ₹10/ಕ್ರೇಟ್) 3–5 ದಿನ ಸಂಗ್ರಹಿಸಿ.`
    : isHigh
    ? `ದರವು ₹${price.modal}/ಕ್ವಿಂಟಾಲ್ ತಲುಪಿದೆ! ಲಾಭದಾಯಕ ಸಮಯ. ಕಟಾವು ಮಾಡಿದ ಟೊಮೆಟೊವನ್ನು ತಕ್ಷಣ ಕೋಲಾರ ಎಪಿಎಂಸಿಗೆ ಕಳುಹಿಸಿ.`
    : `ದರವು ಸಾಧಾರಣವಾಗಿದೆ (₹${price.modal}/ಕ್ವಿಂಟಾಲ್). ಮಾರುಕಟ್ಟೆ ಸ್ಥಿರವಾಗಿದೆ. 1–2 ದಿನ ಗಮನಿಸಿ ಅಥವಾ ಉತ್ತಮ ಬೆಲೆಗಾಗಿ ಶೀತಲೀಕರಣ ಬಳಸಿ.`;

  const handleListen = () => {
    const text = lang === "kn"
      ? `ಕೋಲಾರ ಎಪಿಎಂಸಿ ಟೊಮೆಟೊ ಇಂದಿನ ದರ ಕ್ವಿಂಟಾಲ್‌ಗೆ ${price.modal} ರೂಪಾಯಿಗಳು. ${adviceKn}`
      : `Kolar APMC tomato price is ${price.modal} rupees per quintal today. ${adviceEn}`;

    setSpeaking(true);
    speakText(text, lang, () => setSpeaking(false));
  };

  return (
    <section className="panel mandi-panel">
      <div className="panel-title-row">
        <div>
          <div className="eyebrow">
            {lang === "kn" ? "ಮಾರುಕಟ್ಟೆ ದರ ಮತ್ತು ಶೀತಲೀಕರಣ" : "MARKET INTELLIGENCE & COLD STORAGE"}
          </div>
          <h3>
            {lang === "kn" ? "ಕೋಲಾರ ಎಪಿಎಂಸಿ ಟೊಮೆಟೊ ದರ" : "Kolar APMC Tomato Mandi Rate"}
          </h3>
          <span className="subtle">
            {lang === "kn"
              ? `ದೈನಂದಿನ ಮಾರುಕಟ್ಟೆ ಶ್ರೇಣಿ: ₹${price.min} – ₹${price.max} / ಕ್ವಿಂಟಾಲ್`
              : `Agmarknet Daily Range: ₹${price.min} – ₹${price.max} / quintal`}
          </span>
        </div>
        <div className="card-top-actions" style={{ gap: "10px" }}>
          <button className="icon-speaker-btn" onClick={handleListen} title={t.listenAdvice || "Listen to advice"}>
            <Volume2 size={17} />
          </button>
          <Store size={22} className="mandi-color" />
        </div>
      </div>

      <div className="mandi-price-box">
        <div className="price-tag-row">
          <div className="modal-price">
            <span className="price-label">
              {lang === "kn" ? "ಇಂದಿನ ಮಾದರಿ ದರ (Modal Price)" : "Today's Modal Benchmark"} • {price.date}
            </span>
            <strong className={`price-figure ${isLow ? "price-low" : isHigh ? "price-high" : "price-mid"}`}>
              ₹{price.modal} <small>/ quintal</small>
            </strong>
          </div>
          <div className={`price-status-badge ${isLow ? "status-low" : isHigh ? "status-high" : "status-mid"}`}>
            {isLow ? <TrendingDown size={15} /> : <TrendingUp size={15} />}
            <span>{isLow ? "Low Rate" : isHigh ? "High Rate" : "Moderate Rate"}</span>
          </div>
        </div>

        {/* Clear visual price position meter */}
        <div className="price-meter-container">
          <div className="price-meter-labels">
            <span>Min: ₹{price.min}</span>
            <span className="current-pos-label">Today: ₹{price.modal}</span>
            <span>Max: ₹{price.max}</span>
          </div>
          <div className="price-meter-track">
            <div
              className="price-meter-fill"
              style={{
                width: `${rangePercent}%`,
                background: isLow 
                  ? "linear-gradient(90deg, #ef4444, #f87171)" 
                  : isHigh 
                  ? "linear-gradient(90deg, #10b981, #22c55e)" 
                  : "linear-gradient(90deg, #f59e0b, #eab308)",
              }}
            />
            <div
              className="price-meter-thumb"
              style={{ left: `${rangePercent}%` }}
              title={`Today's price sits at ${rangePercent}% of recent market range`}
            />
          </div>
        </div>

        {/* Advisor recommendation card */}
        <div className={`advisor-advice-box ${isLow ? "advisor-low" : isHigh ? "advisor-high" : "advisor-mid"}`}>
          <Snowflake size={20} className="advisor-icon" />
          <div>
            <strong>
              {lang === "kn"
                ? (isLow ? "ಸಲಹೆ: ನಷ್ಟ ತಡೆಯಲು ಶೀತಲೀಕರಣ ಬಳಸಿ" : isHigh ? "ಸಲಹೆ: ಈಗಲೇ ಮಾರುಕಟ್ಟೆಗೆ ಸಾಗಿಸಿ" : "ಸಲಹೆ: ದರ ಗಮನಿಸಿ (ಹೋಲ್ಡ್ ಮಾಡಿ)")
                : (isLow ? "Advisor Recommendation: Store in Cold Room" : isHigh ? "Advisor Recommendation: Good Time to Sell" : "Advisor Recommendation: Hold & Monitor Price")
              }
            </strong>
            <p>{lang === "kn" ? adviceKn : adviceEn}</p>
          </div>
        </div>
      </div>

      <div className="cold-room-action-wrap" style={{ marginTop: "14px" }}>
        {!booked ? (
          <button className="caas-booking-btn" onClick={() => setBooked(true)}>
            <Snowflake size={17} />
            <span>
              {lang === "kn" 
                ? "ಸೌರ ಶೀತಲೀಕರಣ ಕೊಠಡಿ ಕಾಯ್ದಿರಿಸಿ (50 ಕ್ರೇಟ್‌ಗಳು • ₹10/ಕ್ರೇಟ್)" 
                : "Book Solar Cold Room (50 Crates • ₹10/crate/day)"}
            </span>
          </button>
        ) : (
          <div className="booked-notification">
            <CheckCircle2 size={20} className="booked-check-icon" />
            <div>
              <strong>
                {lang === "kn" ? "ಶೀತಲೀಕರಣ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ!" : "Cold Storage Booking Confirmed!"}
              </strong>
              <span>
                {lang === "kn"
                  ? "ಸಿಂಧನೂರು ಎಫ್‌ಪಿಒ ಸೌರ ಘಟಕ • ಕ್ರೇಟ್ ಐಡಿ: #KL-401 ರಿಂದ #KL-450 • ಬಾಳಿಕೆ 14 ದಿನ ವಿಸ್ತರಣೆ"
                  : "Sindhanur FPO Solar Unit • Crates #KL-401 to #KL-450 • Shelf life extended +14 days"}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
