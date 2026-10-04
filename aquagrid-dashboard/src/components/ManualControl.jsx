import { Power, ShieldAlert, Square } from "lucide-react";

export default function ManualControl({ t, zones, selectedZone, setSelectedZone, duration, setDuration, pumpOn, onStart, onStop, onEmergency }) {
  return <section className="panel manual">
    <div className="panel-title-row"><div><div className="eyebrow">{t.manualControl}</div><h3>{t.waterAnotherZone}</h3><span className="subtle">{t.manualSimple}</span></div><Power size={20}/></div>
    <div className="control-grid">
      <label>{t.selectZone}<select value={selectedZone} onChange={e => setSelectedZone(Number(e.target.value))}>{zones.map(z => <option value={z.id} key={z.id}>{t.zone} {z.id} • {z.crop}</option>)}</select></label>
      <label>{t.duration}<div className="number-input"><input type="number" min="1" max="120" value={duration} onChange={e => setDuration(e.target.value)}/><span>{t.minutes}</span></div></label>
    </div>
    <div className="action-row">
      {!pumpOn ? <button className="primary-btn" onClick={onStart}><Power size={17}/>{t.pumpOn}</button> : <button className="danger-btn" onClick={onStop}><Square size={16}/>{t.pumpOff}</button>}
      <button className="emergency-btn" onClick={onEmergency}><ShieldAlert size={17}/>{t.emergencyStop}</button>
    </div>
  </section>;
}
