import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const createTenantSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  password: z.string().min(6),
  unitId: z.string(),
  rentAmount: z.number().positive(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createTenantSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const { name, email, phone, password, unitId, rentAmount } = parsed.data

  // Ensure unit exists and belongs to admin's property
  const unit = await prisma.unit.findFirst({
    where: {
      id: unitId,
      property: { adminId: session.user.id }
    }
  })
  if (!unit) return NextResponse.json({ error: "Invalid unit" }, { status: 400 })

  const passwordHash = await bcrypt.hash(password, 12)

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
          startDate: new Date()
        }
      }
    }
  })

  return NextResponse.json({ success: true, tenantId: user.tenantProfile?.id })
}