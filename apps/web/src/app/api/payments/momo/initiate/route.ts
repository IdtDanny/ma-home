// app/api/payments/momo/initiate/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPaymentProvider } from "@/lib/payment/provider"
import { z } from "zod"

const initiateSchema = z.object({
  billId: z.string()
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "TENANT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = initiateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const bill = await prisma.bill.findUnique({
    where: { id: parsed.data.billId },
    include: { tenant: { include: { user: true } } }
  })
  if (!bill || bill.status === "SUCCESSFUL" || bill.tenant.userId !== session.user.id)
    return NextResponse.json({ error: "Invalid bill" }, { status: 400 })

  // Create a payment record first (status PENDING)
  const payment = await prisma.payment.create({
    data: {
      billId: bill.id,
      amount: bill.amount,
      method: "MOMO",
      status: "PENDING"
    }
  })

  // Get tenant's phone
  const phone = bill.tenant.user.phone
  if (!phone) return NextResponse.json({ error: "Tenant phone missing" }, { status: 400 })

  const provider = getPaymentProvider("MOMO")
  const result = await provider.requestToPay({
    amount: bill.amount,
    currency: "RWF",
    externalId: payment.id,
    phone,
    payerNote: `Bill ${bill.type} - ${bill.period}`
  })

  if (result.success) {
    return NextResponse.json({ success: true, paymentId: payment.id, status: "PENDING" })
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" }
    })
    return NextResponse.json({ error: "Payment request failed" }, { status: 500 })
  }
}