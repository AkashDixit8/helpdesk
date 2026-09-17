import { Router } from "express";
import {
  getInvitation,
  acceptInvitation,
} from "../controllers/invitation.controller";

const router = Router();

router.get(
  "/:token",
  getInvitation
);

router.post(
  "/:token/accept",
  acceptInvitation
);

export default router;