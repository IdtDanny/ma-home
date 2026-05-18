import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await prisma.tenant.findUnique({
    where: { userId: session.user.id },
    select: { lastAnnouncementReadAt: true },
  });

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, role: true } } },
      },
    },
  });

  // Mark which announcements are unread
  const lastRead = tenant?.lastAnnouncementReadAt ?? new Date(0);
  const enriched = announcements.map((ann) => ({
    ...ann,
    isNew: new Date(ann.createdAt) > lastRead,
  }));

  return NextResponse.json(enriched);
}