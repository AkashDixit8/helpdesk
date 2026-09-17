import "dotenv/config";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

import prisma from "../config/prisma";

const required = [
  "BOOTSTRAP_AGENT_NAME",
  "BOOTSTRAP_AGENT_EMAIL",
  "BOOTSTRAP_AGENT_PASSWORD",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(
      `${key} is required in .env`
    );
  }
}

const run = async () => {
  const name =
    process.env.BOOTSTRAP_AGENT_NAME!
      .trim();

  const email =
    process.env.BOOTSTRAP_AGENT_EMAIL!
      .trim()
      .toLowerCase();

  const password =
    process.env.BOOTSTRAP_AGENT_PASSWORD!;

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new Error(
      "BOOTSTRAP_AGENT_EMAIL must be a valid email address."
    );
  }

  if (password.length < 12) {
    throw new Error(
      "BOOTSTRAP_AGENT_PASSWORD must contain at least 12 characters."
    );
  }

  const existing =
    await prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (existing) {
    throw new Error(
      `A user already exists with email: ${email}`
    );
  }

  const passwordHash =
    await bcrypt.hash(
      password,
      12
    );

  const agent =
    await prisma.user.create({
      data: {
        name,
        email,
        password:
          passwordHash,
        role: Role.AGENT,
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
  console.log(
    "========================================"
  );
  console.log(
    "  AGENT CREATED"
  );
  console.log(
    "========================================"
  );

  console.log(
    `ID:    ${agent.id}`
  );

  console.log(
    `Name:  ${agent.name}`
  );

  console.log(
    `Email: ${agent.email}`
  );

  console.log(
    `Role:  ${agent.role}`
  );

  console.log(
    "========================================"
  );
};

run()
  .catch((error) => {
    console.error("");
    console.error(
      "Agent creation failed:"
    );

    console.error(
      error instanceof Error
        ? error.message
        : error
    );

    process.exitCode = 1;
  })
  .finally(
    async () => {
      await prisma.$disconnect();
    }
  );