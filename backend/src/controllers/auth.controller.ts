import { Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth.service";

export const register = async (req: Request, res: Response) => { try { const result = await registerUser(req.body.name, req.body.email, req.body.password); res.status(201).json({ success: true, ...result }); } catch (e: any) { res.status(400).json({ success: false, message: e.message }); } };
export const login = async (req: Request, res: Response) => { try { const result = await loginUser(req.body.email, req.body.password); res.status(200).json({ success: true, ...result }); } catch (e: any) { res.status(401).json({ success: false, message: e.message }); } };
