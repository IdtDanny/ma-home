import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TenantBillsView from "@/components/tenant/TenantBillsView";

export default async function TenantBillsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT") redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!tenant) return <p className="p-6">Tenant profile not found.</p>;

  const bills = await prisma.bill.findMany({
    where: { tenantId: tenant.id },
    include: { payment: true },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    ALL: bills.length,
    PENDING: bills.filter((b) => b.status === "PENDING").length,
    SUCCESSFUL: bills.filter((b) => b.status === "SUCCESSFUL").length,
    FAILED: bills.filter((b) => b.status === "FAILED").length,
    EXPIRED: bills.filter((b) => b.status === "EXPIRED").length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        My Bills
      </h1>
      <TenantBillsView
        bills={JSON.parse(JSON.stringify(bills))}
        counts={counts}
      />
    </div>
  );
}