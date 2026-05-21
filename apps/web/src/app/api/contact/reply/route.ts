import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  parentId: z.string(),
  message: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Find the parent message and ensure the admin owns it
  const parent = await prisma.contactMessage.findUnique({
    where: { id: parsed.data.parentId },
    include: { tenant: true },
  });
  if (!parent)
    return NextResponse.json({ error: "Parent message not found" }, { status: 404 });

  // Create reply
  await prisma.contactMessage.create({
    data: {
      subject: parent.subject, // same subject for continuity
      message: parsed.data.message,
      tenantId: parent.tenantId, // keep same tenant relation
      parentId: parent.id,
      senderRole: "ADMIN",
    },
  });

  // Mark parent as read (optional, but admin has read it)
  await prisma.contactMessage.update({
    where: { id: parent.id },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}