import { CheckCircle2, CloudRain, Droplets, Power } from "lucide-react";

export default function SummaryCards({ t, pumpOn, zonesNeedingWater }) {
  const cards = [
    [t.farmStatus, t.farmOk, CheckCircle2, "green"],
    [t.pump, pumpOn ? t.pumpOn : t.pumpOff, Power, pumpOn ? "orange" : "blue"],
    [t.zonesNeedWater, zonesNeedingWater ? `${zonesNeedingWater} ${t.zoneNeedsWater}` : t.noWaterNeeded, Droplets, zonesNeedingWater ? "orange" : "green"],
    [t.rainToday, t.rainTodayValue, CloudRain, "cyan"]
  ];

  return <div className="summary-grid farmer-summary">{cards.map(([label, value, Icon, tone]) => (
    <div className={`summary-card tone-${tone}`} key={label}>
      <div className="summary-icon"><Icon size={22}/></div>
      <div><div className="muted">{label}</div><div className="summary-value">{value}</div></div>
    </div>
  ))}</div>;
}
