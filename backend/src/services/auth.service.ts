import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import prisma from "../config/prisma";

const publicUser = (user: any) => ({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });

export const registerUser = async (name: string, email: string, password: string) => {
  if (!name || !email || !password) throw new Error("Name, email and password are required");
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) throw new Error("Email already registered");
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email: email.toLowerCase(), password: hashed, role: Role.CUSTOMER } });
  return { message: "Registration successful", user: publicUser(user) };
};

export const loginUser = async (email: string, password: string) => {
  if (!email || !password) throw new Error("Email and password are required");
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.password))) throw new Error("Invalid email or password");
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: "1d" });
  return { message: "Login successful", token, user: publicUser(user) };
};
