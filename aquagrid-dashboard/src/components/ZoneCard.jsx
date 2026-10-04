import { ChevronRight, Droplets, Sprout } from "lucide-react";

export default function ZoneCard({ zone, t, onSelect }) {
  const soilClass = zone.soil.toLowerCase();
  const status = zone.status === "IRRIGATING" ? t.irrigating : zone.soil === "DRY" ? t.dry : zone.soil === "WET" ? t.wet : t.ok;
  const needs = zone.waterNeed > 0;
  return (
    <button className={`zone-card farmer-zone ${zone.status === "IRRIGATING" ? "irrigating" : ""}`} onClick={() => onSelect(zone.id)}>
      <div className="zone-head"><div className="zone-number">{t.zone} {zone.id}</div><span className={`status-pill ${soilClass}`}>{status}</span></div>
      <div className="crop-row"><Sprout size={22}/><strong>{zone.crop}</strong></div>
      <div className={`farmer-zone-message ${needs ? "needs" : "okay"}`}>
        <Droplets size={19}/><strong>{needs ? t.needWater : zone.soil === "WET" ? t.noWater : t.noWaterNeeded}</strong>
      </div>
      {needs ? <div className="zone-amount">{zone.waterNeed.toLocaleString()} L {t.recommended}</div> : <div className="zone-amount">{t.noIrrigationNeeded}</div>}
      <div className="zone-bottom"><span className={`priority ${zone.priority.toLowerCase()}`}>{zone.priority === "HIGH" ? t.highPriority : t.normalPriority}</span><ChevronRight size={18}/></div>
    </button>
  );
}
