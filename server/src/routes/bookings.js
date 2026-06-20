import { Router } from "express";
import { z } from "zod";

import { Mentor } from "../models/Mentor.js";
import { Slot } from "../models/Slot.js";
import { Booking } from "../models/Booking.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const createBookingSchema = z.object({
  slotId: z.string().min(1),
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "ValidationError",
      issues: parsed.error.flatten().fieldErrors,
    });
  }
  const { slotId } = parsed.data;

  try {
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ error: "SlotNotFound" });
    }

    const mentor = await Mentor.findById(slot.mentorId).populate("userId", "name");
    if (!mentor) {
      return res.status(404).json({ error: "MentorNotFound" });
    }

    if (mentor.userId && String(mentor.userId._id) === req.user.sub) {
      return res.status(400).json({ error: "CannotBookOwnSlot" });
    }

    const bookedSlot = await Slot.findOneAndUpdate(
      { _id: slotId, status: "open" },
      { status: "booked" },
      { new: true }
    );
    if (!bookedSlot) {
      return res.status(409).json({ error: "SlotNotAvailable" });
    }

    const amount = Math.round((mentor.hourlyRate * slot.durationMinutes) / 60);

    try {
      const booking = await Booking.create({
        learnerId: req.user.sub,
        mentorId: mentor._id,
        slotId: slot._id,
        mentorName: mentor.userId?.name || "Mentor",
        startsAt: slot.startsAt,
        durationMinutes: slot.durationMinutes,
        amount,
      });
      return res.status(201).json({ booking });
    } catch (saveError) {
      await Slot.findByIdAndUpdate(slotId, { status: "open" });
      if (saveError?.code === 11000) {
        return res.status(409).json({ error: "SlotNotAvailable" });
      }
      throw saveError;
    }
  } catch (err) {
    if (err?.name === "CastError") {
      return res.status(400).json({ error: "InvalidSlotId" });
    }
    console.error("Create booking failed:", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ learnerId: req.user.sub }).sort({
      startsAt: 1,
    });
    return res.json({ bookings });
  } catch (err) {
    console.error("List bookings failed:", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

export default router;
