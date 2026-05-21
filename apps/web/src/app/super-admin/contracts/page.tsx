import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContractsTabs from "@/components/admin/ContractsTabs";   // reuse

export default async function SuperAdminContractsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/login");

  const contracts = await prisma.contract.findMany({
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Contracts</h1>
      <ContractsTabs contracts={JSON.parse(JSON.stringify(contracts))} />
    </div>
  );
}