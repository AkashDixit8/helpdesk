import "dotenv/config";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

import prisma from "../config/prisma";

const run = async () => {
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  const agentEmail = process.env.BOOTSTRAP_AGENT_EMAIL?.trim().toLowerCase();
  const agentPassword = process.env.BOOTSTRAP_AGENT_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required."
    );
  }

  if (!agentEmail || !agentPassword) {
    throw new Error(
      "BOOTSTRAP_AGENT_EMAIL and BOOTSTRAP_AGENT_PASSWORD are required."
    );
  }

  if (adminPassword.length < 12) {
    throw new Error(
      "BOOTSTRAP_ADMIN_PASSWORD must contain at least 12 characters."
    );
  }

  if (agentPassword.length < 12) {
    throw new Error(
      "BOOTSTRAP_AGENT_PASSWORD must contain at least 12 characters."
    );
  }

  /*
   * Find existing ADMIN
   */
  const admin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (!admin) {
    throw new Error(
      `Admin account not found with email: ${adminEmail}`
    );
  }

  if (admin.role !== Role.ADMIN) {
    throw new Error(
      `${adminEmail} exists but is not an ADMIN account.`
    );
  }

  /*
   * Find existing AGENT
   */
  const agent = await prisma.user.findUnique({
    where: {
      email: agentEmail,
    },
  });

  if (!agent) {
    throw new Error(
      `Agent account not found with email: ${agentEmail}`
    );
  }

  if (agent.role !== Role.AGENT) {
    throw new Error(
      `${agentEmail} exists but is not an AGENT account.`
    );
  }

  /*
   * Hash new passwords
   */
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  const agentPasswordHash = await bcrypt.hash(agentPassword, 12);

  /*
   * Update passwords
   */
  await prisma.user.update({
    where: {
      id: admin.id,
    },
    data: {
      password: adminPasswordHash,
    },
  });

  await prisma.user.update({
    where: {
      id: agent.id,
    },
    data: {
      password: agentPasswordHash,
    },
  });

  console.log("");
  console.log("========================================");
  console.log(" PASSWORD RESET SUCCESSFUL");
  console.log("========================================");
  console.log(`Admin: ${admin.email}`);
  console.log(`Agent: ${agent.email}`);
  console.log("========================================");
  console.log("");
};

run()
  .catch((error) => {
    console.error("");
    console.error("Password reset failed:");
    console.error(
      error instanceof Error ? error.message : error
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });