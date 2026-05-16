// app/api/payments/momo/status/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPaymentProvider } from "@/lib/payment/provider"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const paymentId = searchParams.get("paymentId")
  if (!paymentId) return NextResponse.json({ error: "Missing paymentId" }, { status: 400 })

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (payment.status === "SUCCESSFUL" || payment.status === "FAILED") {
    return NextResponse.json({ status: payment.status })
  }

  // Poll from MoMo (if transactionId exists)
  const provider = getPaymentProvider(payment.method)
  const result = await provider.getTransactionStatus(payment.id)
  // Update DB if status changed (similar to webhook logic)
  // ...
  return NextResponse.json({ status: result.status })
}