import { Router } from "express";
import Razorpay from "razorpay";
import { z } from "zod";
import crypto from "crypto";

import { Slot } from "../models/Slot.js";
import { Mentor } from "../models/Mentor.js";
import { requireAuth } from "../middleware/auth.js";
import { Booking } from "../models/Booking.js";

const router = Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const orderSchema = z.object({
    slotId: z.string().min(1),
});

const verifySchema = z.object({
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
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

router.post("/verify", requireAuth, async (req, res) => {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: "ValidationError",
            issues: parsed.error.flatten().fieldErrors,
        });
    }
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, slotId } =
        parsed.data;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

    if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ error: "PaymentVerificationFailed" });
    }

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
                paymentId: razorpayPaymentId,
                razorpayOrderId,
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
        console.error("Verify payment failed:", err);
        return res.status(500).json({ error: "InternalServerError" });
    }
});

router.post("/webhook", async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.body)
        .digest("hex");

    if (expectedSignature !== signature) {
        return res.status(400).json({ error: "InvalidWebhookSignature" });
    }

    let event;
    try {
        event = JSON.parse(req.body.toString());
    } catch (err) {
        return res.status(400).json({ error: "InvalidPayload" });
    }

    if (event.event === "payment.captured") {
        const orderId = event.payload?.payment?.entity?.order_id;
        if (orderId) {
            await Booking.updateOne(
                { razorpayOrderId: orderId },
                { paymentConfirmed: true }
            );
            console.log(`Webhook: payment confirmed for order ${orderId}`);
        }
    }

    return res.json({ received: true });
});

export default router;