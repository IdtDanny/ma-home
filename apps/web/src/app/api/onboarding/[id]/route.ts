import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Ensure the request exists
  const request = await prisma.onboardingRequest.findUnique({ where: { id } });
  if (!request)
    return NextResponse.json({ error: "Request not found" }, { status: 404 });

  await prisma.onboardingRequest.delete({ where: { id } });

  return NextResponse.json({ success: true });
}