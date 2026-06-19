import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const BUBBLE_BG = "var(--bubble-in)";
const BUBBLE_MINE = "var(--bubble-out)";
const TEXT_MINE = "var(--bubble-out-text)";
const TEXT_THEIRS = "var(--bubble-in-text)";
const INPUT_BG = "var(--bg-input)";
const SEPARATOR = "var(--sep)";

/* ── Mock data ─────────────────────────────────── */
const GROUP = {
  name: "gucci fans 🌿",
  online: 3,
  members: [
    { id: 1, name: "Alex", color: "#5e5ce6", initials: "A" },
    { id: 2, name: "Casey", color: "#30b0c7", initials: "C" },
    { id: 3, name: "Sam", color: "#ff9f0a", initials: "S" },
  ],
};

const PHOTOS = [
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80",
];
const PHOTOS2 = [
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&q=80",
];

type Reaction = { emoji: string; count: number };
type Msg = {
  id: number;
  senderId: number | null;
  content?: string;
  photos?: string[];
  photoExtra?: number;
  time: string;
  reactions?: Reaction[];
};

const INIT_MSGS: Msg[] = [
  {
    id: 1,
    senderId: 1,
    photos: PHOTOS,
    photoExtra: 2,
    time: "13:18",
  },
  {
    id: 2,
    senderId: null,
    content: "Hi peeps",
    time: "12:45",
  },
  {
    id: 3,
    senderId: null,
    content: "pls help me choose photos for insta post ⚡️😍",
    time: "12:45",
  },
  {
    id: 4,
    senderId: 1,
    content: "Come ooooonn 👻",
    time: "12:45",
    reactions: [
      { emoji: "❤️", count: 1 },
      { emoji: "🔥", count: 4 },
      { emoji: "👻", count: 2 },
    ],
  },
  {
    id: 5,
    senderId: 1,
    photos: PHOTOS2,
    photoExtra: 10,
    time: "13:18",
  },
];

/* ── Photo Fan ──────────────────────────────────── */
function PhotoFan({ photos, extra, isMine }: { photos: string[]; extra: number; isMine: boolean }) {
  const rotations = [-8, 0, 7];
  const offsets = [
    { x: -24, y: 8 },
    { x: 0, y: 0 },
    { x: 22, y: 6 },
  ];
  const shown = photos.slice(0, 3);
  const W = 150;
  const H = 200;
  const containerW = W + 60;
  const containerH = H + 30;

  return (
    <div style={{ position: "relative", width: containerW, height: containerH }}>
      {shown.map((src, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: W,
            height: H,
            marginLeft: -W / 2 + offsets[i].x,
            marginTop: -H / 2 + offsets[i].y,
            borderRadius: 18,
            overflow: "hidden",
            transform: `rotate(${rotations[i]}deg)`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            zIndex: i + 1,
          }}
        >
          <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {i === 1 && extra > 0 && (
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.38)",
            }}>
              <div style={{
                background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
                borderRadius: 20, padding: "5px 14px",
                color: "#fff", fontSize: 14, fontWeight: 600,
              }}>
                +{extra} photo
              </div>
            </div>
          )}
        </div>
      ))}
      {/* timestamp bottom right */}
      <div style={{
        position: "absolute", bottom: 0, right: 4,
        fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500,
        display: "flex", alignItems: "center", gap: 4,
        textShadow: "0 1px 4px rgba(0,0,0,0.8)",
        zIndex: 10,
      }}>
        13:18
        {isMine && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M2 12l5 5L17 5" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 12l5 5L23 5" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  );
}

/* ── Sender Avatar ─────────────────────────────── */
function Avatar({ member, size = 30 }: { member: (typeof GROUP.members)[0]; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: member.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.42, fontWeight: 700, color: "#fff",
      flexShrink: 0,
    }}>
      {member.initials}
    </div>
  );
}

/* ── Stacked Avatars for header ─────────────────── */
function AvatarStack() {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {GROUP.members.map((m, i) => (
        <div
          key={m.id}
          style={{
            width: 20, height: 20, borderRadius: "50%",
            background: m.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 8, fontWeight: 700, color: "#fff",
            marginLeft: i === 0 ? 0 : -6,
            border: "1.5px solid var(--bg)",
            zIndex: i,
          }}
        >
          {m.initials}
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ─────────────────────────────── */
export default function GroupDetail() {
  const [msgs, setMsgs] = useState<Msg[]>(INIT_MSGS);
  const [content, setContent] = useState("");
  const [ctx, setCtx] = useState<{ msgId: number; x: number; y: number } | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const handleSend = () => {
    const text = content.trim();
    if (!text) return;
    setMsgs(prev => [...prev, {
      id: Date.now(),
      senderId: null,
      content: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
    setContent("");
  };

  const getMember = (id: number) => GROUP.members.find(m => m.id === id);

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", flexDirection: "column",
      background: "var(--bg)", overflow: "hidden",
    }}>
      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 6px)",
        paddingBottom: 10,
        paddingLeft: 10, paddingRight: 14,
        gap: 8,
        background: "var(--bg)",
        borderBottom: `0.5px solid ${SEPARATOR}`,
        flexShrink: 0,
      }}>
        {/* Back */}
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "var(--text)", padding: "4px 4px 4px 0", flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>

        {/* Center: name + online — tappable for group info */}
        <button
          onClick={() => setInfoOpen(true)}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: "2px 0" }}
        >
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>{GROUP.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
            <AvatarStack />
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>{GROUP.online} online</span>
          </div>
        </button>

        {/* Video call */}
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: "var(--text)" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="13" height="10" rx="2" />
            <polyline points="22 7 17 12 22 17" />
          </svg>
        </button>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "10px 12px 10px",
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        {msgs.map((msg, idx) => {
          const isMine = msg.senderId === null;
          const member = msg.senderId ? getMember(msg.senderId) : null;
          const prevMsg = msgs[idx - 1];
          const prevSameSender = prevMsg?.senderId === msg.senderId;
          const nextMsg = msgs[idx + 1];
          const nextSameSender = nextMsg?.senderId === msg.senderId;
          const isLastInGroup = !nextSameSender;

          return (
            <div key={msg.id} style={{ marginTop: prevSameSender ? 1 : 10 }}>
              {/* Sender name (first in group, theirs) */}
              {!isMine && !prevSameSender && member && (
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: member.color,
                  marginLeft: 44, marginBottom: 3,
                }}>
                  {member.name}
                </div>
              )}

              <div style={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 8,
              }}>
                {/* Sender avatar placeholder (preserves space even when no avatar) */}
                {!isMine && (
                  <div style={{ width: 30, flexShrink: 0, alignSelf: "flex-end" }}>
                    {isLastInGroup && member ? <Avatar member={member} /> : null}
                  </div>
                )}

                {/* Bubble / photo fan */}
                <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                  {msg.photos ? (
                    <div
                      onContextMenu={e => { e.preventDefault(); setCtx({ msgId: msg.id, x: e.clientX, y: e.clientY }); }}
                      style={{ cursor: "default" }}
                    >
                      <PhotoFan photos={msg.photos} extra={msg.photoExtra ?? 0} isMine={isMine} />
                    </div>
                  ) : (
                    <div
                      onContextMenu={e => { e.preventDefault(); setCtx({ msgId: msg.id, x: e.clientX, y: e.clientY }); }}
                      style={{
                        background: isMine ? BUBBLE_MINE : BUBBLE_BG,
                        color: isMine ? TEXT_MINE : TEXT_THEIRS,
                        borderRadius: 20,
                        borderBottomRightRadius: isMine ? (nextSameSender ? 20 : 5) : 20,
                        borderBottomLeftRadius: !isMine ? (nextSameSender ? 20 : 5) : 20,
                        padding: "10px 14px",
                        fontSize: 15, lineHeight: 1.4,
                        wordBreak: "break-word",
                        position: "relative",
                        cursor: "default",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                      }}
                    >
                      {msg.content}
                      {/* invisible spacer */}
                      <span style={{ display: "inline-block", width: isMine ? 72 : 48, height: 1 }} />
                      {/* timestamp */}
                      <span style={{
                        position: "absolute", bottom: 7, right: 12,
                        fontSize: 11, lineHeight: 1,
                        color: "var(--text-2)",
                        display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap",
                      }}>
                        {msg.time}
                        {isMine && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M2 12l5 5L17 5" stroke="rgba(0,0,0,0.45)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 12l5 5L23 5" stroke="rgba(0,0,0,0.45)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Reaction pills */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div style={{
                      display: "flex", gap: 5, marginTop: 5,
                      flexWrap: "wrap",
                      justifyContent: isMine ? "flex-end" : "flex-start",
                    }}>
                      {msg.reactions.map(r => (
                        <button
                          key={r.emoji}
                          onClick={() => {
                            setMsgs(prev => prev.map(m =>
                              m.id !== msg.id ? m : {
                                ...m,
                                reactions: m.reactions?.map(rx =>
                                  rx.emoji === r.emoji ? { ...rx, count: rx.count + 1 } : rx
                                ),
                              }
                            ));
                          }}
                          style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 40,
                            padding: "4px 10px",
                            display: "flex", alignItems: "center", gap: 4,
                            cursor: "pointer",
                            fontSize: 15,
                          }}
                        >
                          <span>{r.emoji}</span>
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{r.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* ── Context menu backdrop ── */}
      <AnimatePresence>
        {ctx && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => setCtx(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Input Area ── */}
      <div style={{
        flexShrink: 0,
        background: "var(--bg)",
        borderTop: `0.5px solid ${SEPARATOR}`,
        padding: "10px 10px",
        paddingBottom: "max(20px, env(safe-area-inset-bottom, 20px))",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* + button */}
          <button style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--bg-input)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, color: "var(--text)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* Input pill */}
          <div style={{
            flex: 1,
            background: INPUT_BG,
            borderRadius: 24,
            display: "flex", alignItems: "center",
            padding: "0 14px",
            height: 40,
            border: "1px solid var(--sep)",
          }}>
            <input
              ref={inputRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Send a message"
              style={{
                flex: 1, border: "none", background: "transparent",
                fontSize: 15, color: "var(--text)", outline: "none",
              }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: content.trim() ? "#007AFF" : "var(--bg-input)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.2s",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Group Info Sheet ── */}
      <AnimatePresence>
        {infoOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
              onClick={() => setInfoOpen(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              style={{
                position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 61,
                background: "#111",
                borderRadius: "24px 24px 0 0",
                paddingBottom: "max(32px, env(safe-area-inset-bottom, 32px))",
                overflow: "hidden",
              }}
            >
              {/* Handle */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 6 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
              </div>

              {/* Group avatar + name */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 20px 24px" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#5e5ce6,#30b0c7)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 32 }}>🌿</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: -0.4 }}>{GROUP.name}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{GROUP.members.length} members · {GROUP.online} online</div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", justifyContent: "center", gap: 20, padding: "0 20px 28px" }}>
                {[
                  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.87a16 16 0 0 0 6 6l.91-1.09a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>, label: "Call" },
                  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="13" height="10" rx="2"/><polyline points="22 7 17 12 22 17"/></svg>, label: "Video" },
                  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, label: "Mute" },
                  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, label: "Search" },
                ].map(btn => (
                  <div key={btn.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <button style={{
                      width: 54, height: 54, borderRadius: "50%",
                      background: "#2c2c2e",
                      border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#007AFF",
                    }}>{btn.icon}</button>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{btn.label}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: 0.5, background: "rgba(255,255,255,0.08)", margin: "0 20px 4px" }} />

              {/* Members list */}
              <div style={{ padding: "8px 0" }}>
                <div style={{ padding: "6px 20px 10px", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 0.8, textTransform: "uppercase" }}>Members</div>
                {GROUP.members.map((m, i) => (
                  <div key={m.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 20px" }}>
                      <div style={{ width: 46, height: 46, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {m.initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 500, color: "#fff" }}>{m.name}</div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
                          {i === 0 ? "Online now" : i === 1 ? "Online now" : "Last seen 2h ago"}
                        </div>
                      </div>
                      {i === 0 && (
                        <span style={{ fontSize: 11, color: "#5e5ce6", fontWeight: 600, background: "rgba(94,92,230,0.15)", padding: "3px 8px", borderRadius: 8 }}>Admin</span>
                      )}
                    </div>
                    {i < GROUP.members.length - 1 && (
                      <div style={{ height: 0.5, background: "rgba(255,255,255,0.06)", margin: "0 20px 0 80px" }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Leave group */}
              <div style={{ margin: "16px 20px 0" }}>
                <button style={{ width: "100%", padding: "14px", background: "#2c2c2e", border: "none", borderRadius: 14, cursor: "pointer", color: "#ff453a", fontSize: 16, fontWeight: 500 }}>
                  Leave Group
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
