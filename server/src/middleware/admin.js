import { User } from "../models/User.js";

export async function requireAdmin(req, res, next) {
    try {
        const user = await User.findById(req.user.sub);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ error: "AdminOnly" });
        }
        next();
    } catch (err) {
        console.error("Admin check failed:", err);
        return res.status(500).json({ error: "InternalServerError" });
    }
}