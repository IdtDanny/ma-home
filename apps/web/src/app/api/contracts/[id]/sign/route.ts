import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "TENANT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const signature = body.signature as string | undefined;
  if (!signature || signature.trim().length === 0)
    return NextResponse.json({ error: "Signature required" }, { status: 400 });

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { tenant: true },
  });

  if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  if (contract.tenant.userId !== session.user.id)
    return NextResponse.json({ error: "Not your contract" }, { status: 403 });
  
  // ✅ Check for the new enum value
  if (contract.status !== "PENDING_TENANT_SIGNATURE")
    return NextResponse.json({ error: "Contract is not pending your signature" }, { status: 400 });

  await prisma.contract.update({
    where: { id },
    data: {
      tenantSignature: signature,
      tenantSignedAt: new Date(),
      status: "PENDING_LANDLORD_SIGNATURE", // next step
    },
  });

  return NextResponse.json({ success: true });
}