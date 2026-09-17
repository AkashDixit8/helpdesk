import prisma from "../config/prisma";

const DEFAULT_CATEGORIES = [
  { name: "Account & Login", description: "Login, registration, password and account-related issues." },
  { name: "Technical Issue", description: "Application errors, bugs and technical problems." },
  { name: "Billing & Payments", description: "Billing, payment and subscription-related issues." },
  { name: "Access & Permissions", description: "Access, permissions and authorization-related requests." },
  { name: "General Support", description: "General questions and other support requests." },
];

const ensureDefaultCategories = async () => {
  const count = await prisma.category.count();
  if (count === 0) await prisma.category.createMany({ data: DEFAULT_CATEGORIES, skipDuplicates: true });
};

export const getCategories = async () => {
  await ensureDefaultCategories();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return { message: "Categories fetched successfully", categories };
};
export const createCategory = async (name: string, description?: string) => prisma.category.create({ data: { name, description } });
export const updateCategory = async (id: number, name?: string, description?: string) => prisma.category.update({ where: { id }, data: { ...(name !== undefined ? { name } : {}), ...(description !== undefined ? { description } : {}) } });
export const deleteCategory = async (id: number) => prisma.category.delete({ where: { id } });
