// prisma/seed.ts
import { PrismaClient } from "../src/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const superAdminEmail = "superadmin@mahome.com";
  const existingSA = await prisma.user.findUnique({ where: { email: superAdminEmail } });
  if (!existingSA) {
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: "Super Admin",
        passwordHash: await bcrypt.hash("superadmin123", 12),
        role: "SUPER_ADMIN",
      },
    });
    console.log("Super Admin created: superadmin@mahome.com / superadmin123");
  }

  const landlordEmail = "admin@mahome.com";
  const existingLandlord = await prisma.user.findUnique({ where: { email: landlordEmail } });
  if (!existingLandlord) {
    await prisma.user.create({
      data: {
        email: landlordEmail,
        name: "Landlord",
        passwordHash: await bcrypt.hash("admin123", 12),
        role: "LANDLORD",
      },
    });
    console.log("Landlord created: admin@mahome.com / admin123");
  }

  // const adminEmail = "admin@mahome.com";
  // const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  // if (!existing) {
  //   const hash = await bcrypt.hash("admin123", 12);
  //   await prisma.user.create({
  //     data: {
  //       email: adminEmail,
  //       name: "Admin",
  //       passwordHash: hash,
  //       role: "ADMIN",
  //     },
  //   });
  //   console.log("Admin created: admin@mahome.com / admin123");
  // } 
  
  else {
    console.log("Admin already exists, skipping.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());