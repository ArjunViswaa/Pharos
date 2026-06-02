import { Router } from "express";
import { z } from "zod";

import { User } from "../models/User.js";
import { hashPassword, verifyPassword } from "../lib/hash.js";
import { signToken } from "../lib/jwt.js";

const router = Router();

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  role: z.enum(["learner", "mentor"]).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required").max(128),
});

router.post("/signup", async (req, res) => {
  // 1. Validate input
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "ValidationError",
      issues: parsed.error.flatten().fieldErrors,
    });
  }
  const { name, email, password, role } = parsed.data;

  try {
    // 2. Reject duplicate emails up front (the unique index is the backstop)
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "EmailAlreadyRegistered" });
    }

    // 3. Hash password and persist
    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role });

    return res.status(201).json({ user });
  } catch (err) {
    // Race condition: another request created the same email between findOne and create
    if (err?.code === 11000) {
      return res.status(409).json({ error: "EmailAlreadyRegistered" });
    }
    console.error("Signup failed:", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

router.post("/login", async (req, res) => {
  // 1. Validate input
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "ValidationError",
      issues: parsed.error.flatten().fieldErrors,
    });
  }
  const { email, password } = parsed.data;

  try {
    // 2. Lookup. We deliberately return the same generic error for
    //    "no such user" and "wrong password" to avoid email enumeration.
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "InvalidCredentials" });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "InvalidCredentials" });
    }

    // 3. Issue JWT
    const token = signToken(user);
    return res.json({ user, token });
  } catch (err) {
    console.error("Login failed:", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

export default router;
