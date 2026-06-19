import { useState } from "react";

const BLUE = "#007AFF";

const recentCalls = [
  { id: 1, name: "Alex Johnson",    avatarUrl: "https://i.pravatar.cc/150?img=3",  type: "incoming", missed: false, date: "Today",     video: false },
  { id: 2, name: "Jordan Kim",      avatarUrl: "https://i.pravatar.cc/150?img=35", type: "outgoing", missed: false, date: "Today",     video: false },
  { id: 3, name: "Maria Garcia",    avatarUrl: "https://i.pravatar.cc/150?img=47", type: "incoming", missed: true,  date: "Yesterday", video: false },
  { id: 4, name: "Sam Lee",         avatarUrl: "https://i.pravatar.cc/150?img=12", type: "outgoing", missed: false, date: "Yesterday", video: false },
  { id: 5, name: "Taylor M.",       avatarUrl: "https://i.pravatar.cc/150?img=25", type: "incoming", missed: true,  date: "Mon",       video: false },
  { id: 6, name: "Alex Johnson",    avatarUrl: "https://i.pravatar.cc/150?img=3",  type: "outgoing", missed: false, date: "Sun",       video: true  },
];

function CallArrow({ type, missed }: { type: string; missed: boolean }) {
  const color = type === "outgoing" ? BLUE : missed ? "#ff3b30" : "#34c759";
  const rotate = type === "outgoing" ? "rotate(-45deg)" : "rotate(135deg)";
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: rotate, display: "inline-block" }}>
      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
    </svg>
  );
}

export default function Calls() {
  const [filter, setFilter] = useState<"all" | "missed">("all");
  const visible = recentCalls.filter(c => filter === "all" || c.missed);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", paddingTop: "calc(env(safe-area-inset-top, 0px) + 6px)", paddingBottom: 10, paddingLeft: 16, paddingRight: 16, gap: 10 }}>
        <div style={{ width: 34 }} />
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", background: "#f0f0f5", borderRadius: 9, padding: 2 }}>
            {(["all", "missed"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "5px 20px", borderRadius: 7, border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: filter === f ? 600 : 400,
                background: filter === f ? "#fff" : "transparent", color: "#000",
                boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                transition: "all 0.15s",
              }}>
                {f === "all" ? "All" : "Missed"}
              </button>
            ))}
          </div>
        </div>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: BLUE, display: "flex" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.14-.95a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
            <line x1="19" y1="8" x2="19" y2="2"/><line x1="16" y1="5" x2="22" y2="5"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Create call link */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderBottom: "0.5px solid #e5e5ea" }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 500, color: BLUE }}>Create a Call Link</span>
        </div>

        {visible.map((call, i) => {
          const isLast = i === visible.length - 1;
          return (
            <div key={call.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px" }}>
              <img src={call.avatarUrl} style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", flexShrink: 0 }} alt={call.name} />
              <div style={{ flex: 1, borderBottom: isLast ? "none" : "0.5px solid #e5e5ea", paddingBottom: isLast ? 0 : 10 }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: call.missed ? "#ff3b30" : "#000", marginBottom: 3 }}>{call.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#8e8e93" }}>
                  <CallArrow type={call.type} missed={call.missed} />
                  <span>{call.missed ? "Missed" : call.type === "incoming" ? "Incoming" : "Outgoing"} · {call.date}</span>
                  {call.video && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#8e8e93" style={{ marginLeft: 2 }}>
                      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                    </svg>
                  )}
                </div>
              </div>
              <button style={{ width: 34, height: 34, borderRadius: "50%", background: "#f0f0f5", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {call.video
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.14-.95a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                }
              </button>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#8e8e93", fontSize: 16 }}>No missed calls</div>
        )}
      </div>

    </div>
  );
}
