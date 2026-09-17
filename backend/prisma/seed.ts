import bcrypt from "bcrypt";
import prisma from "../src/config/prisma";

const categories = [
  {
    name: "Technical Support",
    description:
      "Issues related to software, systems, applications and technical problems.",
  },
  {
    name: "Account & Login",
    description:
      "Login, password, account access and authentication related issues.",
  },
  {
    name: "Billing & Payments",
    description:
      "Payment, invoice, subscription and billing related issues.",
  },
  {
    name: "Hardware",
    description:
      "Computer, laptop, printer and other hardware related issues.",
  },
  {
    name: "Software",
    description:
      "Software installation, configuration and application related issues.",
  },
  {
    name: "Other",
    description:
      "Issues that do not fit into the other support categories.",
  },
];

const seed = async () => {
  console.log("Starting database seed...");

  // ---------------------------------------
  // Seed ticket categories
  // ---------------------------------------

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        name: category.name,
      },
      update: {
        description: category.description,
      },
      create: category,
    });
  }

  console.log(
    `Seeded ${categories.length} ticket categories.`
  );

  // ---------------------------------------
  // Seed admin user
  // ---------------------------------------

  const adminPassword = await bcrypt.hash(
    "Admin@123",
    10
  );

  await prisma.user.upsert({
    where: {
      email: "admin@helpdesk.local",
    },
    update: {
      name: "System Admin",
      password: adminPassword,
      role: "ADMIN",
    },
    create: {
      name: "System Admin",
      email: "admin@helpdesk.local",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user ready.");

  // ---------------------------------------
  // Seed agent user
  // ---------------------------------------

  const agentPassword = await bcrypt.hash(
    "Agent@123",
    10
  );

  await prisma.user.upsert({
    where: {
      email: "agent@helpdesk.local",
    },
    update: {
      name: "Support Agent",
      password: agentPassword,
      role: "AGENT",
    },
    create: {
      name: "Support Agent",
      email: "agent@helpdesk.local",
      password: agentPassword,
      role: "AGENT",
    },
  });

  console.log("Agent user ready.");

  console.log("Database seed completed successfully.");
};

seed()
  .catch((error) => {
    console.error(
      "Seed failed:",
      error
    );
  })
  .finally(async () => {
    await prisma.$disconnect();
  });