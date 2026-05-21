import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BillsView from "@/components/admin/BillsView";   // reuse existing component

export default async function SuperAdminBillsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/login");

  // Fetch ALL bills without landlord filter
  const bills = await prisma.bill.findMany({
    include: {
      tenant: {
        include: {
          user: { select: { name: true } },
          unit: { include: { property: { select: { name: true } } } },
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // For the filter tabs we need counts – just pass the whole list
  const counts = {
    ALL: bills.length,
    PENDING: bills.filter((b) => b.status === "PENDING").length,
    SUCCESSFUL: bills.filter((b) => b.status === "SUCCESSFUL").length,
    FAILED: bills.filter((b) => b.status === "FAILED").length,
    EXPIRED: bills.filter((b) => b.status === "EXPIRED").length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Bills</h1>
      <BillsView
        bills={JSON.parse(JSON.stringify(bills))}
        currentStatus="ALL"
        currentType="ALL"
        counts={counts}
        basePath="/super-admin/bills"
      />
    </div>
  );
}