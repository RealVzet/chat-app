import { Link, useLocation } from "wouter";
import { useListChats, getListChatsQueryKey, useListContacts, getListContactsQueryKey } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/lib/socket";
import { useTheme } from "@/lib/theme";

const BLUE = "#007AFF";

const SETTINGS_SECTIONS = [
  [
    { label: "Account",       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>, color: "#636366" },
    { label: "Linked Devices",icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>, color: "#636366" },
    { label: "Donate",        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, color: "#ff2d55" },
  ],
  [
    { label: "Appearance",    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>, color: "#30b0c7" },
    { label: "Chats",         icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, color: BLUE },
    { label: "Notifications", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, color: "#ff3b30" },
    { label: "Privacy",       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, color: "#34c759" },
    { label: "Storage",       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>, color: "#ff9500" },
  ],
  [
    { label: "Help",          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, color: BLUE },
  ],
];

const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default function ChatList() {
  const queryClient = useQueryClient();
  const { isDark, toggle } = useTheme();
  const { data: chats = [], isLoading } = useListChats({ query: { queryKey: getListChatsQueryKey() } });
  const { data: allContacts = [] } = useListContacts({ query: { queryKey: getListContactsQueryKey() } });
  const [search, setSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [newMsgSearch, setNewMsgSearch] = useState("");
  const [, navigate] = useLocation();
  const alphabetListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: getListChatsQueryKey() });
    };
    socket.on("new_message", onNewMessage);
    return () => { socket.off("new_message", onNewMessage); };
  }, [queryClient]);

  const chatByContactId = useMemo(() => {
    const map: Record<number, any> = {};
    (chats as any[]).forEach((c: any) => { map[c.contactId] = c; });
    return map;
  }, [chats]);

  const sortedContacts = useMemo(() => {
    const contacts = (allContacts as any[]).map((c: any) => ({
      id: chatByContactId[c.id]?.id ?? null,
      contactId: c.id,
      name: c.name ?? "",
      avatarUrl: c.avatarUrl,
      avatarColor: c.avatarColor,
      avatarInitials: c.avatarInitials,
    }));
    const filtered = newMsgSearch
      ? contacts.filter((c: any) => c.name.toLowerCase().includes(newMsgSearch.toLowerCase()))
      : contacts;
    return filtered.sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [allContacts, chatByContactId, newMsgSearch]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof sortedContacts> = {};
    sortedContacts.forEach((c: any) => {
      const letter = (c.name?.[0] || '#').toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(c);
    });
    return map;
  }, [sortedContacts]);

  const letters = Object.keys(grouped).sort();

  const filtered = useMemo(() =>
    (chats as any[]).filter((c: any) =>
      (c.contactName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.lastMessage ?? "").toLowerCase().includes(search.toLowerCase())
    ),
    [chats, search]
  );

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>

      {/* Header — two-row large-title style */}
      <div style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)", paddingLeft: 16, paddingRight: 16, position: "relative" }}>

        {/* Row 1: avatar + icons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <button onClick={() => setAvatarMenuOpen(v => !v)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}>
            <img src="https://i.pravatar.cc/150?img=70" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", display: "block" }} alt="me" />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <button onClick={toggle} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: BLUE, display: "flex" }}>
              {isDark ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <button onClick={() => setNewMsgOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: BLUE, display: "flex" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Row 2: Large title */}
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", margin: "0 0 14px", letterSpacing: -0.8, lineHeight: 1 }}>Chats</h1>

        {/* Avatar popup menu */}
        <AnimatePresence>
          {avatarMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ position: "fixed", inset: 0, zIndex: 80 }}
                onClick={() => setAvatarMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: -4 }}
                transition={{ type: "spring", damping: 22, stiffness: 380 }}
                style={{
                  position: "absolute", top: 52, left: 12, zIndex: 81,
                  background: "var(--glass)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 14,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
                  overflow: "hidden",
                  minWidth: 180,
                  transformOrigin: "top left",
                }}
              >
                {[
                  { label: "Archive",  icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
                  { label: "Select",   icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg> },
                  { label: "Settings", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                ].map((item, i, arr) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setAvatarMenuOpen(false);
                      if (item.label === "Settings") setSettingsOpen(true);
                    }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      width: "100%", padding: "13px 16px",
                      background: "none", border: "none", cursor: "pointer",
                      borderBottom: i < arr.length - 1 ? "0.5px solid var(--sep)" : "none",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 15, color: "var(--text)" }}>{item.label}</span>
                    <span style={{ color: "#8e8e93", display: "flex" }}>{item.icon}</span>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Search */}
      <div style={{ margin: "0 16px 10px", background: "var(--bg-input)", borderRadius: 12, display: "flex", alignItems: "center", gap: 6, padding: "10px 14px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          style={{ border: "none", background: "transparent", fontSize: 15, color: "var(--text)", outline: "none", width: "100%" }}
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#8e8e93", fontSize: 17, lineHeight: 1, padding: 0 }}>×</button>
        )}
      </div>

      {/* Chat List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {isLoading ? (
          <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 26, height: 26, border: `2px solid ${BLUE}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#8e8e93", fontSize: 15 }}>No chats found</div>
        ) : (
          <>
          {/* ── Static group chat entry ── */}
          {!search && (
            <div>
              <Link
                href="/group/1"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", textDecoration: "none" }}
              >
                {/* Group avatar: stacked initials */}
                <div style={{ position: "relative", flexShrink: 0, width: 54, height: 54 }}>
                  {[
                    { color: "#5e5ce6", initials: "A", dx: 0, dy: 0 },
                    { color: "#30b0c7", initials: "C", dx: 18, dy: 0 },
                    { color: "#ff9f0a", initials: "S", dx: 9, dy: 16 },
                  ].map((m, i) => (
                    <div key={i} style={{
                      position: "absolute", left: m.dx, top: m.dy,
                      width: 36, height: 36, borderRadius: "50%",
                      background: m.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: "#fff",
                      border: "2px solid var(--bg)",
                      zIndex: i,
                    }}>
                      {m.initials}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, overflow: "hidden", borderBottom: `0.5px solid var(--sep)`, paddingBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 17, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "65%" }}>
                      gucci fans 🌿
                    </span>
                    <span style={{ fontSize: 14, color: "#8e8e93", whiteSpace: "nowrap", marginLeft: 8 }}>12:45</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 15, color: "#8e8e93", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Alex: Come ooooonn 👻
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          )}
          {filtered.map((chat: any, idx: number) => {
            const isOnline = chat.contactId % 2 === 0;
            const lastMsgPreview = chat.lastMessage
              ? (chat.lastMessageIsMine ? `You: ${chat.lastMessage}` : chat.lastMessage)
              : "";
            const isLast = idx === filtered.length - 1;
            return (
              <div key={chat.id}>
                <Link
                  href={`/chat/${chat.id}`}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", textDecoration: "none" }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    {chat.avatarUrl ? (
                      <img src={chat.avatarUrl} style={{ width: 54, height: 54, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", display: "block" }} alt={chat.contactName} />
                    ) : (
                      <div style={{ width: 54, height: 54, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, background: chat.avatarColor, color: "#fff" }}>
                        {chat.avatarInitials}
                      </div>
                    )}
                    {isOnline && (
                      <div style={{ position: "absolute", bottom: 1, right: 1, width: 13, height: 13, borderRadius: "50%", background: "#34c759", border: "2.5px solid var(--bg)" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden", borderBottom: isLast ? "none" : `0.5px solid var(--sep)`, paddingBottom: isLast ? 0 : 8, paddingTop: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontSize: 17, fontWeight: chat.unreadCount > 0 ? 700 : 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "65%" }}>
                        {chat.contactName}
                      </span>
                      <span style={{ fontSize: 14, color: chat.unreadCount > 0 ? BLUE : "#8e8e93", whiteSpace: "nowrap", marginLeft: 8, fontWeight: 400 }}>{chat.lastMessageTime}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{
                        fontSize: 15, lineHeight: "1.4",
                        color: chat.unreadCount > 0 ? "var(--text)" : "#8e8e93",
                        fontWeight: 400, flex: 1, overflow: "hidden",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      } as React.CSSProperties}>
                        {lastMsgPreview}
                      </div>
                      {chat.unreadCount > 0 && (
                        <div style={{ minWidth: 22, height: 22, borderRadius: 11, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 600, paddingLeft: chat.unreadCount > 9 ? 7 : 0, paddingRight: chat.unreadCount > 9 ? 7 : 0, flexShrink: 0, marginTop: 2 }}>
                          {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
          </>
        )}
      </div>


      {/* ── New Message Sheet ── */}
      <AnimatePresence>
        {newMsgOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              onClick={() => { setNewMsgOpen(false); setNewMsgSearch(""); }}
              style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.4)" }}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 91, background: "var(--bg-2)", borderRadius: "20px 20px 0 0", height: "92%", display: "flex", flexDirection: "column", overflow: "hidden" }}
            >
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 2 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "#636366" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 18px 12px" }}>
                <div style={{ width: 36 }} />
                <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>New Message</span>
                <button onClick={() => { setNewMsgOpen(false); setNewMsgSearch(""); }}
                  style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--bg-input)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div ref={alphabetListRef} style={{ flex: 1, overflowY: "auto", position: "relative", paddingBottom: 80 }}>
                <div style={{ background: "var(--bg-card)", borderRadius: 12, margin: "0 16px 20px", overflow: "hidden" }}>
                  {[
                    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: "New Group" },
                    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 9h.01M15 9h.01M9 15s1 2 3 2 3-2 3-2"/></svg>, label: "Find by Username" },
                  ].map((item, i, arr) => (
                    <div key={item.label}>
                      <button style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                        {item.icon}
                        <span style={{ fontSize: 16, color: "var(--text)" }}>{item.label}</span>
                        <Chevron />
                      </button>
                      {i < arr.length - 1 && <div style={{ height: 0.5, background: "var(--sep)", marginLeft: 50 }} />}
                    </div>
                  ))}
                </div>
                {letters.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#8e8e93", fontSize: 15, padding: 32 }}>No contacts found</div>
                ) : (
                  letters.map(letter => (
                    <div key={letter} id={`letter-${letter}`}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#8e8e93", padding: "4px 28px 2px" }}>{letter}</div>
                      <div style={{ background: "var(--bg-card)", borderRadius: 12, margin: "0 16px 2px", overflow: "hidden" }}>
                        {(grouped[letter] as any[]).map((contact: any, ci: number, arr: any[]) => (
                          <div key={contact.contactId}>
                            <button
                              onClick={() => { if (contact.id != null) { navigate(`/chat/${contact.id}`); setNewMsgOpen(false); setNewMsgSearch(""); } }}
                              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                            >
                              {contact.avatarUrl ? (
                                <img src={contact.avatarUrl} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", flexShrink: 0 }} alt={contact.name} />
                              ) : (
                                <div style={{ width: 42, height: 42, borderRadius: "50%", background: contact.avatarColor || BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                  {contact.avatarInitials || contact.name[0]}
                                </div>
                              )}
                              <span style={{ fontSize: 16, color: "var(--text)" }}>{contact.name}</span>
                            </button>
                            {ci < arr.length - 1 && <div style={{ height: 0.5, background: "var(--sep)", marginLeft: 70 }} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
                {!newMsgSearch && (
                  <div style={{ position: "absolute", right: 4, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 1, zIndex: 10 }}>
                    {"ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("").map(l => (
                      <button key={l} style={{ fontSize: 10, fontWeight: 600, color: letters.includes(l) ? BLUE : "#636366", background: "none", border: "none", cursor: "pointer", padding: "1px 4px", lineHeight: 1 }}
                        onClick={() => { const el = document.getElementById(`letter-${l}`); if (el) el.scrollIntoView({ behavior: "smooth" }); }}>
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 16px 30px", background: "var(--bg-2)", borderTop: "0.5px solid var(--sep)" }}>
                <div style={{ background: "var(--bg-card)", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input autoFocus style={{ flex: 1, border: "none", background: "transparent", fontSize: 16, color: "var(--text)", outline: "none" }}
                    placeholder="Name or username"
                    value={newMsgSearch} onChange={e => setNewMsgSearch(e.target.value)} />
                  {newMsgSearch && (
                    <button onClick={() => setNewMsgSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#8e8e93", fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Settings Sheet ── */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
              onClick={() => setSettingsOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.4)" }}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 81, background: "var(--bg-2)", borderRadius: "20px 20px 0 0", height: "92%", display: "flex", flexDirection: "column", overflow: "hidden" }}
            >
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 2 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "#636366" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 18px 14px" }}>
                <div style={{ width: 36 }} />
                <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>Settings</span>
                <button onClick={() => setSettingsOpen(false)}
                  style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--bg-input)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 40px" }}>
                {/* Profile card */}
                <div style={{ background: "var(--bg-card)", borderRadius: 14, padding: "16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                  <img src="https://i.pravatar.cc/150?img=70" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", objectPosition: "top center", flexShrink: 0 }} alt="me" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>Me</div>
                    <div style={{ fontSize: 13, color: "#8e8e93", marginTop: 2 }}>+1 (555) 000-0001</div>
                    <div style={{ fontSize: 13, color: BLUE, marginTop: 1 }}>me.user</div>
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="1.8">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                      <rect x="14" y="14" width="3" height="3" rx="0.5"/><rect x="18" y="14" width="3" height="3" rx="0.5"/><rect x="14" y="18" width="3" height="3" rx="0.5"/><rect x="18" y="18" width="3" height="3" rx="0.5"/>
                    </svg>
                  </div>
                </div>
                {SETTINGS_SECTIONS.map((section, si) => (
                  <div key={si} style={{ background: "var(--bg-card)", borderRadius: 14, marginBottom: 10, overflow: "hidden" }}>
                    {section.map((item, ii) => (
                      <div key={item.label}>
                        <button style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                          <div style={{ width: 30, height: 30, borderRadius: 7, background: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {item.icon}
                          </div>
                          <span style={{ flex: 1, fontSize: 16, color: "var(--text)" }}>{item.label}</span>
                          <Chevron />
                        </button>
                        {ii < section.length - 1 && <div style={{ height: 0.5, background: "var(--sep)", marginLeft: 58 }} />}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
