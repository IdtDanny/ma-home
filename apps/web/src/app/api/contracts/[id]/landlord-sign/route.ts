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
    include: { tenant: { include: { user: true } } },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (contract.status !== "PENDING_LANDLORD_SIGNATURE")
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const body = await req.json();
  if (!body.signature) return NextResponse.json({ error: "Signature required" }, { status: 400 });

  await prisma.contract.update({
    where: { id },
    data: {
      status: "ACTIVE",
      landlordSignature: true,
      landlordSignedAt: new Date(),
    },
  });

  // Send email to tenant with contract text (optional)
  // await sendEmail(contract.tenant.user.email, "Your Rental Contract", contract.content);
  return NextResponse.json({ success: true });
}