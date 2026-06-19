import { useState, useEffect } from "react";

export default function StatusBar({ dark = false }: { dark?: boolean }) {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
      .replace(/\s?(AM|PM)$/, "");
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
        .replace(/\s?(AM|PM)$/, ""));
    };
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  const c = dark ? "#fff" : "#000";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 20px 0",
      flexShrink: 0,
      height: 44,
    }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: c, letterSpacing: -0.3 }}>{time}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Signal */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill={c}>
          <rect x="0" y="7" width="3" height="5" rx="0.8" opacity="1"/>
          <rect x="4.5" y="4.5" width="3" height="7.5" rx="0.8" opacity="1"/>
          <rect x="9" y="2" width="3" height="10" rx="0.8" opacity="1"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.8" opacity="0.35"/>
        </svg>
        {/* Wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 9.5a1.3 1.3 0 1 1 0 2.6A1.3 1.3 0 0 1 8 9.5z" fill={c}/>
          <path d="M3.8 6.8A6 6 0 0 1 8 5.2a6 6 0 0 1 4.2 1.6" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M1 4A9.5 9.5 0 0 1 8 1.5 9.5 9.5 0 0 1 15 4" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
        </svg>
        {/* Battery */}
        <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <div style={{ width: 25, height: 12, borderRadius: 3, border: `1.5px solid ${dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.35)"}`, padding: 2, display: "flex", alignItems: "center" }}>
            <div style={{ width: "77%", height: "100%", background: c, borderRadius: 1.5 }} />
          </div>
          <div style={{ width: 2, height: 5, background: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)", borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}
