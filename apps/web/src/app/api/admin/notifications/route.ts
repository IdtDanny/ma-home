import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminId = session.user.id;

  // Pending contracts requiring admin signature
  const pendingContracts = await prisma.contract.count({
    where: {
      status: "PENDING_LANDLORD_SIGNATURE",
      tenant: { unit: { property: { adminId } } },
    },
  });

  // Recent successful payments (last 24h)
  const recentPayments = await prisma.payment.count({
    where: {
      status: "SUCCESSFUL",
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      bill: { tenant: { unit: { property: { adminId } } } },
    },
  });

  // Unread contact messages
  const unreadMessages = await prisma.contactMessage.count({
    where: {
      isRead: false,
      senderRole: "TENANT",   // only messages sent by tenants, not admin replies
      tenant: { tenantProfile: { unit: { property: { adminId } } } },
    },
  });

  return NextResponse.json({
    pendingContracts,
    recentPayments,
    unreadMessages,
  });
}