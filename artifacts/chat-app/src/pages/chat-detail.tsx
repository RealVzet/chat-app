import { Link, useParams } from "wouter";
import { useGetChat, getGetChatQueryKey } from "@workspace/api-client-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { socket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiPost(path: string, body: object) {
  const r = await fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}
async function apiPatch(path: string, body: object) {
  const r = await fetch(API + path, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}
async function apiDelete(path: string) {
  const r = await fetch(API + path, { method: "DELETE" });
  return r.json();
}

type Msg = {
  id: number;
  content: string;
  isMine: boolean;
  sentAt: string;
  createdAtIso: string;
  isRead: boolean;
  replyToId: number | null;
  replyTo?: { id: number; content: string; isMine: boolean };
  editedAt: string | null;
  isDeleted: boolean;
};

function getDateLabel(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((today.getTime() - msgDay.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return d.toLocaleDateString("en-US", { weekday: "long" });
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function SwipeableRow({ msg, onSwipe, onDragCancel, children }: {
  msg: Msg; onSwipe: () => void; onDragCancel: () => void; children: React.ReactNode;
}) {
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -76, right: 0 }}
      dragElastic={{ left: 0.35, right: 0 }}
      dragMomentum={false}
      onDragStart={() => { setDragging(true); onDragCancel(); }}
      onDrag={(_, info) => setDragX(info.offset.x)}
      onDragEnd={(_, info) => {
        setDragging(false); setDragX(0);
        if (info.offset.x < -52) onSwipe();
      }}
      style={{ display: "flex", flexDirection: "column", alignItems: msg.isMine ? "flex-end" : "flex-start", position: "relative" }}
    >
      {/* Reply arrow that appears during drag */}
      <div style={{
        position: "absolute", left: msg.isMine ? undefined : -28, right: msg.isMine ? -28 : undefined,
        top: "50%", transform: "translateY(-50%)",
        opacity: dragging ? Math.min(1, Math.abs(dragX) / 52) : 0,
        transition: dragging ? "none" : "opacity 0.2s",
        pointerEvents: "none",
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
        </svg>
      </div>
      {children}
    </motion.div>
  );
}

type ContextMenu = { msgId: number; x: number; y: number; isMine: boolean; content: string };
type ReplyTo = { id: number; content: string; isMine: boolean };

export default function ChatDetail() {
  const { id } = useParams<{ id: string }>();
  const chatId = Number(id);
  const { data: chat, isLoading } = useGetChat(chatId, {
    query: { enabled: !!chatId, queryKey: getGetChatQueryKey(chatId) },
  });
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [ctx, setCtx] = useState<ContextMenu | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [reactions, setReactions] = useState<Record<number, string>>({});
  const [pinnedMsgId, setPinnedMsgId] = useState<number | null>(null);
  const [revealedTimeId, setRevealedTimeId] = useState<number | null>(null);
  const [receipt, setReceipt] = useState<"delivered" | "read" | null>(null);
  const lastTapRef = useRef<{ msgId: number; time: number } | null>(null);
  const longPressFired = useRef(false);

  // Socket.io
  useEffect(() => {
    socket.emit("join_chat", chatId);
    const onNew = () => {
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: getGetChatQueryKey(chatId) });
    };
    const onEdited = () => queryClient.invalidateQueries({ queryKey: getGetChatQueryKey(chatId) });
    const onDeleted = () => queryClient.invalidateQueries({ queryKey: getGetChatQueryKey(chatId) });
    socket.on("new_message", onNew);
    socket.on("message_edited", onEdited);
    socket.on("message_deleted", onDeleted);
    return () => {
      socket.emit("leave_chat", chatId);
      socket.off("new_message", onNew);
      socket.off("message_edited", onEdited);
      socket.off("message_deleted", onDeleted);
    };
  }, [chatId, queryClient]);

  // Mark incoming messages as read when entering chat
  useEffect(() => {
    fetch(API + `/api/chats/${chatId}/read`, { method: "PATCH" }).catch(() => {});
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  // Long press / tap / double-tap detection
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPress = useCallback((msg: Msg, e: React.TouchEvent | React.MouseEvent) => {
    if (msg.isDeleted) return;
    longPressFired.current = false;
    const target = (e.target as HTMLElement).closest("[data-bubble]") as HTMLElement;
    pressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      const rect = target?.getBoundingClientRect() ?? { left: 100, top: 200 };
      setCtx({ msgId: msg.id, x: rect.left, y: rect.top, isMine: msg.isMine, content: msg.content });
    }, 400);
  }, []);
  const cancelPress = useCallback(() => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }, []);
  const endPress = useCallback((msg: Msg) => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (longPressFired.current) return; // long press handled
    // Double-tap detection (300ms window)
    const now = Date.now();
    const last = lastTapRef.current;
    if (last && last.msgId === msg.id && now - last.time < 300) {
      lastTapRef.current = null;
      setReactions(prev => {
        if (prev[msg.id] === "❤️") { const n = { ...prev }; delete n[msg.id]; return n; }
        return { ...prev, [msg.id]: "❤️" };
      });
    } else {
      lastTapRef.current = { msgId: msg.id, time: now };
      setRevealedTimeId(prev => prev === msg.id ? null : msg.id);
    }
  }, []);

  const handleSend = async () => {
    const text = content.trim();
    if (!text) return;
    setContent("");

    if (editingId !== null) {
      setEditingId(null);
      await apiPatch(`/api/chats/${chatId}/messages/${editingId}`, { content: text });
    } else {
      const body: any = { content: text };
      if (replyTo) body.replyToId = replyTo.id;
      setReplyTo(null);
      setIsTyping(true);
      setReceipt("delivered");
      await apiPost(`/api/chats/${chatId}/messages`, body);
      setTimeout(() => setReceipt("read"), 2000);
    }
    queryClient.invalidateQueries({ queryKey: getGetChatQueryKey(chatId) });
  };

  const handleReply = () => {
    if (!ctx) return;
    const msg = chat?.messages.find((m: Msg) => m.id === ctx.msgId);
    if (msg) { setReplyTo({ id: msg.id, content: msg.content, isMine: msg.isMine }); }
    setCtx(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleEdit = () => {
    if (!ctx) return;
    setEditingId(ctx.msgId);
    setContent(ctx.content);
    setCtx(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCopy = () => {
    if (ctx) navigator.clipboard.writeText(ctx.content).catch(() => {});
    setCtx(null);
  };

  const handleDelete = async () => {
    if (!ctx) return;
    const id = ctx.msgId;
    setCtx(null);
    await apiDelete(`/api/chats/${chatId}/messages/${id}`);
    queryClient.invalidateQueries({ queryKey: getGetChatQueryKey(chatId) });
  };

  if (isLoading) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ width: 28, height: 28, border: "2px solid var(--text)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      </div>
    );
  }

  if (!chat) return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--text-2)", fontSize: 17 }}>
      Chat not found
    </div>
  );

  const messages: Msg[] = chat.messages ?? [];

  return (
    <div
      style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}
      onClick={() => ctx && setCtx(null)}
    >
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", paddingTop: "calc(env(safe-area-inset-top, 0px) + 4px)", paddingBottom: 10, paddingLeft: 10, paddingRight: 10, gap: 8, background: "var(--bg)", borderBottom: "0.5px solid var(--sep)", flexShrink: 0 }}>
        <Link href="/" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", flexShrink: 0, textDecoration: "none", color: "var(--text)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <Link href={`/contact/${chat.contactId}`} style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, overflow: "hidden", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", background: chat.avatarColor }}>
          {chat.avatarUrl ? (
            <img src={chat.avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} alt={chat.contactName} />
          ) : (
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{chat.avatarInitials}</span>
          )}
        </Link>
        <Link href={`/contact/${chat.contactId}`} style={{ flex: 1, textDecoration: "none" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>{chat.contactName} <span style={{ color: "var(--text-2)", fontWeight: 400, fontSize: 14 }}>›</span></div>
          {chat.contactId % 2 === 0
            ? <div style={{ fontSize: 12, color: "#34c759", fontWeight: 500, marginTop: 1 }}>online</div>
            : <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 1 }}>last seen today</div>
          }
        </Link>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 5, color: "var(--text)", display: "flex", alignItems: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 5, color: "var(--text)", display: "flex", alignItems: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.14-.95a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Pinned message banner ── */}
      <AnimatePresence>
        {pinnedMsgId && (() => {
          const pinned = messages.find((m: Msg) => m.id === pinnedMsgId);
          if (!pinned) return null;
          return (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ flexShrink: 0, borderBottom: "0.5px solid var(--sep)", overflow: "hidden" }}
            >
              <div style={{ display: "flex", alignItems: "center", padding: "8px 14px", gap: 10, background: "var(--bg-2)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                </svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#007AFF", marginBottom: 1 }}>Pinned Message</div>
                  <div style={{ fontSize: 13, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pinned.content}</div>
                </div>
                <button onClick={() => setPinnedMsgId(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--text-2)", display: "flex" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 14px 6px", display: "flex", flexDirection: "column", gap: 3 }}>
        {messages.map((msg, idx) => {
          const nextSame = idx < messages.length - 1 && messages[idx + 1].isMine === msg.isMine;
          const prevSame = idx > 0 && messages[idx - 1].isMine === msg.isMine;

          // Date divider logic
          const prevMsg = idx > 0 ? messages[idx - 1] : null;
          const showDateDivider = !prevMsg || getDateLabel(msg.createdAtIso) !== getDateLabel(prevMsg.createdAtIso);

          if (msg.isDeleted) {
            return (
              <div key={msg.id}>
                {showDateDivider && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0 6px" }}>
                    <div style={{ flex: 1, height: 0.5, background: "var(--sep)" }} />
                    <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500, whiteSpace: "nowrap" }}>{getDateLabel(msg.createdAtIso)}</span>
                    <div style={{ flex: 1, height: 0.5, background: "var(--sep)" }} />
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: msg.isMine ? "flex-end" : "flex-start", marginTop: prevSame ? 0 : 6 }}>
                  <div style={{ fontSize: 14, color: "var(--text-2)", fontStyle: "italic", padding: "8px 14px", background: "var(--bubble-in)", borderRadius: 18 }}>
                    This message was deleted
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} style={{ marginTop: prevSame ? 1 : 8 }}>
              {showDateDivider && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0 8px" }}>
                  <div style={{ flex: 1, height: 0.5, background: "var(--sep)" }} />
                  <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500, whiteSpace: "nowrap" }}>{getDateLabel(msg.createdAtIso)}</span>
                  <div style={{ flex: 1, height: 0.5, background: "var(--sep)" }} />
                </div>
              )}
            <SwipeableRow
              msg={msg}
              onSwipe={() => { setReplyTo({ id: msg.id, content: msg.content, isMine: msg.isMine }); setTimeout(() => inputRef.current?.focus(), 80); }}
              onDragCancel={cancelPress}
            >
              {/* Bubble (reply preview is now inside) */}
              <div
                data-bubble
                onMouseDown={e => startPress(msg, e)}
                onMouseUp={cancelPress}
                onMouseLeave={cancelPress}
                onTouchStart={e => startPress(msg, e)}
                onTouchEnd={cancelPress}
                style={{
                  maxWidth: "75%",
                  borderRadius: 22,
                  borderBottomRightRadius: msg.isMine ? (nextSame ? 22 : 6) : 22,
                  borderBottomLeftRadius: msg.isMine ? 22 : (nextSame ? 22 : 6),
                  background: msg.isMine ? "var(--bubble-out)" : "var(--bubble-in)",
                  color: msg.isMine ? "var(--bubble-out-text)" : "var(--bubble-in-text)",
                  cursor: "pointer",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  overflow: "hidden",
                }}
              >
                {/* Reply quote block inside bubble */}
                {msg.replyTo && (
                  <div style={{ padding: "8px 10px 4px 10px" }}>
                    <div style={{
                      display: "flex",
                      borderRadius: 10,
                      overflow: "hidden",
                      background: msg.isMine ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.06)",
                    }}>
                      {/* Thick left accent bar */}
                      <div style={{ width: 3.5, flexShrink: 0, background: msg.isMine ? "rgba(255,255,255,0.85)" : "#007AFF", borderRadius: "2px 0 0 2px" }} />
                      <div style={{ padding: "7px 10px", minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: msg.isMine ? "#fff" : "#007AFF", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {msg.replyTo.isMine ? "You" : chat.contactName}
                        </div>
                        <div style={{ fontSize: 13, color: msg.isMine ? "rgba(255,255,255,0.72)" : "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {msg.replyTo.content}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Message text + timestamp — always stacked vertically */}
                <div style={{ padding: "8px 12px 8px" }}>
                  <div style={{ fontSize: 15, lineHeight: 1.4, wordBreak: "break-word" }}>
                    {msg.content}
                    {/* invisible spacer so timestamp never overlaps last line of text */}
                    <span style={{ display: "inline-block", width: msg.isMine ? 72 : 44, height: 1 }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end", marginTop: -16 }}>
                    {msg.editedAt && (
                      <span style={{ fontSize: 10, color: "var(--text-2)" }}>edited</span>
                    )}
                    <span style={{ fontSize: 11, color: "var(--text-2)" }}>{msg.sentAt}</span>
                    {msg.isMine && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12l5 5L17 5" stroke="var(--text-2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 12l5 5L23 5" stroke={msg.isRead ? "var(--text-2)" : "var(--sep)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              {/* Reaction pill */}
              {reactions[msg.id] && (
                <div
                  onClick={() => setReactions(prev => { const n = {...prev}; delete n[msg.id]; return n; })}
                  style={{
                    marginTop: 3,
                    alignSelf: msg.isMine ? "flex-end" : "flex-start",
                    background: "var(--bg-input)",
                    borderRadius: 12,
                    padding: "2px 8px",
                    fontSize: 18,
                    cursor: "pointer",
                    border: "1.5px solid var(--bg)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {reactions[msg.id]}
                </div>
              )}
            </SwipeableRow>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-start", marginTop: 6 }}>
            <div style={{ background: "var(--bubble-in)", borderRadius: 22, borderBottomLeftRadius: 6, padding: "14px 18px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 0.15, 0.3].map(delay => (
                <span key={delay} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-2)", display: "inline-block", animation: "msgBounce 1.2s ease-in-out infinite", animationDelay: `${delay}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Context Menu ── */}
      <AnimatePresence>
        {ctx && (() => {
          const W = window.innerWidth;
          const H = window.innerHeight;

          // Compact sizes
          const PILL_H = 52;
          const PILL_W = 260;
          const MENU_W = 220;
          const items = [
            { label: "Reply",   always: true,  action: handleReply,        icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg> },
            { label: "Forward", always: true,  action: () => setCtx(null), icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 17 20 12 15 7"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/></svg> },
            { label: "Edit",    always: false, action: handleEdit,          icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg> },
            { label: "Copy",    always: true,  action: () => { navigator.clipboard?.writeText(ctx.content); setCtx(null); }, icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> },
            { label: pinnedMsgId === ctx.msgId ? "Unpin" : "Pin", always: true, action: () => { setPinnedMsgId(prev => prev === ctx!.msgId ? null : ctx!.msgId); setCtx(null); }, icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg> },
            { label: "Delete",  always: false, action: handleDelete, danger: true, icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg> },
          ].filter(item => item.always || ctx.isMine);

          const ITEM_H = 44;
          const MENU_H = items.length * ITEM_H;
          const GAP = 8;
          const TOTAL = PILL_H + GAP + MENU_H;

          // Horizontal: align to message side
          const MARGIN = 12;
          const pillLeft = ctx.isMine
            ? Math.min(W - PILL_W - MARGIN, Math.max(MARGIN, ctx.x - PILL_W + 40))
            : Math.min(W - PILL_W - MARGIN, Math.max(MARGIN, ctx.x - 20));
          const menuLeft = ctx.isMine
            ? Math.min(W - MENU_W - MARGIN, Math.max(MARGIN, ctx.x - MENU_W + 40))
            : Math.min(W - MENU_W - MARGIN, Math.max(MARGIN, ctx.x - 20));

          // Vertical: prefer above the tap point, clamp to screen
          const showAbove = ctx.y + TOTAL + 40 > H;
          const stackTop = showAbove
            ? Math.max(60, ctx.y - TOTAL - 8)
            : Math.min(ctx.y + 8, H - TOTAL - 16);

          return (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
                onClick={() => setCtx(null)}
              />

              {/* Emoji reaction pill */}
              <div style={{ position: "fixed", top: stackTop, left: pillLeft, zIndex: 51 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", damping: 20, stiffness: 350 }}
                  style={{
                    background: "var(--glass)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 40,
                    padding: "6px 8px",
                    display: "flex", alignItems: "center", gap: 0,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.16)",
                    width: PILL_W,
                  }}
                >
                  {["❤️","👍","😂","😮","😢","🙏"].map(emoji => (
                    <button
                      key={emoji}
                      onClick={e => {
                        e.stopPropagation();
                        setReactions(prev => {
                          const next = { ...prev };
                          if (next[ctx.msgId] === emoji) delete next[ctx.msgId];
                          else next[ctx.msgId] = emoji;
                          return next;
                        });
                        setCtx(null);
                      }}
                      style={{
                        flex: 1, height: 40, borderRadius: 40,
                        background: reactions[ctx.msgId] === emoji ? "rgba(0,122,255,0.12)" : "none",
                        border: "none", cursor: "pointer",
                        fontSize: 22,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "transform 0.1s",
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                  <button style={{
                    width: 32, height: 32, borderRadius: "50%", background: "var(--bg-input)",
                    border: "none", cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2.5" strokeLinecap="round"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
                  </button>
                </motion.div>
              </div>

              {/* Action menu */}
              <div style={{ position: "fixed", top: stackTop + PILL_H + GAP, left: menuLeft, zIndex: 51 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", damping: 24, stiffness: 320, delay: 0.04 }}
                  style={{
                    background: "var(--glass)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 14,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    overflow: "hidden",
                    width: MENU_W,
                  }}
                >
                  {items.map((item, i, arr) => (
                    <button
                      key={item.label}
                      onClick={e => { e.stopPropagation(); item.action(); }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        width: "100%", padding: "11px 16px",
                        background: "none", border: "none",
                        borderBottom: i !== arr.length - 1 ? "0.5px solid var(--sep)" : "none",
                        cursor: "pointer",
                        color: (item as any).danger ? "#ff3b30" : "var(--text)",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: 15 }}>{item.label}</span>
                      <span style={{ display: "flex", color: (item as any).danger ? "#ff3b30" : "var(--text-2)" }}>{item.icon}</span>
                    </button>
                  ))}
                </motion.div>
              </div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* ── Input area ── */}
      <div style={{
        flexShrink: 0,
        background: "var(--bg)",
        borderTop: "0.5px solid var(--sep)",
        padding: "10px 10px",
        paddingBottom: "max(20px, env(safe-area-inset-bottom, 20px))",
      }}>

        {/* Reply / Edit preview banner above input row */}
        <AnimatePresence>
          {(replyTo || editingId !== null) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ overflow: "hidden", marginBottom: 6 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-input)", borderRadius: 12, padding: "8px 12px" }}>
                <div style={{ width: 3, alignSelf: "stretch", borderRadius: 2, background: "#007AFF", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#007AFF", marginBottom: 2 }}>
                    {editingId !== null ? "Edit Message" : (replyTo?.isMine ? "You" : chat.contactName)}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {editingId !== null ? content : replyTo?.content}
                  </div>
                </div>
                <button
                  onClick={() => { setReplyTo(null); setEditingId(null); setContent(""); }}
                  style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--text-2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--bg)", fontSize: 14, fontWeight: 700, lineHeight: 1 }}
                >×</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main input row — matches group style exactly */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Circular + button */}
          <button style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--bg-card)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, color: "var(--text)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>

          {/* Input pill */}
          <div style={{
            flex: 1,
            background: "var(--bg-input)",
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
              style={{ flex: 1, border: "none", background: "transparent", fontSize: 15, color: "var(--text)", outline: "none" }}
            />
          </div>

          {/* Circular send button */}
          <button
            onClick={handleSend}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: content.trim() ? "#007AFF" : "var(--bg-card)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.2s",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
