import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TenantBillsList from "@/components/TenantBillsList";
import ContractLifecycle from "@/components/dashboard/ContractLifecycle";

export default async function TenantDashboard() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "TENANT") redirect("/login");

  const tenant = await prisma.tenant.findFirst({
    where: { userId: session.user.id },
    include: {
      bills: { orderBy: { dueDate: "asc" } },
      unit: { include: { property: true } },
    },
  });

  if (!tenant) return <p>No tenant profile found.</p>;

  // Latest contract (active or pending) for display in contract card
  const latestContract = await prisma.contract.findFirst({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Dashboard
      </h1>
      {/* show pending contract if exists */}
      <ContractLifecycle contract={latestContract} tenant={tenant} />
      {/* <PendingContract contract={pendingContract} /> */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Your Bills
        </h2>
        <TenantBillsList bills={tenant.bills} />
      </div>
    </div>
  );
}