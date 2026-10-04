import { Droplets, History as HistoryIcon } from "lucide-react";

export default function History({ t, history }) {
  return <section className="panel">
    <div className="panel-title-row"><div><div className="eyebrow">{t.historyTitle}</div><h3>{t.recentWatering}</h3></div><HistoryIcon size={20}/></div>
    <div className="event-list farmer-events">{history.slice(0,4).map((e,i) => <div className="event" key={i}>
      <div className="event-icon"><Droplets size={15}/></div>
      <div><b>{e.zone}</b><span>{e.time}</span></div>
      <strong>{e.water.toLocaleString()} L</strong>
    </div>)}</div>
  </section>;
}
