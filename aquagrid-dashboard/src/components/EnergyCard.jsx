import { CheckCircle2, Sun, Zap } from "lucide-react";

export default function EnergyCard({ t, pumpOn }) {
  return <section className="panel farmer-panel">
    <div className="panel-title-row"><div><div className="eyebrow">{t.power}</div><h3>{t.canIrrigateNow}</h3></div><Zap size={21}/></div>
    <div className="big-status good"><CheckCircle2 size={22}/><div><strong>{t.yesIrrigate}</strong><span>{t.solarEnough}</span></div></div>
    <div className="simple-info-row"><div className="sun-icon"><Sun size={21}/></div><div><span>{t.powerSource}</span><strong>{t.sourceSolar}</strong></div><b>{pumpOn ? t.pumpRunning : t.ready}</b></div>
  </section>;
}
