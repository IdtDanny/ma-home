import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  propertyId: z.string(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Ensure property belongs to admin
  const property = await prisma.property.findFirst({
    where: { id: parsed.data.propertyId, adminId: session.user.id },
  });
  if (!property)
    return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const unit = await prisma.unit.create({
    data: parsed.data,
    include: { property: true },
  });

  return NextResponse.json({ success: true, unit });
}