import { Router } from "express";
import { z } from "zod";

import { User } from "../models/User.js";
import { Mentor } from "../models/Mentor.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const createMentorSchema = z.object({
    headline: z.string().trim().max(120).optional(),
    bio: z.string().trim().min(30, "Bio must be at least 30 characters").max(1000),
    skills: z
        .array(z.string().trim().min(1).max(40))
        .min(1, "List at least one skill")
        .max(10, "Limit to 10 skills"),
    // z.coerce.number() turns "5" (string) into 5 (number) before validating.
    // Forms always send strings; without coerce, the form would always fail.
    yearsOfExperience: z.coerce.number().int().min(0).max(60),
    hourlyRate: z.coerce.number().int().min(100).max(100000),
    linkedIn: z.string().trim().url("Invalid URL").optional(),
});

router.post("/", requireAuth, async (req, res) => {
    const parsed = createMentorSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: "ValidationError",
            issues: parsed.error.flatten().fieldErrors,
        });
    }

    try {
        // 1. Reject if a profile already exists — let the user know explicitly
        //    rather than the cryptic duplicate-key error.
        const existing = await Mentor.findOne({ userId: req.user.sub });
        if (existing) {
            return res.status(409).json({ error: "MentorProfileExists" });
        }

        // 2. Create the profile
        const mentor = await Mentor.create({
            ...parsed.data,
            userId: req.user.sub,
        });

        // 3. Promote the user — but ONLY if they're currently a learner.
        //    If they're already an admin, we don't accidentally demote them.
        //    Atomic conditional update — runs as a single DB operation.
        await User.updateOne(
            { _id: req.user.sub, role: "learner" },
            { $set: { role: "mentor" } }
        );

        return res.status(201).json({ mentor });
    } catch (err) {
        // Race condition backstop: if two requests slip past the findOne check,
        // the unique index throws 11000. We map it to the same 409.
        if (err?.code === 11000) {
            return res.status(409).json({ error: "MentorProfileExists" });
        }
        console.error("Create mentor failed:", err);
        return res.status(500).json({ error: "InternalServerError" });
    }
});

export default router;