import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const cert = await prisma.clearanceCertificate.findUnique({ where: { id } });
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.clearanceCertificate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}