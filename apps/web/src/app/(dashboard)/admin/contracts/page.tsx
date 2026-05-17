import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContractsTabs from "@/components/admin/ContractsTabs";

export default async function AdminContractsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  // Fetch all contracts for tenants in admin's properties
  const contracts = await prisma.contract.findMany({
    where: {
      tenant: { unit: { property: { adminId: session.user.id } } },
    },
    include: {
      tenant: {
        include: {
          user: { select: { name: true, email: true } },
          unit: { include: { property: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Contract Management
      </h1>
      <ContractsTabs contracts={contracts} />
    </div>
  );
}