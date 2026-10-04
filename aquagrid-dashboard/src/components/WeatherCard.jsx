import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Wind, Droplets, RefreshCw } from "lucide-react";
import { fetchWeather } from "../utils/liveData";

export default function WeatherCard({ t, lang = "en" }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await fetchWeather();
    setWeather(data);
    setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isRainLikely = weather?.precipProbMax >= 40 || weather?.rainExpectedInHours != null;

  const rainStatusText = weather?.rainExpectedInHours != null
    ? (lang === "kn" ? `~${weather.rainExpectedInHours} ಗಂ. ಮಳೆ ಸಾಧ್ಯತೆ` : `Rain expected in ~${weather.rainExpectedInHours}h`)
    : weather?.precipProbMax >= 40
    ? (lang === "kn" ? `ಮಳೆ ಸಂಭವನೀಯತೆ: ${weather.precipProbMax}%` : `Rain probability: ${weather.precipProbMax}%`)
    : (lang === "kn" ? "ಇಂದು ಮಳೆ ಮುನ್ಸೂಚನೆ ಇಲ್ಲ" : "No rain expected today");

  const irrigationAdvice = isRainLikely
    ? (lang === "kn" 
        ? "ಮಳೆ ನಿರೀಕ್ಷೆಯಿದೆ — ನೀರು ವ್ಯರ್ಥವಾಗುವುದನ್ನು ತಡೆಯಲು ಸ್ವಯಂಚಾಲಿತ ನೀರಾವರಿಯನ್ನು ನಿಲ್ಲಿಸಬಹುದು." 
        : "Rain likely soon — auto-irrigation can pause to prevent water wastage and over-saturation.")
    : (lang === "kn"
        ? "ಉತ್ತಮ ನೀರಾವರಿ ದಿನ • ಸೌರ ಶಕ್ತಿ ಲಭ್ಯ • ಶಾಂತ ಗಾಳಿ"
        : "Optimal irrigation weather • High solar generation • Calm winds");

  const icon = weather?.weatherCode <= 3
    ? <Sun size={32} className="good-color" />
    : weather?.weatherCode <= 29
    ? <CloudRain size={32} className="accent-blue" />
    : <Cloud size={32} className="accent-blue" />;

  return (
    <section className="panel farmer-panel weather-live-panel">
      <div className="panel-title-row">
        <div>
          <div className="eyebrow">{lang === "kn" ? "ಹವಾಮಾನ ಮತ್ತು ಮುನ್ಸೂಚನೆ" : "WEATHER & RAIN FORECAST"}</div>
          <h3>{lang === "kn" ? "ಕೋಲಾರ ಸ್ಥಳೀಯ ಹವಾಮಾನ" : "Today's Field Weather"}</h3>
          <span className="subtle">Kolar, Karnataka • Hyperlocal Open-Meteo Radar</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button 
            className="icon-speaker-btn" 
            onClick={load} 
            title={lang === "kn" ? "ಹವಾಮಾನ ನವೀಕರಿಸಿ" : "Refresh live weather"} 
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "spin-icon" : ""} />
          </button>
          <CloudRain size={22} className="mandi-color" />
        </div>
      </div>

      {loading && !weather ? (
        <div className="weather-loading">
          <RefreshCw size={20} className="spin-icon" /> 
          <span>{lang === "kn" ? "ನೇರ ಹವಾಮಾನ ಪಡೆಯಲಾಗುತ್ತಿದೆ..." : "Fetching live weather data..."}</span>
        </div>
      ) : weather ? (
        <>
          <div className="weather-main farmer-weather">
            {icon}
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <strong style={{ fontSize: "1.75rem", lineHeight: 1.1 }}>{weather.tempC}°C</strong>
                <span style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>{weather.description}</span>
              </div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div className="temp-range-pill" title="Daily Temperature Range">
                <span>↑ {weather.tempMax}°C</span>
                <span className="sep">•</span>
                <span>↓ {weather.tempMin}°C</span>
              </div>
            </div>
          </div>

          <div className="weather-stats-row">
            <span title="Relative Humidity">
              <Droplets size={14} /> {weather.humidity}%
            </span>
            <span title="Wind Speed">
              <Wind size={14} /> {weather.windKmh} km/h
            </span>
            {weather.precipToday > 0 && (
              <span title="Today's Recorded Rainfall">
                <CloudRain size={14} /> {weather.precipToday.toFixed(1)} mm
              </span>
            )}
            <span className={`rain-badge ${isRainLikely ? "rain-likely" : "rain-clear"}`}>
              <CloudRain size={14} /> {rainStatusText}
            </span>
          </div>

          <div className={`weather-message ${isRainLikely ? "weather-notice-rain" : ""}`}>
            <Sun size={17} />
            <span>{irrigationAdvice}</span>
          </div>

          {lastUpdated && (
            <div className="weather-updated">
              {lang === "kn" ? `ಇಂದು ನವೀಕರಿಸಲಾಗಿದೆ ${lastUpdated}` : `Updated today at ${lastUpdated}`}
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
