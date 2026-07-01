import { Router } from "express";
import { z } from "zod";

import { Mentor } from "../models/Mentor.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();

router.get("/mentors", requireAuth, requireAdmin, async (req, res) => {
    try {
        const mentors = await Mentor.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
        return res.json({ mentors });
    } catch (err) {
        console.error("Admin list mentors failed:", err);
        return res.status(500).json({ error: "InternalServerError" });
    }
});

const verifySchema = z.object({
    verified: z.boolean(),
});

router.patch("/mentors/:id/verify", requireAuth, requireAdmin, async (req, res) => {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "ValidationError" });
    }

    try {
        const mentor = await Mentor.findByIdAndUpdate(
            req.params.id,
            { verified: parsed.data.verified },
            { new: true }
        );
        if (!mentor) {
            return res.status(404).json({ error: "MentorNotFound" });
        }
        return res.json({ mentor });
    } catch (err) {
        if (err?.name === "CastError") {
            return res.status(400).json({ error: "InvalidMentorId" });
        }
        console.error("Verify mentor failed:", err);
        return res.status(500).json({ error: "InternalServerError" });
    }
});

export default router;