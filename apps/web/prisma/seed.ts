// prisma/seed.ts
import { PrismaClient } from "../src/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@mahome.com";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        passwordHash: hash,
        role: "ADMIN",
      },
    });
    console.log("✅ Admin created: admin@mahome.com / admin123");
  } else {
    console.log("Admin already exists, skipping.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());