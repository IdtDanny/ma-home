import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  tenantId: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  relation: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Verify tenant belongs to admin's property
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: parsed.data.tenantId,
      unit: { property: { adminId: session.user.id } },
    },
  });
  if (!tenant)
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const occupant = await prisma.occupant.create({
    data: parsed.data,
  });

  return NextResponse.json({ success: true, occupant });
}