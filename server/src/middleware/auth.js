import { verifyToken } from '../lib/jwt.js';

export const requireAuth = (req, res, next) => {
    const header = req.headers['authorization'] || "";
    const [scheme, token] = header.split(' ');
    if(scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'MissingToken' });
    }

    try {
        req.user = verifyToken(token);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'InvalidToken' });
    }
};