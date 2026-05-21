import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Ensure unit belongs to admin's property
  const unit = await prisma.unit.findFirst({
    where: { id, property: { adminId: session.user.id } },
  });
  if (!unit)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.unit.delete({ where: { id } });

  return NextResponse.json({ success: true });
}