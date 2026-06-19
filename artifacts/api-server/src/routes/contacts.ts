import { Router } from "express";
import { db, contactsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/contacts
router.get("/", async (req, res) => {
  try {
    const contacts = await db.select().from(contactsTable);
    res.json(contacts.map((c) => ({
      id: c.id,
      name: c.name,
      avatarColor: c.avatarColor,
      avatarInitials: c.avatarInitials,
      avatarUrl: c.avatarUrl ?? null,
      disappearingMessages: c.disappearingMessages,
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to list contacts" });
  }
});

// GET /api/contacts/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const contact = await db.query.contactsTable.findFirst({
      where: eq(contactsTable.id, id),
    });
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.json({
      id: contact.id,
      name: contact.name,
      avatarColor: contact.avatarColor,
      avatarInitials: contact.avatarInitials,
      avatarUrl: contact.avatarUrl ?? null,
      disappearingMessages: contact.disappearingMessages,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get contact" });
  }
});

export default router;
