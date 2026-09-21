
import { Request, Response } from "express";
import {
  getDashboard,
  changeUserRole as changeUserRoleService,
  assignTicket,
  createUserInvitation,
  deleteUser as deleteUserService,
} from "../services/admin.service";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/category.service";

export const dashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getDashboard();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load admin dashboard.",
    });
  }
};

export const getUsers = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await import("../config/prisma").then(
      ({ default: prisma }) =>
        prisma.user.findMany({
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        })
    );

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load users.",
    });
  }
};

export const changeUserRole = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!Number.isInteger(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (
      !["CUSTOMER", "AGENT", "ADMIN"].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    const user = await changeUserRoleService(
      userId,
      role
    );

    return res.json({
      success: true,
      message: "User role updated successfully.",
      user,
    });
  } catch (error: any) {
    console.error("CHANGE USER ROLE ERROR:", error);

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to update user role.",
    });
  }
};

export const removeUser = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const result = await deleteUserService(userId);

    return res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("DELETE USER ERROR:", error);

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to delete user.",
    });
  }
};

export const inviteUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and role are required.",
      });
    }

    if (
      role !== "AGENT" &&
      role !== "ADMIN"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only Agent and Administrator invitations are allowed.",
      });
    }

    const result =
      await createUserInvitation(
        name,
        email,
        role
      );

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    const invitationUrl =
      `${frontendUrl.replace(/\/$/, "")}` +
      `/accept-invitation/${result.invitationToken}`;

    return res.status(201).json({
      success: true,
      message:
        `${role === "AGENT" ? "AGENT" : "ADMIN"} invitation created successfully.`,
      user: result.user,
      invitation: {
        invitationUrl,
        token: result.invitationToken,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error: any) {
    console.error("INVITE USER ERROR:", error);

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to create invitation.",
    });
  }
};

export const listCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const categories = await getCategories();

    return res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error(
      "ADMIN LIST CATEGORIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load categories.",
    });
  }
};

export const addCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, description } =
      req.body;

    const category =
      await createCategory(
        name,
        description
      );

    return res.status(201).json({
      success: true,
      message:
        "Category created successfully.",
      category,
    });
  } catch (error: any) {
    console.error(
      "CREATE CATEGORY ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to create category.",
    });
  }
};

export const editCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const { name, description } =
      req.body;

    const category =
      await updateCategory(
        id,
        name,
        description
      );

    return res.json({
      success: true,
      message:
        "Category updated successfully.",
      category,
    });
  } catch (error: any) {
    console.error(
      "UPDATE CATEGORY ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to update category.",
    });
  }
};

export const removeCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    await deleteCategory(id);

    return res.json({
      success: true,
      message:
        "Category deleted successfully.",
    });
  } catch (error: any) {
    console.error(
      "DELETE CATEGORY ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to delete category.",
    });
  }
};

export const assignTicketToAgent =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const ticketId = Number(
        req.params.id
      );

      if (!Number.isInteger(ticketId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket ID.",
        });
      }

      const rawAssignedToId =
        req.body?.assignedToId;

      if (
        rawAssignedToId === null ||
        rawAssignedToId === "" ||
        rawAssignedToId === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: "Agent ID is required.",
        });
      }

      const assignedToId =
        Number(rawAssignedToId);

      if (!Number.isInteger(assignedToId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid agent ID.",
        });
      }

      const result =
        await assignTicket(
          ticketId,
          assignedToId
        );

      return res.json({
        success: true,
        message:
          "Ticket assignment updated successfully.",
        ticket: result,
      });
    } catch (error: any) {
      console.error(
        "ASSIGN TICKET ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error?.message ||
          "Unable to assign ticket.",
      });
    }
  };
