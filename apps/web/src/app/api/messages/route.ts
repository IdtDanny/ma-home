import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await prisma.contactMessage.findMany({
    where: {
      tenant: {
        tenantProfile: {
          unit: { property: { adminId: session.user.id } },
        },
      },
    },
    include: {
      tenant: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(messages);
}