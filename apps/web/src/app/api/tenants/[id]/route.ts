import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  rentAmount: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Verify tenant belongs to admin's property
  const tenant = await prisma.tenant.findFirst({
    where: {
      id,
      unit: { property: { adminId: session.user.id } },
    },
  });
  if (!tenant)
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const { name, email, phone, rentAmount, isActive } = parsed.data;

  // Update user table and tenant table in a transaction
  await prisma.$transaction(async (tx) => {
    if (name || email || phone) {
      await tx.user.update({
        where: { id: tenant.userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(phone && { phone }),
        },
      });
    }
    if (rentAmount !== undefined || isActive !== undefined) {
      await tx.tenant.update({
        where: { id },
        data: {
          ...(rentAmount !== undefined && { rentAmount }),
          ...(isActive !== undefined && { isActive }),
        },
      });
    }
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Ensure admin owns this tenant
  const tenant = await prisma.tenant.findFirst({
    where: {
      id,
      unit: { property: { adminId: session.user.id } },
    },
  });
  if (!tenant)
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  // Delete the user and tenant (cascades will handle bills, payments, etc.)
  await prisma.user.delete({ where: { id: tenant.userId } });

  return NextResponse.json({ success: true });
}