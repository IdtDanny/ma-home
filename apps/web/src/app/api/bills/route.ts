import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const billSchema = z.object({
  tenantId: z.string(),
  type: z.enum(["RENT", "ELECTRICITY", "WATER", "CUSTOM"]),
  amount: z.number().positive(),
  period: z.string(),
  dueDate: z.string().datetime(), // or z.date()
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = billSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Ensure tenant belongs to admin's property
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: parsed.data.tenantId,
      unit: { property: { adminId: session.user.id } },
    },
    include: { unit: true },
  });
  if (!tenant)
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const bill = await prisma.bill.create({
    data: {
      tenantId: parsed.data.tenantId,
      unitId: tenant.unitId,
      type: parsed.data.type,
      amount: parsed.data.amount,
      period: parsed.data.period,
      dueDate: new Date(parsed.data.dueDate),
    },
  });

  return NextResponse.json({ success: true, bill });
}