import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await prisma.tenant.findFirst({
    where: { userId: session.user.id },
    include: {
      bills: {
        where: {
          status: "PENDING",
          dueDate: {
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // due within 7 days
          },
        },
      },
    },
  });

  if (!tenant) return NextResponse.json([]);

  const alerts = tenant.bills.map((bill) => ({
    id: bill.id,
    type: "bill_due",
    message: `${bill.type} of ${bill.amount} RWF due on ${new Date(bill.dueDate).toLocaleDateString()}`,
    date: new Date(bill.dueDate).toLocaleDateString(),
  }));

  return NextResponse.json(alerts);
}