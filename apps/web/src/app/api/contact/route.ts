import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  subject: z.string(),
  message: z.string(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await prisma.contactMessage.create({
    data: {
      subject: parsed.data.subject,
      message: parsed.data.message,
      tenantId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}