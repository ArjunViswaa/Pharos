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
    yearsOfExperience: z.coerce.number().int().min(0).max(60),
    hourlyRate: z.coerce.number().int().min(100).max(100000),
    linkedIn: z.string().trim().url("Invalid URL").optional(),
});

const listQuerySchema = z.object({
    search: z.string().trim().max(100).optional(),
    skills: z.string().trim().optional(),
    minRate: z.coerce.number().int().min(0).optional(),
    maxRate: z.coerce.number().int().min(0).optional(),
    verifiedOnly: z
        .enum(["true", "false"])
        .optional()
        .transform((v) => v === "true"),
    sort: z.enum(["newest", "rate_asc", "rate_desc", "experience"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
});

router.get("/", async (req, res) => {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({
            error: "ValidationError",
            issues: parsed.error.flatten().fieldErrors,
        });
    }
    const { search, skills, minRate, maxRate, verifiedOnly, sort, page, limit } =
        parsed.data;

    const filter = {};

    if (verifiedOnly) filter.verified = true;

    if (search) {
        filter.$or = [
            { headline: { $regex: search, $options: "i" } },
            { bio: { $regex: search, $options: "i" } },
        ];
    }

    if (skills) {
        const skillList = skills
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
        if (skillList.length) {
            filter.skills = { $in: skillList };
        }
    }

    if (minRate != null || maxRate != null) {
        filter.hourlyRate = {};
        if (minRate != null) filter.hourlyRate.$gte = minRate;
        if (maxRate != null) filter.hourlyRate.$lte = maxRate;
    }

    const sortMap = {
        newest: { createdAt: -1 },
        rate_asc: { hourlyRate: 1 },
        rate_desc: { hourlyRate: -1 },
        experience: { yearsOfExperience: -1 },
    };
    const sortBy = sortMap[sort] || sortMap.newest;

    try {
        const skip = (page - 1) * limit;

        const [mentors, total] = await Promise.all([
            Mentor.find(filter)
                .populate("userId", "name role") // pull name + role from User
                .sort(sortBy)
                .skip(skip)
                .limit(limit),
            Mentor.countDocuments(filter),
        ]);

        return res.json({
            mentors,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error("List mentors failed:", err);
        return res.status(500).json({ error: "InternalServerError" });
    }
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
        const existing = await Mentor.findOne({ userId: req.user.sub });
        if (existing) {
            return res.status(409).json({ error: "MentorProfileExists" });
        }

        const mentor = await Mentor.create({
            ...parsed.data,
            userId: req.user.sub,
        });

        await User.updateOne(
            { _id: req.user.sub, role: "learner" },
            { $set: { role: "mentor" } }
        );

        return res.status(201).json({ mentor });
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ error: "MentorProfileExists" });
        }
        console.error("Create mentor failed:", err);
        return res.status(500).json({ error: "InternalServerError" });
    }
});

export default router;