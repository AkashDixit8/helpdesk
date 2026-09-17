import { Request } from "express";
import { Role } from "@prisma/client";

export interface AuthUser {
  id: number;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
