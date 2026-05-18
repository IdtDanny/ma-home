import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TenantContractCard from "@/components/dashboard/TenantContractCard";
// import type { Contract as PrismaContract } from "@prisma/client"; // or from generated client

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

  const activeContract = tenant.contracts[0] ?? null;

  // Helper to cast Prisma's JsonValue to the expected utilities object
  const contractForComponent = activeContract
    ? {
        ...activeContract,
        utilities: activeContract.utilities as Record<string, string> | null,
      }
    : null;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        My Contract
      </h1>
      {contractForComponent ? (
        <TenantContractCard contract={contractForComponent} tenant={tenant} />
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No active contract found.</p>
        </div>
      )}
    </div>
  );
}