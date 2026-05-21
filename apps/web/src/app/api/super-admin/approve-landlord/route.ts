import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  requestId: z.string(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const request = await prisma.onboardingRequest.findUnique({ where: { id: parsed.data.requestId } });
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email: request.email } });
  if (existingUser) return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: request.name,
      email: request.email,
      phone: request.phone || "",
      passwordHash,
      role: "LANDLORD",
    },
  });

  // Delete the onboarding request
  await prisma.onboardingRequest.delete({ where: { id: request.id } });

  return NextResponse.json({ success: true });
}