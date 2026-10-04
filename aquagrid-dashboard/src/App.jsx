import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Droplets, SunMedium } from "lucide-react";
import Header from "./components/Header";
import SummaryCards from "./components/SummaryCards";
import ZoneCard from "./components/ZoneCard";
import IrrigationRecommendation from "./components/IrrigationRecommendation";
import PowerWindowPlanner from "./components/PowerWindowPlanner";
import SavingsLedger from "./components/SavingsLedger";
import BorewellHealthCard from "./components/BorewellHealthCard";
import MandiColdRoomAdvisor from "./components/MandiColdRoomAdvisor";
import VoiceAssistant from "./components/VoiceAssistant";
import ScenariosBar from "./components/ScenariosBar";
import WeatherCard from "./components/WeatherCard";
import EnergyCard from "./components/EnergyCard";
import SystemHealth from "./components/SystemHealth";
import ManualControl from "./components/ManualControl";
import History from "./components/History";
import { initialZones, initialHistory } from "./data/mockData";
import { translations } from "./translations/translations";
import { speakText } from "./utils/speech";

export default function App() {
  const [lang, setLang] = useState("en");
  const [zones, setZones] = useState(initialZones);
  const [history, setHistory] = useState(initialHistory);
  const [pumpOn, setPumpOn] = useState(false);
  const [selectedZone, setSelectedZone] = useState(2);
  const [duration, setDuration] = useState(15);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [pressureAlert, setPressureAlert] = useState(false);
  const [powerCut, setPowerCut] = useState(false);
  const [activeScenario, setActiveScenario] = useState("normal");
  const [waterToday, setWaterToday] = useState(12.4);
  const [energyToday, setEnergyToday] = useState(8.1);
  const t = translations[lang];

  // Dynamic scenario handler for 1-click pitch demonstrations
  const handleScenarioChange = (scenarioId) => {
    setActiveScenario(scenarioId);
    if (scenarioId === "normal") {
      setPowerCut(false);
      setPressureAlert(false);
      setZones(initialZones);
    } else if (scenarioId === "power_cut") {
      setPowerCut(true);
      setPressureAlert(false);
      const msg = lang === "kn" ? "ಬೆಸ್ಕಾಂ ವಿದ್ಯುತ್ ಕಡಿತ ಸಕ್ರಿಯವಾಗಿದೆ. ಕೇವಲ 3 ಗಂಟೆ ವಿದ್ಯುತ್ ಲಭ್ಯವಿದೆ." : "BESCOM power cut active. Available window reduced to 3 hours.";
      speakText(msg, lang);
    } else if (scenarioId === "drought") {
      setPowerCut(false);
      setPressureAlert(false);
      const msg = lang === "kn" ? "ಬರಗಾಲ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ. ನಿಯಂತ್ರಿತ ಕೊರತೆ ನೀರಾವರಿ ಜಾರಿಯಲ್ಲಿದೆ." : "Drought deficit mode active. Prioritizing sensitive flowering stages.";
      speakText(msg, lang);
    } else if (scenarioId === "leak") {
      setPressureAlert(true);
      const msg = lang === "kn" ? "ಎಚ್ಚರಿಕೆ: ನೀರಿನ ಒತ್ತಡ ಕುಸಿದಿದೆ. ಪೈಪ್ ಅಥವಾ ಫಿಲ್ಟರ್ ಪರಿಶೀಲಿಸಿ." : "Alert: Water pressure drop detected. Pump interlock engaged.";
      speakText(msg, lang);
    } else if (scenarioId === "glut") {
      const msg = lang === "kn" ? "ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಟೊಮ್ಯಾಟೊ ಬೆಲೆ ಕುಸಿದಿದೆ. ಶೀತಲೀಕರಣ ಘಟಕ ಬಳಸಿ." : "Tomato market price crash detected. Cold-storage advised.";
      speakText(msg, lang);
    }
  };

  const recommendedZone = useMemo(
    () => zones.filter(z => z.soil === "DRY" || z.status === "IRRIGATING").sort((a, b) => ({ HIGH: 0, MEDIUM: 1, LOW: 2 }[a.priority] - { HIGH: 0, MEDIUM: 1, LOW: 2 }[b.priority]))[0],
    [zones]
  );

  const activeZone = zones.find(z => z.id === selectedZone) || zones[0];
  const zonesNeedingWater = zones.filter(z => z.soil === "DRY").length;

  const updateZone = (id, patch) => setZones(prev => prev.map(z => z.id === id ? { ...z, ...patch } : z));

  const startIrrigation = (id = selectedZone) => {
    const z = zones.find(x => x.id === id);
    if (!z) return;
    setSelectedZone(id);
    setCompleted(false);
    setPumpOn(true);
    updateZone(id, { status: "IRRIGATING", delivered: z.delivered || 0, target: z.target || 2400 });
  };

  const stopIrrigation = () => {
    setPumpOn(false);
    updateZone(selectedZone, { status: undefined });
  };

  const emergencyStop = () => {
    setPumpOn(false);
    setProgress(0);
    setCompleted(false);
    updateZone(selectedZone, { status: undefined });
  };

  useEffect(() => {
    if (!pumpOn) return;
    const timer = setInterval(() => {
      setZones(prev => prev.map(z => {
        if (z.id !== selectedZone || !pumpOn) return z;
        const target = z.target || 2400;
        const next = Math.min(target, (z.delivered || 0) + 120);
        const nextMoisture = Math.min(68, z.moisture + 2);
        return { ...z, delivered: next, moisture: nextMoisture };
      }));
      setProgress(prev => {
        const next = Math.min(100, prev + 5);
        if (next >= 100) {
          setTimeout(() => {
            setPumpOn(false);
            setCompleted(true);
            updateZone(selectedZone, { soil: "OK", moisture: 68, status: undefined });
            setHistory(h => [{ time: "Now", zone: `Zone ${selectedZone}`, water: 2400, energy: 1.4 }, ...h].slice(0, 6));
            setWaterToday(w => w + 2.4);
            setEnergyToday(e => e + 1.4);
          }, 0);
        }
        return next;
      });
      setEnergyToday(e => e + 0.03);
    }, 800);
    return () => clearInterval(timer);
  }, [pumpOn, selectedZone]);

  const selectZone = id => {
    setSelectedZone(id);
    const z = zones.find(x => x.id === id);
    setCompleted(false);
    if (z && z.soil === "DRY") setProgress(0);
  };

  return (
    <div className="app">
      <Header t={t} lang={lang} setLang={setLang} />
      <main className="container">
        {/* Scenarios Quick Bar for Pitch Evaluation */}
        <ScenariosBar
          t={t}
          lang={lang}
          activeScenario={activeScenario}
          setActiveScenario={handleScenarioChange}
          onReset={() => handleScenarioChange("normal")}
        />

        {activeScenario === "drought" && (
          <div className="drought-alert-banner">
            <SunMedium size={18} />
            <span>{t.droughtActive} — {t.droughtSub}</span>
          </div>
        )}

        <div className="page-heading">
          <div>
            <h1>{t.dashboard}</h1>
            <p>{t.farm}</p>
          </div>
          <div className="heading-status">
            <CheckCircle2 size={17} /> {t.allSystems}
          </div>
        </div>

        <SummaryCards t={t} pumpOn={pumpOn} zonesNeedingWater={zonesNeedingWater} />

        <section>
          <div className="section-heading">
            <div>
              <h2>{t.cropZones}</h2>
              <span>{t.fourZones}</span>
            </div>
            <div className="legend">
              <span><i className="dot dry" /> {t.dry}</span>
              <span><i className="dot ok" /> {t.ok}</span>
              <span><i className="dot wet" /> {t.wet}</span>
            </div>
          </div>
          <div className="zones-grid">
            {zones.map(z => (
              <ZoneCard key={z.id} zone={z} t={t} onSelect={selectZone} />
            ))}
          </div>
        </section>

        <div className="main-grid">
          {/* Left Column: Actions, Scheduler, Savings, Manual Controls */}
          <div className="left-column">
            {/* Intelligent Recommendation with Audio Voice */}
            <IrrigationRecommendation
              t={t}
              lang={lang}
              zone={recommendedZone || activeZone}
              pumpOn={pumpOn}
              progress={progress}
              onStart={() => startIrrigation(recommendedZone?.id || selectedZone)}
              onStop={stopIrrigation}
              completed={completed}
            />

            {/* Feature F1: Power-Window Planner (BESCOM 3-Phase Windows) */}
            <PowerWindowPlanner
              t={t}
              lang={lang}
              powerCut={powerCut}
              setPowerCut={setPowerCut}
            />

            {/* Feature F3: Quantified Savings Ledger with Counterfactuals */}
            <SavingsLedger
              t={t}
              lang={lang}
            />

            <ManualControl
              t={t}
              zones={zones}
              selectedZone={selectedZone}
              setSelectedZone={setSelectedZone}
              duration={duration}
              setDuration={setDuration}
              pumpOn={pumpOn}
              onStart={() => startIrrigation(selectedZone)}
              onStop={stopIrrigation}
              onEmergency={emergencyStop}
            />

            <History t={t} history={history} />
          </div>

          {/* Right Column: Audio Assistant, Borewell Health, Mandi Advisor, Weather, Diagnostics */}
          <div className="right-column">
            {/* Feature F2: Audio Speech Voice Assistant (Ask AquaGrid) */}
            <VoiceAssistant
              t={t}
              lang={lang}
              activeZone={recommendedZone || activeZone}
              pumpOn={pumpOn}
              powerCut={powerCut}
              pressureAlert={pressureAlert}
              waterToday={waterToday}
              energyToday={energyToday}
              zones={zones}
            />

            {/* Feature F5: Borewell Health Card & GP Water Budget */}
            <BorewellHealthCard
              t={t}
              lang={lang}
            />

            {/* Feature F7: Post-Harvest Loss Prevention & Cold Room Advisor */}
            <MandiColdRoomAdvisor
              t={t}
              lang={lang}
            />

            <WeatherCard t={t} lang={lang} />
            <EnergyCard t={t} energyToday={energyToday} pumpOn={pumpOn} />
            <SystemHealth
              t={t}
              lang={lang}
              pressureAlert={pressureAlert}
              setPressureAlert={setPressureAlert}
            />
          </div>
        </div>
      </main>

      <footer>
        AquaGrid
      </footer>
    </div>
  );
}