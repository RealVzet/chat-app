import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";

const BLUE = "#007AFF";

const memories = [
  { id: 1, day: 27, month: "AUG", year: 2018, hue: "30,50%,18%" },
  { id: 2, day: 8,  month: "JAN", year: 2022, hue: "150,40%,14%" },
  { id: 3, day: 17, month: "JUN", year: 2022, hue: "210,38%,18%" },
  { id: 4, day: 24, month: "DEC", year: 2022, hue: "265,36%,16%" },
  { id: 5, day: 14, month: "FEB", year: 2023, hue: "0,38%,16%" },
  { id: 6, day: 3,  month: "SEP", year: 2023, hue: "200,40%,14%" },
];

const contactStories = [
  { id: 1, name: "Alex Johnson", avatarUrl: "https://i.pravatar.cc/150?img=3",  time: "2m ago",  viewed: false, bg: "linear-gradient(160deg,#1d2b64,#f8cdda)", text: "Beautiful morning ☀️" },
  { id: 2, name: "Maria Garcia", avatarUrl: "https://i.pravatar.cc/150?img=47", time: "14m ago", viewed: false, bg: "linear-gradient(160deg,#134e5e,#71b280)", text: "Working from the beach 🌊" },
  { id: 3, name: "Jordan Kim",   avatarUrl: "https://i.pravatar.cc/150?img=35", time: "1h ago",  viewed: true,  bg: "linear-gradient(160deg,#b06ab3,#4568dc)", text: "Best coffee in the city ☕" },
  { id: 4, name: "Sam Lee",      avatarUrl: "https://i.pravatar.cc/150?img=12", time: "3h ago",  viewed: true,  bg: "linear-gradient(160deg,#a18cd1,#fbc2eb)", text: "New track dropping soon 🎵" },
  { id: 5, name: "Taylor M.",    avatarUrl: "https://i.pravatar.cc/150?img=25", time: "5h ago",  viewed: true,  bg: "linear-gradient(160deg,#0093E9,#80D0C7)", text: "Concert was AMAZING 🎤" },
];

/* ─── Memory Card ──────────────────────────────── */
function MemoryCard({ mem, onOpen }: { mem: typeof memories[0]; onOpen: () => void }) {
  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      onClick={onOpen}
      style={{
        flexShrink: 0,
        width: 104,
        height: 156,
        borderRadius: 18,
        background: `hsl(${mem.hue})`,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <div style={{
        position: "absolute",
        top: 14, left: 14,
        display: "flex",
        flexDirection: "column",
      }}>
        <span style={{
          fontSize: 44,
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1,
          letterSpacing: -2,
        }}>{mem.day}</span>
        <span style={{
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(255,255,255,0.6)",
          letterSpacing: 0.8,
          marginTop: 4,
          textTransform: "uppercase",
        }}>{mem.month}. {mem.year}</span>
      </div>
    </motion.div>
  );
}

/* ─── Story Avatar ─────────────────────────────── */
function StoryAvatar({ story, viewed, size = 56 }: { story: typeof contactStories[0]; viewed: boolean; size?: number }) {
  const ring = size + 6;
  return (
    <div style={{ position: "relative", width: ring, height: ring, flexShrink: 0 }}>
      {!viewed ? (
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "linear-gradient(135deg,#f9a825,#e91e8c,#9c27b0)",
          padding: 2.5, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ background: "#000", borderRadius: "50%", padding: 2, display: "flex" }}>
            <img src={story.avatarUrl} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", objectPosition: "top center" }} alt={story.name} />
          </div>
        </div>
      ) : (
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "1.5px solid #2c2c2e",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <img src={story.avatarUrl} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", opacity: 0.45 }} alt={story.name} />
        </div>
      )}
    </div>
  );
}

/* ─── Section Label ────────────────────────────── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      padding: "18px 20px 10px",
      fontSize: 12,
      fontWeight: 600,
      color: "rgba(255,255,255,0.3)",
      letterSpacing: 1,
      textTransform: "uppercase",
    }}>
      {label}
    </div>
  );
}

/* ─── Story Row ────────────────────────────────── */
function StoryRow({ story, viewed, onOpen }: { story: typeof contactStories[0]; viewed: boolean; onOpen: () => void }) {
  return (
    <motion.div
      whileTap={{ backgroundColor: "rgba(255,255,255,0.04)" }}
      onClick={onOpen}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "9px 20px", cursor: "pointer" }}
    >
      <StoryAvatar story={story} viewed={viewed} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: viewed ? 400 : 600, color: viewed ? "rgba(255,255,255,0.35)" : "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{story.name}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{story.time}</div>
      </div>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </motion.div>
  );
}

/* ─── Thin Divider ─────────────────────────────── */
function Divider() {
  return <div style={{ height: 0.5, background: "rgba(255,255,255,0.07)", margin: "0 20px" }} />;
}

/* ─── Main ─────────────────────────────────────── */
export default function Stories() {
  const [viewing, setViewing] = useState<typeof contactStories[0] | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<number>>(new Set(contactStories.filter(s => s.viewed).map(s => s.id)));
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const openStory = (story: typeof contactStories[0]) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setViewing(story);
    setProgress(0);
    setViewedIds(prev => new Set([...prev, story.id]));
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(id); setViewing(null); return 0; }
        return p + 2;
      });
    }, 80);
    intervalRef.current = id;
  };

  const closeStory = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setViewing(null);
    setProgress(0);
  };

  const unviewed = contactStories.filter(s => !viewedIds.has(s.id));
  const viewed   = contactStories.filter(s =>  viewedIds.has(s.id));

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "#000", overflow: "hidden" }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
        paddingBottom: 14, paddingLeft: 20, paddingRight: 20,
      }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: -0.8 }}>Stories</h1>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(255,255,255,0.45)", display: "flex" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Memories ── */}
        <SectionLabel label="Memories" />
        <div style={{
          display: "flex", gap: 8,
          paddingLeft: 20, paddingRight: 20, paddingBottom: 24,
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        } as React.CSSProperties}>
          {memories.map(mem => (
            <MemoryCard key={mem.id} mem={mem} onOpen={() => {}} />
          ))}
        </div>

        <Divider />

        {/* ── My Story ── */}
        <SectionLabel label="My Story" />
        <motion.div
          whileTap={{ backgroundColor: "rgba(255,255,255,0.04)" }}
          style={{ display: "flex", alignItems: "center", gap: 14, padding: "9px 20px", cursor: "pointer" }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src="https://i.pravatar.cc/150?img=70"
              style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", display: "block", border: "1.5px solid rgba(255,255,255,0.1)" }}
              alt="me"
            />
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              width: 18, height: 18, borderRadius: "50%",
              background: BLUE, border: "2px solid #000",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Add to My Story</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Share photos, videos & more</div>
          </div>
        </motion.div>

        <div style={{ height: 8 }} />
        <Divider />

        {/* ── Recent Updates ── */}
        {unviewed.length > 0 && (
          <>
            <SectionLabel label="Recent Updates" />
            {unviewed.map((story, i) => (
              <div key={story.id}>
                <StoryRow story={story} viewed={false} onOpen={() => openStory(story)} />
                {i < unviewed.length - 1 && <div style={{ height: 0.5, background: "rgba(255,255,255,0.05)", margin: "0 20px 0 90px" }} />}
              </div>
            ))}
          </>
        )}

        {/* ── Viewed ── */}
        {viewed.length > 0 && (
          <>
            <div style={{ height: 8 }} />
            <Divider />
            <SectionLabel label="Viewed" />
            {viewed.map((story, i) => (
              <div key={story.id}>
                <StoryRow story={story} viewed={true} onOpen={() => openStory(story)} />
                {i < viewed.length - 1 && <div style={{ height: 0.5, background: "rgba(255,255,255,0.05)", margin: "0 20px 0 90px" }} />}
              </div>
            ))}
          </>
        )}

        <div style={{ height: 32 }} />
      </div>

      {/* ── Story Viewer ── */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "#000", display: "flex", flexDirection: "column" }}
            onClick={closeStory}
          >
            {/* Progress bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, paddingTop: "calc(env(safe-area-inset-top, 44px) + 10px)", paddingLeft: 14, paddingRight: 14 }}>
              <div style={{ height: 2, background: "rgba(255,255,255,0.2)", borderRadius: 2, overflow: "hidden" }}>
                <motion.div
                  style={{ height: "100%", background: "#fff", borderRadius: 2, width: `${progress}%` }}
                  transition={{ duration: 0 }}
                />
              </div>
            </div>
            {/* Top bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, display: "flex", alignItems: "center", gap: 10, paddingTop: "calc(env(safe-area-inset-top, 44px) + 24px)", paddingLeft: 16, paddingRight: 16 }}>
              <img src={viewing.avatarUrl} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", border: "1.5px solid rgba(255,255,255,0.6)" }} alt={viewing.name} />
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", display: "block" }}>{viewing.name}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{viewing.time}</span>
              </div>
              <button style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: 4 }} onClick={closeStory}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {/* Content */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: viewing.bg }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", textAlign: "center", padding: "0 40px", lineHeight: 1.4 }}>
                {viewing.text}
              </div>
            </div>
            {/* Reply */}
            <div
              style={{ paddingTop: 14, paddingLeft: 16, paddingRight: 16, paddingBottom: "max(44px, env(safe-area-inset-bottom, 44px))", display: "flex", gap: 10, alignItems: "center" }}
              onClick={e => e.stopPropagation()}
            >
              <input
                placeholder={`Reply to ${viewing.name}…`}
                style={{ flex: 1, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 24, padding: "11px 18px", fontSize: 15, color: "#fff", outline: "none" }}
              />
              <button style={{ width: 38, height: 38, borderRadius: "50%", background: BLUE, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
