import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, AuthUser } from "../types";

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.substring(7) : undefined;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return res.status(401).json({ success: false, message: "Authentication token required" });
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthUser;
    req.user = { id: Number(decoded.id), role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
