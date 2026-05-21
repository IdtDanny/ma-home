import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const count = await prisma.contactMessage.count({
    where: {
      tenantId: session.user.id,
      senderRole: "LANDLORD", // only admin replies
      isRead: false,
    },
  });

  return NextResponse.json({ count });
}