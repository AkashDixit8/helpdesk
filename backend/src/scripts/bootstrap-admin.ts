import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { Role } from "@prisma/client";

const required = [
  "BOOTSTRAP_ADMIN_NAME",
  "BOOTSTRAP_ADMIN_EMAIL",
  "BOOTSTRAP_ADMIN_PASSWORD",
  "BOOTSTRAP_ADMIN_SECRET",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`${key} is required`);
  }
}

const run = async () => {
  const bootstrapSecret = process.env.BOOTSTRAP_ADMIN_SECRET;

  if (bootstrapSecret !== process.env.BOOTSTRAP_ADMIN_PASSWORD) {
    throw new Error(
      "BOOTSTRAP_ADMIN_SECRET must match BOOTSTRAP_ADMIN_PASSWORD."
    );
  }

  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: Role.ADMIN,
    },
  });

  if (existingAdmin) {
    throw new Error(
      `Bootstrap blocked. An ADMIN account already exists: ${existingAdmin.email}`
    );
  }

  const email = process.env.BOOTSTRAP_ADMIN_EMAIL!.trim().toLowerCase();
  const name = process.env.BOOTSTRAP_ADMIN_NAME!.trim();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD!;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error(
      `A user already exists with email ${email}.`
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: Role.ADMIN,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  console.log("");
  console.log("========================================");
  console.log("  INITIAL ADMIN CREATED");
  console.log("========================================");
  console.log(`ID:    ${admin.id}`);
  console.log(`Name:  ${admin.name}`);
  console.log(`Email: ${admin.email}`);
  console.log(`Role:  ${admin.role}`);
  console.log("========================================");
  console.log("");
};

run()
  .catch((error) => {
    console.error("");
    console.error("Admin bootstrap failed:");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });