import { Request, Response } from "express";
import { getAllUsers, getUserById, updateUser } from "../services/user.service";
import { AuthRequest } from "../types";

export const listUsers = async (_req: AuthRequest, res: Response) => { try { res.json({ success: true, users: await getAllUsers() }); } catch (e: any) { res.status(500).json({ success: false, message: e.message }); } };
export const getUser = async (req: Request, res: Response) => { try { const user = await getUserById(Number(req.params.id)); if (!user) return res.status(404).json({ success: false, message: "User not found" }); res.json({ success: true, user }); } catch (e: any) { res.status(500).json({ success: false, message: e.message }); } };
export const updateUserController = async (req: Request, res: Response) => { try { res.json({ success: true, user: await updateUser(Number(req.params.id), req.body) }); } catch (e: any) { res.status(400).json({ success: false, message: e.message }); } };
