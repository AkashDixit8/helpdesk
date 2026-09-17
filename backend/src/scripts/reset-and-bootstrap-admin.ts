import "dotenv/config";
import bcrypt from "bcryptjs";

import { Role } from "@prisma/client";

import prisma from "../config/prisma";

const required = [
  "BOOTSTRAP_ADMIN_NAME",
  "BOOTSTRAP_ADMIN_EMAIL",
  "BOOTSTRAP_ADMIN_PASSWORD",
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
    process.env.BOOTSTRAP_ADMIN_NAME!
      .trim();

  const email =
    process.env.BOOTSTRAP_ADMIN_EMAIL!
      .trim()
      .toLowerCase();

  const password =
    process.env.BOOTSTRAP_ADMIN_PASSWORD!;

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new Error(
      "BOOTSTRAP_ADMIN_EMAIL must be a valid email address."
    );
  }

  if (password.length < 12) {
    throw new Error(
      "BOOTSTRAP_ADMIN_PASSWORD must contain at least 12 characters."
    );
  }

  console.log("");
  console.log(
    "========================================"
  );
  console.log(
    "  ADMIN RESET + BOOTSTRAP"
  );
  console.log(
    "========================================"
  );

  /*
   * Find the old bootstrap admin.
   */
  const oldAdmin =
    await prisma.user.findUnique({
      where: {
        email:
          "admin@helpdesk.local",
      },
    });

  if (oldAdmin) {
    console.log(
      `Found old admin: ${oldAdmin.email}`
    );

    /*
     * Check whether this user is referenced
     * by tickets, comments or history.
     */
    const [
      createdTickets,
      assignedTickets,
      comments,
      history,
    ] = await Promise.all([
      prisma.ticket.count({
        where: {
          createdById:
            oldAdmin.id,
        },
      }),

      prisma.ticket.count({
        where: {
          assignedToId:
            oldAdmin.id,
        },
      }),

      prisma.comment.count({
        where: {
          userId:
            oldAdmin.id,
        },
      }),

      prisma.ticketHistory.count({
        where: {
          changedBy:
            oldAdmin.id,
        },
      }),
    ]);

    const dependencyCount =
      createdTickets +
      assignedTickets +
      comments +
      history;

    if (dependencyCount > 0) {
      throw new Error(
        [
          "The old admin cannot be deleted safely.",
          "",
          `Created tickets: ${createdTickets}`,
          `Assigned tickets: ${assignedTickets}`,
          `Comments: ${comments}`,
          `Ticket history entries: ${history}`,
          "",
          "The account is being preserved because other records reference it.",
          "Use the existing account or reset its password instead.",
        ].join("\n")
      );
    }

    await prisma.user.delete({
      where: {
        id: oldAdmin.id,
      },
    });

    console.log(
      "Old admin deleted successfully."
    );
  } else {
    console.log(
      "No old admin@helpdesk.local account found."
    );
  }

  /*
   * Make sure the new email isn't already used.
   */
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

  const admin =
    await prisma.user.create({
      data: {
        name,
        email,
        password:
          passwordHash,
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
  console.log(
    "========================================"
  );
  console.log(
    "  NEW ADMIN CREATED"
  );
  console.log(
    "========================================"
  );

  console.log(
    `ID:    ${admin.id}`
  );

  console.log(
    `Name:  ${admin.name}`
  );

  console.log(
    `Email: ${admin.email}`
  );

  console.log(
    `Role:  ${admin.role}`
  );

  console.log(
    "========================================"
  );

  console.log("");
  console.log(
    "Admin login is ready."
  );
};

run()
  .catch((error) => {
    console.error("");
    console.error(
      "Admin bootstrap failed:"
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