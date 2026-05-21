import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  const userId = session.user.id;

  if (role === "LANDLORD") {
    const adminId = userId;

    const [pendingContracts, unreadMessages, recentPayments] = await Promise.all([
      prisma.contract.count({
        where: {
          status: "PENDING_LANDLORD_SIGNATURE",
          tenant: { unit: { property: { adminId } } },
        },
      }),
      prisma.contactMessage.count({
        where: {
          isRead: false,
          senderRole: "TENANT",
          tenant: { tenantProfile: { unit: { property: { adminId } } } },
        },
      }),
      prisma.payment.count({
        where: {
          status: "SUCCESSFUL",
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          bill: { tenant: { unit: { property: { adminId } } } },
        },
      }),
    ]);

    const items = [];
    if (pendingContracts > 0) {
      items.push({
        type: "contract",
        message: `${pendingContracts} contract(s) waiting for your signature`,
        link: "/admin/contracts",
      });
    }
    if (unreadMessages > 0) {
      items.push({
        type: "message",
        message: `${unreadMessages} new message(s) from tenants`,
        link: "/admin/messages",
      });
    }
    if (recentPayments > 0) {
      items.push({
        type: "payment",
        message: `${recentPayments} payment(s) received today`,
        link: "/admin/bills?status=SUCCESSFUL",
      });
    }
    return NextResponse.json({ items });
  }

  if (role === "TENANT") {
    const tenant = await prisma.tenant.findUnique({
      where: { userId },
      select: { id: true, lastAnnouncementReadAt: true },
    });
    if (!tenant) return NextResponse.json({ items: [] });

    const [unreadReplies, pendingContract, dueBills] = await Promise.all([
      prisma.contactMessage.count({
        where: {
          tenantId: userId,
          senderRole: "LANDLORD",
          isRead: false,
        },
      }),
      prisma.contract.findFirst({
        where: {
          tenantId: tenant.id,
          status: "PENDING_TENANT_SIGNATURE",
        },
        select: { id: true },
      }),
      prisma.bill.count({
        where: {
          tenantId: tenant.id,
          status: "PENDING",
          dueDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    // ── NEW: Count unread announcements ──────────────────
    const lastRead = tenant.lastAnnouncementReadAt ?? new Date(0);
    const unreadAnnouncements = await prisma.announcement.count({
      where: { createdAt: { gt: lastRead } },
    });

    const items: { type: string; message: string; link: string }[] = [];
    if (unreadReplies > 0) {
      items.push({
        type: "message",
        message: `${unreadReplies} new reply from landlord`,
        link: "/tenant/contact",
      });
    }
    if (pendingContract) {
      items.push({
        type: "contract",
        message: "You have a contract to sign",
        link: "/tenant/contract",
      });
    }
    if (dueBills > 0) {
      items.push({
        type: "bill",
        message: `${dueBills} bill(s) due within 7 days`,
        link: "/tenant/bills",
      });
    }
    if (unreadAnnouncements > 0) {
      items.push({
        type: "announcement",
        message: `${unreadAnnouncements} new announcement(s)`,
        link: "/tenant/announcements",
      });
    }

    return NextResponse.json({ items });
  }

  return NextResponse.json({ items: [] });
}