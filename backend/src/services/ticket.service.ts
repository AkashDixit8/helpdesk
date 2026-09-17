import { Prisma, Role, TicketStatus } from "@prisma/client";
import prisma from "../config/prisma";

const includeData = {
  category: true,
  createdBy: { select: { id: true, name: true, email: true, role: true } },
  assignedTo: { select: { id: true, name: true, email: true, role: true } },
};

const publicCommentInclude = { user: { select: { id: true, name: true, role: true } } };

export const createNewTicket = async (title: string, description: string, categoryId: number, userId: number) => {
  if (!title || !description || !categoryId) throw new Error("Title, description and category are required");
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new Error("Category not found");
  return prisma.ticket.create({ data: { title, description, categoryId, createdById: userId }, include: includeData });
};

export const getAllTickets = async (userId: number, role: Role) => {
  const where = role === Role.CUSTOMER ? { createdById: userId } : {};
  return prisma.ticket.findMany({ where, include: includeData, orderBy: { createdAt: "desc" } });
};

export const getTicketById = async (id: number, userId: number, role: Role) => {
  const ticket = await prisma.ticket.findUnique({ where: { id }, include: { ...includeData, comments: { where: role === Role.CUSTOMER ? { isInternal: false } : undefined, include: publicCommentInclude, orderBy: { createdAt: "asc" } }, history: { include: { user: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "asc" } } } });
  if (!ticket) throw new Error("Ticket not found");
  if (role === Role.CUSTOMER && ticket.createdById !== userId) throw new Error("Access denied");
  return ticket;
};

export const updateTicketById = async (id: number, userId: number, role: Role, data: any) => {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new Error("Ticket not found");
  if (role === Role.CUSTOMER) {
    if (ticket.createdById !== userId) throw new Error("Access denied");
    if (data.status !== TicketStatus.CLOSED || Object.keys(data).some(k => k !== "status")) throw new Error("Customers can only close their own ticket");
  }
  if (data.assignedToId !== undefined && role !== Role.AGENT && role !== Role.ADMIN) throw new Error("Only agents or admins can assign tickets");
  if (data.assignedToId !== undefined && data.assignedToId !== null) {
    const agent = await prisma.user.findFirst({ where: { id: Number(data.assignedToId), role: Role.AGENT } });
    if (!agent) throw new Error("Assigned user must be an agent");
  }
  if (data.assignedToId === null && role !== Role.ADMIN) throw new Error("Only admins can remove assignment");

  const updateData: Prisma.TicketUpdateInput = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.categoryId !== undefined) updateData.category = { connect: { id: Number(data.categoryId) } };
  if (data.assignedToId !== undefined) updateData.assignedTo = data.assignedToId === null ? { disconnect: true } : { connect: { id: Number(data.assignedToId) } };

  const updated = await prisma.ticket.update({ where: { id }, data: updateData, include: includeData });
  if (data.status !== undefined && data.status !== ticket.status) await prisma.ticketHistory.create({ data: { ticketId: id, changedBy: userId, oldStatus: ticket.status, newStatus: data.status } });
  return updated;
};

export const deleteTicketById = async (id: number, role: Role) => {
  if (role !== Role.ADMIN) throw new Error("Only admins can delete tickets");
  return prisma.ticket.delete({ where: { id } });
};

export const addComment = async (ticketId: number, userId: number, comment: string, isInternal = false) => {
  if (!comment?.trim()) throw new Error("Comment is required");
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("Ticket not found");
  return prisma.comment.create({ data: { ticketId, userId, comment: comment.trim(), isInternal }, include: publicCommentInclude });
};

export const takeTicket = async (ticketId: number, userId: number) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("Ticket not found");
  if (ticket.assignedToId) throw new Error("Ticket is already assigned");
  if (ticket.status === TicketStatus.CLOSED) throw new Error("Closed ticket cannot be taken");
  const updated = await prisma.ticket.update({ where: { id: ticketId }, data: { assignedToId: userId, status: TicketStatus.IN_PROGRESS }, include: includeData });
  await prisma.ticketHistory.create({ data: { ticketId, changedBy: userId, oldStatus: ticket.status, newStatus: TicketStatus.IN_PROGRESS } });
  return updated;
};
