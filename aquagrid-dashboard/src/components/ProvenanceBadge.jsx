import { PROVENANCE_META } from "../utils/liveData";

/**
 * Small inline badge showing data provenance (LIVE / CACHED / DERIVED / SIM)
 * Pass `prov` as one of the PROVENANCE_META keys.
 */
export default function ProvenanceBadge({ prov = "SIMULATED", style = {} }) {
  const meta = PROVENANCE_META[prov] || PROVENANCE_META.SIMULATED;
  return (
    <span
      className="provenance-badge"
      title={meta.title}
      style={{
        background: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.color}44`,
        ...style,
      }}
    >
      {prov === "LIVE" && <span className="prov-dot" style={{ background: meta.color }} />}
      {meta.label}
    </span>
  );
}
