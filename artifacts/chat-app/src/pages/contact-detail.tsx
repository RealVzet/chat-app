import { Link, useParams } from "wouter";
import { useGetContact, getGetContactQueryKey } from "@workspace/api-client-react";

const BLUE = "#007AFF";

const settings = [
  { label: "Mute",                  color: "#ff9500", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="1" y1="1" x2="23" y2="23"/></svg> },
  { label: "Search in Chat",        color: BLUE,      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { label: "Disappearing Messages", color: "#af52de", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { label: "Chat Wallpaper",        color: "#30b0c7", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#fff" stroke="none"/><polyline points="21 15 16 10 5 21"/></svg> },
  { label: "Safety Number",         color: "#34c759", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
];

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const contactId = Number(id);
  const { data: contact, isLoading } = useGetContact(contactId, {
    query: { enabled: !!contactId, queryKey: getGetContactQueryKey(contactId) },
  });

  if (isLoading) {
    return (
      <div style={{ position: "absolute", inset: 0, background: "#f2f2f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 26, height: 26, border: `2px solid ${BLUE}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      </div>
    );
  }
  if (!contact) return (
    <div style={{ position: "absolute", inset: 0, background: "#f2f2f7", display: "flex", alignItems: "center", justifyContent: "center", color: "#8e8e93", fontSize: 17 }}>
      Contact not found
    </div>
  );

  const initials = contact.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "#f2f2f7", overflow: "hidden" }}>

      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "calc(env(safe-area-inset-top, 0px) + 6px)", paddingBottom: 8, paddingLeft: 16, paddingRight: 16 }}>
        <Link href={`/chat/${contactId}`} style={{ display: "flex", alignItems: "center", textDecoration: "none", color: BLUE, gap: 4 }}>
          <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
            <path d="M9 1L1 8.5L9 16" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 17, fontWeight: 400 }}>Back</span>
        </Link>
        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 17, color: BLUE, fontWeight: 400 }}>Edit</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Avatar + Name */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20, paddingBottom: 24 }}>
          <div style={{ width: 86, height: 86, borderRadius: "50%", background: contact.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, overflow: "hidden", flexShrink: 0 }}>
            {(contact as any).avatarUrl ? (
              <img src={(contact as any).avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} alt={contact.name} />
            ) : (
              <span style={{ fontSize: 32, fontWeight: 600, color: "#fff", letterSpacing: -1 }}>{initials}</span>
            )}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#000", margin: "0 0 4px", letterSpacing: -0.5 }}>{contact.name}</h2>
          <p style={{ fontSize: 14, color: "#8e8e93", margin: 0, filter: "blur(4px)", userSelect: "none" }}>+1 555 000 0000</p>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 28, padding: "0 24px" }}>
          {[
            { label: "Audio", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.14-.95a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
            { label: "Video", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
            { label: "Mute",  icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="1" y1="1" x2="23" y2="23"/></svg> },
            { label: "Search",icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
          ].map(a => (
            <div key={a.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <button style={{ width: "100%", aspectRatio: "1", background: "#fff", borderRadius: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                {a.icon}
              </button>
              <span style={{ fontSize: 12, color: BLUE, fontWeight: 500 }}>{a.label}</span>
            </div>
          ))}
        </div>

        {/* Phone number card */}
        <div style={{ margin: "0 16px 12px", background: "#fff", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "0.5px solid #e5e5ea" }}>
            <div style={{ fontSize: 13, color: "#8e8e93", marginBottom: 2 }}>Phone</div>
            <div style={{ fontSize: 16, color: BLUE }}>+1 (555) 000-0001</div>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontSize: 16, color: BLUE }}>Send Message</span>
          </button>
        </div>

        {/* Settings list */}
        <div style={{ margin: "0 16px 12px", background: "#fff", borderRadius: 12, overflow: "hidden" }}>
          {settings.map((item, i) => (
            <button key={item.label} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", background: "none", border: "none", borderBottom: i !== settings.length - 1 ? "0.5px solid #e5e5ea" : "none", cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {item.icon}
              </div>
              <span style={{ flex: 1, fontSize: 16, color: "#000" }}>{item.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          ))}
        </div>

        {/* Media grid */}
        <div style={{ padding: "0 16px 48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#8e8e93", textTransform: "uppercase", letterSpacing: "0.04em" }}>Media</span>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: BLUE, fontWeight: 400 }}>See All</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, borderRadius: 12, overflow: "hidden" }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ aspectRatio: "1", background: "#e5e5ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Block / Report */}
        <div style={{ margin: "0 16px 32px", background: "#fff", borderRadius: 12, overflow: "hidden" }}>
          <button style={{ width: "100%", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#ff3b30", textAlign: "center", borderBottom: "0.5px solid #e5e5ea" }}>
            Block {contact.name}
          </button>
          <button style={{ width: "100%", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#ff3b30", textAlign: "center" }}>
            Report {contact.name}
          </button>
        </div>
      </div>
    </div>
  );
}
