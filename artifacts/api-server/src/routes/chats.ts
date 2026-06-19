import { Router } from "express";
import { db, chatsTable, messagesTable, contactsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import type { Server as IOServer } from "socket.io";

const router = Router();

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

function formatMessage(m: any) {
  return {
    id: m.id,
    content: m.isDeleted ? "This message was deleted" : m.content,
    isMine: m.isMine,
    sentAt: formatTime(m.createdAt),
    createdAtIso: m.createdAt.toISOString(),
    isRead: m.isRead,
    replyToId: m.replyToId ?? null,
    editedAt: m.editedAt ? formatTime(m.editedAt) : null,
    isDeleted: m.isDeleted,
  };
}

// GET /api/chats
router.get("/", async (req, res) => {
  try {
    const chats = await db.select().from(chatsTable);

    const result = await Promise.all(
      chats.map(async (chat) => {
        const contact = await db.query.contactsTable.findFirst({
          where: eq(contactsTable.id, chat.contactId),
        });
        const lastMsg = await db.query.messagesTable.findFirst({
          where: eq(messagesTable.chatId, chat.id),
          orderBy: [desc(messagesTable.createdAt)],
        });
        const allMsgs = await db
          .select()
          .from(messagesTable)
          .where(eq(messagesTable.chatId, chat.id));
        const unreadCount = allMsgs.filter((m) => !m.isMine && !m.isRead).length;

        return {
          id: chat.id,
          contactId: chat.contactId,
          contactName: contact?.name ?? "Unknown",
          avatarColor: contact?.avatarColor ?? "#e0e0e0",
          avatarInitials: contact?.avatarInitials ?? "?",
          avatarUrl: contact?.avatarUrl ?? null,
          lastMessage: lastMsg?.isDeleted
            ? "This message was deleted"
            : (lastMsg?.content ?? ""),
          lastMessageIsMine: lastMsg?.isMine ?? false,
          lastMessageAt: lastMsg?.createdAt?.toISOString() ?? null,
          lastMessageTime: lastMsg ? formatTime(lastMsg.createdAt) : "",
          unreadCount,
        };
      }),
    );

    // Sort by most recent message first
    result.sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to list chats" });
  }
});

// GET /api/chats/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const chat = await db.query.chatsTable.findFirst({
      where: eq(chatsTable.id, id),
    });
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const contact = await db.query.contactsTable.findFirst({
      where: eq(contactsTable.id, chat.contactId),
    });

    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatId, id))
      .orderBy(messagesTable.createdAt);

    const msgMap: Record<number, any> = {};
    messages.forEach((m) => { msgMap[m.id] = m; });

    res.json({
      id: chat.id,
      contactId: chat.contactId,
      contactName: contact?.name ?? "Unknown",
      avatarColor: contact?.avatarColor ?? "#e0e0e0",
      avatarInitials: contact?.avatarInitials ?? "?",
      avatarUrl: contact?.avatarUrl ?? null,
      messages: messages.map((m) => {
        const base = formatMessage(m) as any;
        if (m.replyToId && msgMap[m.replyToId]) {
          const parent = msgMap[m.replyToId];
          base.replyTo = {
            id: parent.id,
            content: parent.isDeleted ? "This message was deleted" : parent.content,
            isMine: parent.isMine,
          };
        }
        return base;
      }),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get chat" });
  }
});

// PATCH /api/chats/:chatId/read — mark all incoming messages as read
router.patch("/:chatId/read", async (req, res) => {
  try {
    const chatId = Number(req.params.chatId);
    await db.update(messagesTable)
      .set({ isRead: true })
      .where(eq(messagesTable.chatId, chatId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

const messageInputSchema = z.object({
  content: z.string().min(1),
  replyToId: z.number().optional(),
});

const editInputSchema = z.object({ content: z.string().min(1) });

export function createChatsRouter(io: IOServer) {
  // POST /api/chats/:chatId/messages
  router.post("/:chatId/messages", async (req, res) => {
    try {
      const chatId = Number(req.params.chatId);
      const body = messageInputSchema.parse(req.body);

      const [newMsg] = await db
        .insert(messagesTable)
        .values({
          chatId,
          content: body.content,
          isMine: true,
          isRead: true,
          replyToId: body.replyToId ?? null,
        })
        .returning();

      const formatted = formatMessage(newMsg);
      io.to(`chat:${chatId}`).emit("new_message", formatted);

      setTimeout(async () => {
        const replies = [
          "Sure thing!",
          "Got it 👍",
          "Sounds good!",
          "Let me check that for you.",
          "Interesting! Tell me more.",
          "Haha, that's funny!",
          "On my way!",
          "See you soon!",
          "Thanks for letting me know.",
          "I'll get back to you shortly.",
        ];
        const replyContent = replies[Math.floor(Math.random() * replies.length)];
        const [replyMsg] = await db
          .insert(messagesTable)
          .values({ chatId, content: replyContent, isMine: false, isRead: false })
          .returning();

        io.to(`chat:${chatId}`).emit("new_message", formatMessage(replyMsg));
      }, 1500);

      res.status(201).json(formatted);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // PATCH /api/chats/:chatId/messages/:msgId
  router.patch("/:chatId/messages/:msgId", async (req, res) => {
    try {
      const chatId = Number(req.params.chatId);
      const msgId = Number(req.params.msgId);
      const body = editInputSchema.parse(req.body);

      const [updated] = await db
        .update(messagesTable)
        .set({ content: body.content, editedAt: new Date() })
        .where(eq(messagesTable.id, msgId))
        .returning();

      if (!updated) return res.status(404).json({ error: "Message not found" });

      const formatted = formatMessage(updated);
      io.to(`chat:${chatId}`).emit("message_edited", formatted);

      res.json(formatted);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
      res.status(500).json({ error: "Failed to edit message" });
    }
  });

  // DELETE /api/chats/:chatId/messages/:msgId
  router.delete("/:chatId/messages/:msgId", async (req, res) => {
    try {
      const chatId = Number(req.params.chatId);
      const msgId = Number(req.params.msgId);

      const [deleted] = await db
        .update(messagesTable)
        .set({ isDeleted: true })
        .where(eq(messagesTable.id, msgId))
        .returning();

      if (!deleted) return res.status(404).json({ error: "Message not found" });

      io.to(`chat:${chatId}`).emit("message_deleted", { id: msgId, chatId });

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  return router;
}

export default router;
