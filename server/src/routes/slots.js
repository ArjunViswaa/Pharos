import { Router } from "express";
import { z } from "zod";

import { Mentor } from "../models/Mentor.js";
import { Slot } from "../models/Slot.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const createSlotSchema = z.object({
  startsAt: z.coerce.date(),
  durationMinutes: z.coerce.number().int().min(15).max(240).optional(),
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createSlotSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "ValidationError",
      issues: parsed.error.flatten().fieldErrors,
    });
  }
  const { startsAt, durationMinutes } = parsed.data;

  if (startsAt.getTime() <= Date.now()) {
    return res.status(400).json({ error: "SlotMustBeInFuture" });
  }

  try {
    const mentor = await Mentor.findOne({ userId: req.user.sub });
    if (!mentor) {
      return res.status(403).json({ error: "NotAMentor" });
    }

    const slot = await Slot.create({
      mentorId: mentor._id,
      startsAt,
      durationMinutes,
    });

    return res.status(201).json({ slot });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: "SlotAlreadyExists" });
    }
    console.error("Create slot failed:", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.user.sub });
    if (!mentor) {
      return res.status(403).json({ error: "NotAMentor" });
    }

    const slots = await Slot.find({ mentorId: mentor._id }).sort({
      startsAt: 1,
    });

    return res.json({ slots });
  } catch (err) {
    console.error("List own slots failed:", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

export default router;
