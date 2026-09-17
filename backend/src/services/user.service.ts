import { Role } from "@prisma/client";
import prisma from "../config/prisma";

export const getAllUsers = async () => prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: "desc" } });
export const getUserById = async (id: number) => prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, createdAt: true } });
export const updateUser = async (id: number, data: { name?: string; role?: Role }) => prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true, role: true, createdAt: true } });
