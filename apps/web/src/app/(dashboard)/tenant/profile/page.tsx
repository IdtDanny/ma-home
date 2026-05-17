import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TenantProfileCard from "@/components/TenantProfileCard";

export default async function TenantProfilePage() {
  const session = await auth();
  if (!session || session.user.role !== "TENANT") redirect("/login");

  const tenant = await prisma.tenant.findFirst({
    where: { userId: session.user.id },
    include: {
      unit: {
        include: {
          property: true,
        },
      },
      user: true,
      bills: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!tenant) return <p className="p-6">No tenant profile found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-300 mb-6">My Profile</h1>
      <TenantProfileCard tenant={tenant} />
    </div>
  );
}