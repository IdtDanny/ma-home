import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TenantProfileCard from "@/components/dashboard/TenantProfileCard";

export default async function TenantProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT") redirect("/login");

  const tenant = await prisma.tenant.findFirst({
    where: { userId: session.user.id },
    include: {
      unit: { include: { property: true } },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
      bills: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!tenant) return <p className="p-6">Tenant profile not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        My Profile
      </h1>
      <TenantProfileCard tenant={tenant} />
    </div>
  );
}