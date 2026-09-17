import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";

const hashToken = (token: string) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

export const getInvitation = async (
  req: Request,
  res: Response
) => {
  try {
    const token = String(req.params.token || "");

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invitation token is required.",
      });
    }

    const tokenHash = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        invitationTokenHash: tokenHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        invitationExpiresAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "This invitation is invalid or has already been used.",
      });
    }

    if (
      !user.invitationExpiresAt ||
      user.invitationExpiresAt <= new Date()
    ) {
      return res.status(410).json({
        success: false,
        message:
          "This invitation has expired. Please ask an administrator to send a new invitation.",
      });
    }

    if (
      user.role !== "AGENT" &&
      user.role !== "ADMIN"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This invitation is not valid for this account.",
      });
    }

    return res.json({
      success: true,
      invitation: {
        name: user.name,
        email: user.email,
        role: user.role,
        expiresAt: user.invitationExpiresAt,
      },
    });
  } catch (error) {
    console.error("GET INVITATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify invitation.",
    });
  }
};

export const acceptInvitation = async (
  req: Request,
  res: Response
) => {
  try {
    const token = String(req.params.token || "");
    const password = String(req.body?.password || "");

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invitation token is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    if (password.length < 12) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 12 characters.",
      });
    }

    const tokenHash = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        invitationTokenHash: tokenHash,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "This invitation is invalid or has already been used.",
      });
    }

    if (
      !user.invitationExpiresAt ||
      user.invitationExpiresAt <= new Date()
    ) {
      return res.status(410).json({
        success: false,
        message:
          "This invitation has expired. Please ask an administrator to send a new invitation.",
      });
    }

    if (
      user.role !== "AGENT" &&
      user.role !== "ADMIN"
    ) {
      return res.status(400).json({
        success: false,
        message: "This invitation is not valid.",
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: passwordHash,
        invitationTokenHash: null,
        invitationExpiresAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return res.json({
      success: true,
      message:
        "Invitation accepted successfully. You can now log in.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "ACCEPT INVITATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to accept invitation.",
    });
  }
};