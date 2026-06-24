import { Router } from "express";
import Razorpay from "razorpay";
import { z } from "zod";

import { Slot } from "../models/Slot.js";
import { Mentor } from "../models/Mentor.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const orderSchema = z.object({
    slotId: z.string().min(1),
});

router.post("/order", requireAuth, async (req, res) => {
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: "ValidationError",
            issues: parsed.error.flatten().fieldErrors,
        });
    }
    const { slotId } = parsed.data;

    try {
        const slot = await Slot.findById(slotId);
        if (!slot || slot.status !== "open") {
            return res.status(409).json({ error: "SlotNotAvailable" });
        }

        const mentor = await Mentor.findById(slot.mentorId);
        if (!mentor) {
            return res.status(404).json({ error: "MentorNotFound" });
        }

        const amount = Math.round((mentor.hourlyRate * slot.durationMinutes) / 60);

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `slot_${slotId}`,
        });

        return res.json({
            orderId: order.id,
            amount,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
            slotId,
        });
    } catch (err) {
        if (err?.name === "CastError") {
            return res.status(400).json({ error: "InvalidSlotId" });
        }
        console.error("Create order failed:", err);
        return res.status(500).json({ error: "PaymentSetupFailed" });
    }
});

export default router;