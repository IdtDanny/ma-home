import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  password: z.string().min(6),
  unitId: z.string(),
  rentAmount: z.number().positive(),
  nationalId: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  numberOfOccupants: z.number().int().positive().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // Convert empty strings to undefined for optional fields
    const data = {
      ...body,
      nationalId: body.nationalId || undefined,
      emergencyContactName: body.emergencyContactName || undefined,
      emergencyContactPhone: body.emergencyContactPhone || undefined,
      numberOfOccupants: body.numberOfOccupants ? Number(body.numberOfOccupants) : undefined,
    };

    const parsed = createSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      password,
      unitId,
      rentAmount,
      nationalId,
      emergencyContactName,
      emergencyContactPhone,
      numberOfOccupants,
    } = parsed.data;

    const unit = await prisma.unit.findFirst({
      where: { id: unitId, property: { adminId: session.user.id } },
    });
    if (!unit)
      return NextResponse.json({ error: "Invalid unit" }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "TENANT",
        tenantProfile: {
          create: {
            unitId,
            rentAmount,
            startDate: new Date(),
            nationalId,
            emergencyContactName,
            emergencyContactPhone,
            numberOfOccupants,
          },
        },
      },
      include: { tenantProfile: true },
    });

    return NextResponse.json({ success: true, tenantId: user.tenantProfile?.id });
  } catch (error: any) {
    // Handle duplicate email error (Prisma P2002)
    if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 400 }
      );
    }
    console.error("Tenant creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}