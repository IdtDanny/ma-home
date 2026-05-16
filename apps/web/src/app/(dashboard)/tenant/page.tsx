// src/app/(dashboard)/tenant/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TenantBillsList from "@/components/TenantBillsList";

export default async function TenantDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "TENANT") redirect("/login");

  const tenant = await prisma.tenant.findFirst({
    where: { userId: session.user.id },
    include: {
      bills: { orderBy: { dueDate: "asc" } },
      unit: { include: { property: true } },
    },
  });

  if (!tenant) return <p>No tenant profile found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Welcome, {session.user.name}
      </h1>
      <p className="text-gray-500 mb-6">
        {tenant.unit.property.name} – {tenant.unit.name}
      </p>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Bills</h2>
        <TenantBillsList bills={tenant.bills} />
      </div>
    </div>
  );
}