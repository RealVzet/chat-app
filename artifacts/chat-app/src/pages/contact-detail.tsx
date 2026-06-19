import { Link, useParams } from "wouter";
import { useGetContact, getGetContactQueryKey } from "@workspace/api-client-react";

const Chevron = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const actionButtons = [
  {
    label: "Audio",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.14-.95a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
  },
  {
    label: "Video",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
      </svg>
    ),
  },
  {
    label: "Mute",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    ),
  },
  {
    label: "More",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="12" r="1" fill="#000"/><circle cx="12" cy="12" r="1" fill="#000"/><circle cx="19" cy="12" r="1" fill="#000"/>
      </svg>
    ),
  },
];

const settingsRows = [
  {
    label: "Shared Media",
    value: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
      </svg>
    ),
  },
  {
    label: "Disappearing Messages",
    value: "Off",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    label: "Block Screenshots",
    value: "Off",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    ),
  },
  {
    label: "Safety Number",
    value: "On",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
];

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const contactId = Number(id);
  const { data: contact, isLoading } = useGetContact(contactId, {
    query: { enabled: !!contactId, queryKey: getGetContactQueryKey(contactId) },
  });

  if (isLoading) {
    return (
      <div style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 26, height: 26, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      </div>
    );
  }
  if (!contact) return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#8e8e93", fontSize: 17 }}>
      Contact not found
    </div>
  );

  const initials = contact.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>

      {/* Nav bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
        paddingBottom: 10, paddingLeft: 20, paddingRight: 20,
      }}>
        <Link href={`/chat/${contactId}`} style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "#000" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#000", padding: 4, display: "flex" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: "#f0f0f5" }}>

        {/* Avatar + Name header */}
        <div style={{ background: "#fff", paddingTop: 24, paddingBottom: 28, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            width: 96, height: 96, borderRadius: "50%",
            background: contact.avatarColor ?? "#222",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14, overflow: "hidden", flexShrink: 0,
            boxShadow: "0 2px 12px rgba(0,0,0,0.13)",
          }}>
            {(contact as any).avatarUrl ? (
              <img
                src={(contact as any).avatarUrl}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                alt={contact.name}
              />
            ) : (
              <span style={{ fontSize: 36, fontWeight: 700, color: "#fff", letterSpacing: -1 }}>{initials}</span>
            )}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#000", margin: "0 0 4px", letterSpacing: -0.4 }}>{contact.name}</h2>
          <p style={{ fontSize: 14, color: "#8e8e93", margin: 0 }}>Signal user</p>
        </div>

        {/* Action buttons */}
        <div style={{ background: "#fff", marginTop: 1, padding: "18px 16px 22px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            {actionButtons.map((btn) => (
              <div key={btn.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                <button style={{
                  width: 58, height: 58, borderRadius: "50%",
                  background: "#f0f0f5",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {btn.icon}
                </button>
                <span style={{ fontSize: 12, color: "#000", fontWeight: 500 }}>{btn.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings card */}
        <div style={{ margin: "18px 16px 0", background: "#fff", borderRadius: 16, overflow: "hidden" }}>
          {settingsRows.map((row, i) => (
            <button
              key={row.label}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", background: "none", border: "none",
                borderBottom: i < settingsRows.length - 1 ? "0.5px solid #e5e5ea" : "none",
                cursor: "pointer", textAlign: "left",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", color: "#555", flexShrink: 0 }}>{row.icon}</span>
              <span style={{ flex: 1, fontSize: 16, color: "#000" }}>{row.label}</span>
              {row.value && (
                <span style={{ fontSize: 15, color: "#8e8e93", marginRight: 4 }}>{row.value}</span>
              )}
              <Chevron />
            </button>
          ))}
        </div>

        {/* Shared media preview */}
        <div style={{ margin: "18px 16px 0", background: "#fff", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "0.5px solid #e5e5ea" }}>
            <span style={{ fontSize: 16, color: "#000", fontWeight: 500 }}>Media, Links, and Docs</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 15, color: "#8e8e93" }}>4</span>
              <Chevron />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, padding: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ aspectRatio: "1", background: "#e5e5ea", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Block / Report */}
        <div style={{ margin: "18px 16px 40px", background: "#fff", borderRadius: 16, overflow: "hidden" }}>
          <button style={{ width: "100%", padding: "14px 16px", background: "none", border: "none", borderBottom: "0.5px solid #e5e5ea", cursor: "pointer", fontSize: 16, color: "#ff3b30", textAlign: "center" }}>
            Block {contact.name}
          </button>
          <button style={{ width: "100%", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#ff3b30", textAlign: "center" }}>
            Report {contact.name}
          </button>
        </div>

      </div>
    </div>
  );
}
