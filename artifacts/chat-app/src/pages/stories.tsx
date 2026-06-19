import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const BLUE = "#007AFF";

const contactStories = [
  { id: 1, name: "Alex Johnson",  avatarUrl: "https://i.pravatar.cc/150?img=3",  time: "2m ago",  viewed: false, bg: "linear-gradient(135deg,#f8cdda,#1d2b64)", text: "Beautiful morning ☀️" },
  { id: 2, name: "Maria Garcia",  avatarUrl: "https://i.pravatar.cc/150?img=47", time: "14m ago", viewed: false, bg: "linear-gradient(135deg,#43e97b,#38f9d7)", text: "Working from the beach today 🌊" },
  { id: 3, name: "Jordan Kim",    avatarUrl: "https://i.pravatar.cc/150?img=35", time: "1h ago",  viewed: true,  bg: "linear-gradient(135deg,#fa709a,#fee140)", text: "Best coffee in the city ☕" },
  { id: 4, name: "Sam Lee",       avatarUrl: "https://i.pravatar.cc/150?img=12", time: "3h ago",  viewed: true,  bg: "linear-gradient(135deg,#a18cd1,#fbc2eb)", text: "New track dropping soon 🎵" },
  { id: 5, name: "Taylor M.",     avatarUrl: "https://i.pravatar.cc/150?img=25", time: "5h ago",  viewed: true,  bg: "linear-gradient(135deg,#0093E9,#80D0C7)", text: "Concert was AMAZING 🎤" },
];

function StoryAvatar({ story, viewed, onOpen }: { story: typeof contactStories[0]; viewed: boolean; onOpen: () => void }) {
  return (
    <div onClick={onOpen} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px", cursor: "pointer" }}>
      <div style={{ flexShrink: 0, position: "relative" }}>
        {!viewed ? (
          <div style={{
            width: 62, height: 62, borderRadius: "50%",
            background: "linear-gradient(135deg,#f9a825,#e91e8c,#9c27b0)",
            padding: 2.5, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ background: "#fff", borderRadius: "50%", padding: 2, display: "flex" }}>
              <img src={story.avatarUrl} style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", objectPosition: "top center" }} alt={story.name} />
            </div>
          </div>
        ) : (
          <div style={{ width: 62, height: 62, borderRadius: "50%", border: "2px solid #c7c7cc", padding: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={story.avatarUrl} style={{ width: 54, height: 54, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", opacity: 0.65 }} alt={story.name} />
          </div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: viewed ? 400 : 600, color: viewed ? "#8e8e93" : "#000" }}>{story.name}</div>
        <div style={{ fontSize: 13, color: "#8e8e93", marginTop: 2 }}>{story.time}</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "calc(env(safe-area-inset-top, 0px) + 6px)", paddingBottom: 10, paddingLeft: 16, paddingRight: 16 }}>
        <h1 style={{ fontSize: 17, fontWeight: 600, color: "#000", margin: 0, letterSpacing: -0.4 }}>Stories</h1>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: BLUE, display: "flex" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* My Story */}
        <div style={{ padding: "0 16px 14px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#8e8e93", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>My Story</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img src="https://i.pravatar.cc/150?img=70" style={{ width: 58, height: 58, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", display: "block", border: "1px solid rgba(0,0,0,0.08)" }} alt="me" />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: "50%", background: BLUE, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#000" }}>Add to My Story</div>
              <div style={{ fontSize: 13, color: "#8e8e93", marginTop: 1 }}>Share photos, videos & more</div>
            </div>
          </div>
        </div>

        <div style={{ height: 0.5, background: "#e5e5ea", margin: "0 16px 14px" }} />

        {unviewed.length > 0 && (
          <>
            <div style={{ padding: "0 16px 6px", fontSize: 12, fontWeight: 600, color: "#8e8e93", letterSpacing: 0.5, textTransform: "uppercase" }}>Recent Updates</div>
            {unviewed.map(story => (
              <StoryAvatar key={story.id} story={story} viewed={false} onOpen={() => openStory(story)} />
            ))}
            {viewed.length > 0 && <div style={{ height: 0.5, background: "#e5e5ea", margin: "6px 16px 14px" }} />}
          </>
        )}

        {viewed.length > 0 && (
          <>
            <div style={{ padding: "0 16px 6px", fontSize: 12, fontWeight: 600, color: "#8e8e93", letterSpacing: 0.5, textTransform: "uppercase" }}>Viewed</div>
            {viewed.map(story => (
              <StoryAvatar key={story.id} story={story} viewed={true} onOpen={() => openStory(story)} />
            ))}
          </>
        )}
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
