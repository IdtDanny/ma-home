import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { tenant: { include: { unit: { include: { property: true } } } } },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (contract.tenant.unit.property.adminId !== session.user.id)
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  await prisma.contract.update({
    where: { id },
    data: { status: "TERMINATED" },
  });

  return NextResponse.json({ success: true });
}