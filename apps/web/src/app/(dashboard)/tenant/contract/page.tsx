import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TenantContractCard from "@/components/dashboard/TenantContractCard";

export default async function TenantContractPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT") redirect("/login");

  const tenant = await prisma.tenant.findFirst({
    where: { userId: session.user.id },
    include: {
      user: true,
      unit: { include: { property: true } },
      contracts: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!tenant) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Tenant profile not found.</p>
      </div>
    );
  }

  const activeContract = tenant.contracts[0] || null;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        My Contract
      </h1>
      {activeContract ? (
        <TenantContractCard contract={activeContract} tenant={tenant} />
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No active contract found.</p>
        </div>
      )}
    </div>
  );
}