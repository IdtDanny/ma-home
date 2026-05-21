import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TenantsTable from "@/components/admin/TenantsTable"; // reuse

export default async function AllTenantsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/login");

  const tenants = await prisma.tenant.findMany({
    include: {
      user: true,
      unit: { include: { property: true } },
      bills: { orderBy: { createdAt: "desc" }, take: 5 },
      occupants: true,
      contracts: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Tenants</h1>
      <TenantsTable tenants={tenants} contractBasePath="/super-admin/contracts" />
    </div>
  );
}