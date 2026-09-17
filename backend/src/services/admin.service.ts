import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import prisma from "../config/prisma";

export const getDashboard = async () => {
  const [
    users,
    agents,
    customers,
    tickets,
    openTickets,
    resolvedTickets,
    closedTickets,
    categories,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.AGENT } }),
    prisma.user.count({ where: { role: Role.CUSTOMER } }),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.ticket.count({ where: { status: "RESOLVED" } }),
    prisma.ticket.count({ where: { status: "CLOSED" } }),
    prisma.category.count(),
  ]);

  return {
    users,
    agents,
    customers,
    tickets,
    openTickets,
    resolvedTickets,
    closedTickets,
    categories,
  };
};

export const changeUserRole = async (
  id: number,
  role: Role
) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === Role.ADMIN && role !== Role.ADMIN) {
    const adminCount = await prisma.user.count({
      where: { role: Role.ADMIN },
    });

    if (adminCount <= 1) {
      throw new Error(
        "The last administrator cannot be downgraded."
      );
    }
  }

  return prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

export const assignTicket = async (
  ticketId: number,
  agentId: number
) => {
  const agent = await prisma.user.findFirst({
    where: {
      id: agentId,
      role: Role.AGENT,
    },
  });

  if (!agent) {
    throw new Error("Agent not found");
  }

  return prisma.ticket.update({
    where: { id: ticketId },
    data: { assignedToId: agentId },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      category: true,
    },
  });
};

/*
 * Creates a one-time invitation for either:
 * ADMIN or AGENT.
 */
export const createUserInvitation = async (
  name: string,
  email: string,
  role: Role
) => {
  if (!name?.trim()) {
    throw new Error("Name is required.");
  }

  if (!email?.trim()) {
    throw new Error("Email is required.");
  }

  if (
    role !== Role.AGENT &&
    role !== Role.ADMIN
  ) {
    throw new Error(
      "Only ADMIN and AGENT accounts can be provisioned."
    );
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  /*
   * Basic universal email validation.
   * It accepts normal addresses such as:
   * akki@xyz.com
   * admin@helpdesk.com
   * akash@gmail.com
   * support@company.co.uk
   */
  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    throw new Error("Please provide a valid email address.");
  }

  const existing = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existing) {
    throw new Error(
      "An account already exists with this email."
    );
  }

  /*
   * Generate a cryptographically random invitation token.
   * Only the SHA-256 hash is stored in the database.
   */
  const token = crypto
    .randomBytes(32)
    .toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  /*
   * Invitation remains valid for 24 hours.
   */
  const expiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  );

  /*
   * Temporary unusable password.
   * The invited user replaces this through the invitation flow.
   */
  const temporaryPassword =
    crypto.randomBytes(32).toString("hex");

  const passwordHash = await bcrypt.hash(
    temporaryPassword,
    12
  );

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
      role,

      invitationTokenHash: tokenHash,
      invitationExpiresAt: expiresAt,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return {
    user,
    invitationToken: token,
    expiresAt,
  };
};