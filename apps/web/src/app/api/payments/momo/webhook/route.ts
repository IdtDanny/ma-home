// app/api/payments/momo/webhook/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPaymentProvider } from "@/lib/payment/provider"
import crypto from "crypto"

export async function POST(req: Request) {
  // Validate signature if MoMo sends a signature header
  const body = await req.json()
  // In production, verify the request using a shared secret or certificate.

  const { externalId, status, amount } = body // MoMo payload fields

  if (!externalId) return NextResponse.json({ error: "Bad request" }, { status: 400 })

  const payment = await prisma.payment.findUnique({
    where: { id: externalId },
    include: { bill: true }
  })
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 })

  // Optional: verify amount matches
  if (Math.abs(payment.amount - parseFloat(amount)) > 0.01) {
    // Log discrepancy
  }

  let newStatus = payment.status
  if (status === "SUCCESSFUL") newStatus = "SUCCESSFUL"
  else if (status === "FAILED") newStatus = "FAILED"
  else if (status === "PENDING") newStatus = "PENDING"

  if (newStatus !== payment.status) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: newStatus, meta: body }
      }),
      prisma.bill.update({
        where: { id: payment.billId },
        data: {
          status: newStatus,
          paidAt: newStatus === "SUCCESSFUL" ? new Date() : null
        }
      })
    ])
  }

  return NextResponse.json({ success: true })
}