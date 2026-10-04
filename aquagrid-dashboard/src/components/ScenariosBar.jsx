import { PlayCircle, ZapOff, SunMedium, AlertOctagon, TrendingDown, RefreshCw } from "lucide-react";

export default function ScenariosBar({
  t,
  lang,
  activeScenario,
  setActiveScenario,
  onReset
}) {
  const scenarios = [
    { id: "normal", label: t.normalScenario, icon: PlayCircle },
    { id: "power_cut", label: t.powerCutScenario, icon: ZapOff },
    { id: "drought", label: t.droughtScenario, icon: SunMedium },
    { id: "leak", label: t.leakScenario, icon: AlertOctagon },
    { id: "glut", label: t.glutScenario, icon: TrendingDown },
  ];

  return (
    <div className="scenarios-bar">
      <div className="scenarios-title">
        <span>{t.scenarios}</span>
      </div>
      <div className="scenarios-list">
        {scenarios.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`scenario-btn ${activeScenario === id ? "active" : ""}`}
            onClick={() => setActiveScenario(id)}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
        {activeScenario !== "normal" && (
          <button className="scenario-reset-btn" onClick={onReset} title="Reset to normal">
            <RefreshCw size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
