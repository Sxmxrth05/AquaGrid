import { Bell, Leaf, Wifi } from "lucide-react";

export default function Header({ t, lang, setLang }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-icon"><Leaf size={22} /></div>
        <div>
          <div className="brand-name">AquaGrid</div>
          <div className="brand-sub">FarmHub</div>
        </div>
      </div>
      <div className="top-actions">

        <button className="lang-toggle" onClick={() => setLang(lang === "en" ? "kn" : "en")}>
          <span className={lang === "en" ? "active" : ""}>English</span>
          <span className={lang === "kn" ? "active" : ""}>ಕನ್ನಡ</span>
        </button>

      </div>
    </header>
  );
}