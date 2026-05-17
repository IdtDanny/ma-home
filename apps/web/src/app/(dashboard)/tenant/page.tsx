import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TenantBillsList from "@/components/TenantBillsList";
import TenantContractCard from "@/components/dashboard/TenantContractCard";

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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-300">Dashboard</h1>
      <TenantContractCard
        unit={tenant.unit}
        rentAmount={tenant.rentAmount}
        startDate={tenant.startDate}
        isActive={tenant.isActive}
      />
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Bills</h2>
        <TenantBillsList bills={tenant.bills} />
      </div>
    </div>
  );
}