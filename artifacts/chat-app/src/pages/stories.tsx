import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const BLUE = "#007AFF";

const MONTH_ABBR = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const memories = [
  {
    id: 1, day: 27, month: "AUG", year: 2018,
    gradient: "linear-gradient(160deg,#2c1a0e 0%,#5c3317 40%,#3a2010 100%)",
    overlay: "rgba(0,0,0,0.18)",
  },
  {
    id: 2, day: 8, month: "JAN", year: 2022,
    gradient: "linear-gradient(160deg,#0d2518 0%,#1a4a2e 45%,#0e2c1a 100%)",
    overlay: "rgba(0,0,0,0.20)",
  },
  {
    id: 3, day: 17, month: "JUN", year: 2022,
    gradient: "linear-gradient(160deg,#1a2a3a 0%,#2e4a6a 45%,#1a2e4a 100%)",
    overlay: "rgba(0,0,0,0.15)",
  },
  {
    id: 4, day: 24, month: "DEC", year: 2022,
    gradient: "linear-gradient(160deg,#1a0e2a 0%,#3a2060 45%,#1a0e3a 100%)",
    overlay: "rgba(0,0,0,0.18)",
  },
  {
    id: 5, day: 14, month: "FEB", year: 2023,
    gradient: "linear-gradient(160deg,#2a0e0e 0%,#5a2020 45%,#3a1010 100%)",
    overlay: "rgba(0,0,0,0.20)",
  },
  {
    id: 6, day: 3, month: "SEP", year: 2023,
    gradient: "linear-gradient(160deg,#0e1a2a 0%,#1a3a5a 45%,#0e2040 100%)",
    overlay: "rgba(0,0,0,0.15)",
  },
];

const contactStories = [
  { id: 1, name: "Alex Johnson",  avatarUrl: "https://i.pravatar.cc/150?img=3",  time: "2m ago",  viewed: false, bg: "linear-gradient(135deg,#f8cdda,#1d2b64)", text: "Beautiful morning ☀️" },
  { id: 2, name: "Maria Garcia",  avatarUrl: "https://i.pravatar.cc/150?img=47", time: "14m ago", viewed: false, bg: "linear-gradient(135deg,#43e97b,#38f9d7)", text: "Working from the beach today 🌊" },
  { id: 3, name: "Jordan Kim",    avatarUrl: "https://i.pravatar.cc/150?img=35", time: "1h ago",  viewed: true,  bg: "linear-gradient(135deg,#fa709a,#fee140)", text: "Best coffee in the city ☕" },
  { id: 4, name: "Sam Lee",       avatarUrl: "https://i.pravatar.cc/150?img=12", time: "3h ago",  viewed: true,  bg: "linear-gradient(135deg,#a18cd1,#fbc2eb)", text: "New track dropping soon 🎵" },
  { id: 5, name: "Taylor M.",     avatarUrl: "https://i.pravatar.cc/150?img=25", time: "5h ago",  viewed: true,  bg: "linear-gradient(135deg,#0093E9,#80D0C7)", text: "Concert was AMAZING 🎤" },
];

function MemoryCard({ mem, onOpen }: { mem: typeof memories[0]; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      style={{
        flexShrink: 0,
        width: 110,
        height: 170,
        borderRadius: 20,
        background: mem.gradient,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        background: mem.overlay,
        borderRadius: 20,
      }} />
      <div style={{
        position: "absolute",
        top: 12, left: 14,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}>
        <span style={{
          fontSize: 46,
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1,
          letterSpacing: -2,
          textShadow: "0 2px 12px rgba(0,0,0,0.5)",
        }}>{mem.day}</span>
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: "rgba(255,255,255,0.9)",
          letterSpacing: 0.5,
          textShadow: "0 1px 6px rgba(0,0,0,0.4)",
          marginTop: 2,
        }}>{mem.month}. {mem.year}</span>
      </div>
      {/* subtle decorative circle */}
      <div style={{
        position: "absolute", bottom: -24, right: -24,
        width: 90, height: 90, borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
      }} />
    </div>
  );
}

function StoryRow({ story, viewed, onOpen }: { story: typeof contactStories[0]; viewed: boolean; onOpen: () => void }) {
  return (
    <div onClick={onOpen} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 20px", cursor: "pointer" }}>
      <div style={{ flexShrink: 0, position: "relative" }}>
        {!viewed ? (
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "linear-gradient(135deg,#f9a825,#e91e8c,#9c27b0)",
            padding: 2.5, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ background: "#1c1c1e", borderRadius: "50%", padding: 2, display: "flex" }}>
              <img src={story.avatarUrl} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", objectPosition: "top center" }} alt={story.name} />
            </div>
          </div>
        ) : (
          <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid #3a3a3c", padding: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={story.avatarUrl} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", opacity: 0.5 }} alt={story.name} />
          </div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: viewed ? 400 : 600, color: viewed ? "#8e8e93" : "#fff" }}>{story.name}</div>
        <div style={{ fontSize: 13, color: "#636366", marginTop: 2 }}>{story.time}</div>
      </div>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3a3a3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  );
}

export default function Stories() {
  const [viewing, setViewing] = useState<typeof contactStories[0] | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<number>>(new Set(contactStories.filter(s => s.viewed).map(s => s.id)));
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

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

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)",
        paddingBottom: 12, paddingLeft: 20, paddingRight: 20,
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: -0.6 }}>Stories</h1>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: BLUE, display: "flex" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* Memories section */}
        <div style={{ paddingBottom: 28 }}>
          <div style={{ paddingLeft: 20, paddingRight: 20, marginBottom: 14 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: -0.3 }}>Random Memories</span>
          </div>
          <div style={{
            display: "flex", gap: 10,
            paddingLeft: 20, paddingRight: 20,
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}>
            {memories.map(mem => (
              <MemoryCard key={mem.id} mem={mem} onOpen={() => {}} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 0.5, background: "#2c2c2e", margin: "0 20px 16px" }} />

        {/* My Story */}
        <div style={{ paddingLeft: 20, paddingRight: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#636366", letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 12 }}>My Story</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img
                src="https://i.pravatar.cc/150?img=70"
                style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", display: "block", border: "1.5px solid #2c2c2e" }}
                alt="me"
              />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: "50%", background: BLUE, border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Add to My Story</div>
              <div style={{ fontSize: 13, color: "#636366", marginTop: 1 }}>Share photos, videos & more</div>
            </div>
          </div>
        </div>

        <div style={{ height: 0.5, background: "#2c2c2e", margin: "0 20px 16px" }} />

        {/* Contact stories */}
        {unviewed.length > 0 && (
          <>
            <div style={{ padding: "0 20px 8px", fontSize: 13, fontWeight: 600, color: "#636366", letterSpacing: 0.4, textTransform: "uppercase" }}>Recent Updates</div>
            {unviewed.map(story => (
              <StoryRow key={story.id} story={story} viewed={false} onOpen={() => openStory(story)} />
            ))}
            {viewed.length > 0 && <div style={{ height: 0.5, background: "#2c2c2e", margin: "8px 20px 16px" }} />}
          </>
        )}

        {viewed.length > 0 && (
          <>
            <div style={{ padding: "0 20px 8px", fontSize: 13, fontWeight: 600, color: "#636366", letterSpacing: 0.4, textTransform: "uppercase" }}>Viewed</div>
            {viewed.map(story => (
              <StoryRow key={story.id} story={story} viewed={true} onOpen={() => openStory(story)} />
            ))}
          </>
        )}

        <div style={{ height: 32 }} />
      </div>

      {/* Story Viewer */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "#000", display: "flex", flexDirection: "column" }}
            onClick={closeStory}
          >
            {/* Progress bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, paddingTop: "calc(env(safe-area-inset-top, 44px) + 10px)", paddingLeft: 12, paddingRight: 12 }}>
              <div style={{ height: 2.5, background: "rgba(255,255,255,0.3)", borderRadius: 2, overflow: "hidden" }}>
                <motion.div
                  style={{ height: "100%", background: "#fff", borderRadius: 2 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0, ease: "linear" }}
                />
              </div>
            </div>
            {/* Top bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, display: "flex", alignItems: "center", gap: 10, paddingTop: "calc(env(safe-area-inset-top, 44px) + 24px)", paddingLeft: 16, paddingRight: 16 }}>
              <img src={viewing.avatarUrl} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", border: "2px solid #fff" }} alt={viewing.name} />
              <div>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", display: "block" }}>{viewing.name}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{viewing.time}</span>
              </div>
              <button style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#fff", padding: 4 }} onClick={closeStory}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {/* Content */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: viewing.bg }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", textAlign: "center", padding: "0 40px", textShadow: "0 2px 16px rgba(0,0,0,0.4)", lineHeight: 1.35 }}>
                {viewing.text}
              </div>
            </div>
            {/* Reply */}
            <div style={{ paddingTop: 16, paddingLeft: 16, paddingRight: 16, paddingBottom: "max(44px, env(safe-area-inset-bottom, 44px))", display: "flex", gap: 10, alignItems: "center" }} onClick={e => e.stopPropagation()}>
              <input
                placeholder={`Reply to ${viewing.name}…`}
                style={{ flex: 1, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 24, padding: "11px 18px", fontSize: 15, color: "#fff", outline: "none" }}
              />
              <button style={{ width: 40, height: 40, borderRadius: "50%", background: BLUE, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
