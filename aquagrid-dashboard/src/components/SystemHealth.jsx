import { useState } from "react";
import { CheckCircle2, CircleAlert, Cpu, Gauge, Radio, ShieldCheck, Waves, Zap, Volume2 } from "lucide-react";
import { speakText } from "../utils/speech";

export default function SystemHealth({ t, lang, pressureAlert, setPressureAlert }) {
  const [speaking, setSpeaking] = useState(false);

  const handleListen = () => {
    const text = lang === "kn"
      ? (pressureAlert
          ? `ಎಚ್ಚರಿಕೆ: ನೀರಿನ ಒತ್ತಡ ಕುಸಿದಿದೆ. ಪೈಪ್ ಅಥವಾ ಫಿಲ್ಟರ್ ಪರಿಶೀಲಿಸಿ. ಪಂಪ್ ರಕ್ಷಣೆಗೆ ಕಾಂಟ್ಯಾಕ್ಟರ್ ಆಫ್ ಮಾಡಲಾಗಿದೆ.`
          : `ರೆಟ್ರೋಫಿಟ್ ಪಂಪ್ ನಿಯಂತ್ರಕ ಸ್ಥಿತಿ: ಹಾಲಿ ಸ್ಟಾರ್ಟರ್ ಜೊತೆ ಸಂಪರ್ಕಗೊಂಡಿದೆ. 3-ಫೇಸ್ 415 ವೋಲ್ಟ್ ವಿದ್ಯುತ್ ಸರಿಯಾಗಿದೆ, ನೀರಿನ ಒತ್ತಡ ಮತ್ತು ಹರಿವು ಸಾಮಾನ್ಯವಾಗಿದೆ. ಮಣ್ಣು ಮತ್ತು ಹವಾಮಾನದ ಆಧಾರದ ಮೇಲೆ ಸ್ವಯಂಚಾಲಿತ ನೀರಾವರಿ ಸಕ್ರಿಯವಾಗಿದೆ.`)
      : (pressureAlert
          ? `Alert: Hydraulic pressure drop detected. The retrofit controller engaged safety interlock and tripped the pump starter to prevent dry-run damage.`
          : `Retrofit pump intelligence controller is active alongside existing starter. 3-phase 415 volts electrical state is balanced. Hydraulic flow is 64 litres per minute at 2.4 bar. Edge decision loop is operating normally.`);

    setSpeaking(true);
    speakText(text, lang, () => setSpeaking(false));
  };

  const rows = [
    {
      label: t.starterInterface,
      good: true,
      sub: t.starterInterfaceSub,
      val: "DOL Retrofit OK",
      icon: Cpu,
    },
    {
      label: t.electricalState,
      good: true,
      sub: t.electricalStateSub,
      val: "415V • 7.2A Normal",
      icon: Zap,
    },
    {
      label: t.hydraulicState,
      good: !pressureAlert,
      sub: !pressureAlert ? t.hydraulicStateSub : t.checkLine,
      val: !pressureAlert ? "2.4 bar • 64 L/min" : "0.7 bar (Low Pressure)",
      icon: Gauge,
    },
    {
      label: t.waterSensor,
      good: true,
      sub: t.waterSensorSub,
      val: "Dual Depth Active",
      icon: Waves,
    },
    {
      label: t.edgeGateway,
      good: true,
      sub: t.edgeGatewaySub,
      val: "Autonomous Loop",
      icon: Radio,
    },
  ];

  return (
    <section className="panel retrofit-health-panel">
      <div className="panel-title-row">
        <div>
          <div className="eyebrow">{t.systemHealth}</div>
          <h3>{t.retrofitController}</h3>
          <span className="subtle">{t.retrofitSub}</span>
        </div>
        <div className="card-top-actions">
          <button className="icon-speaker-btn" onClick={handleListen} title={t.listenAdvice}>
            <Volume2 size={17} />
          </button>
          <ShieldCheck size={21} className={pressureAlert ? "alert-color" : "good-color"} />
        </div>
      </div>

      <div className="health-list farmer-health">
        {rows.map(({ label, good, sub, val, icon: Icon }) => (
          <div className="health-row" key={label}>
            <div className={`health-icon ${good ? "good" : "bad"}`}>
              {good ? <Icon size={18} /> : <CircleAlert size={18} />}
            </div>
            <div className="health-info-wrap">
              <strong>{label}</strong>
              <span>{sub}</span>
            </div>
            <div className="health-badge-wrap">
              <span className={`health-val-tag ${good ? "normal" : "alert"}`}>{val}</span>
              <b className={good ? "good-text" : "bad-text"}>{good ? t.normal : t.checkNow}</b>
            </div>
          </div>
        ))}
      </div>

      {!pressureAlert ? (
        <div className="all-ok">
          <CheckCircle2 size={16} />
          <span>{t.allSystems} • Electrical & Hydraulic Safety Interlocks Engaged</span>
        </div>
      ) : (
        <div className="alert-box">
          <CircleAlert size={18} />
          <div>
            <b>{t.pressureLow} (Line Rupture / Cavitation Detected)</b>
            <span>Retrofit controller auto-tripped starter contactor to protect pump.</span>
          </div>
          <button onClick={() => setPressureAlert(false)} title="Reset interlock">
            ✓ Reset
          </button>
        </div>
      )}

      {!pressureAlert && (
        <button className="simulate-alert" onClick={() => setPressureAlert(true)}>
          {t.demoAlert}
        </button>
      )}
    </section>
  );
}
