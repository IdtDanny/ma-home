import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  // Verify secret token
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const now = new Date()
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 10) // 10th of the month

  const activeTenants = await prisma.tenant.findMany({
    where: { isActive: true },
    include: { user: true }
  })

  for (const tenant of activeTenants) {
    // Check if rent bill already exists for this period
    const existing = await prisma.bill.findFirst({
      where: {
        tenantId: tenant.id,
        type: "RENT",
        period
      }
    })
    if (!existing) {
      await prisma.bill.create({
        data: {
          tenantId: tenant.id,
          unitId: tenant.unitId,
          type: "RENT",
          amount: tenant.rentAmount,
          period,
          dueDate,
          status: "PENDING"
        }
      })
    }
  }

  return NextResponse.json({ generated: true })
}