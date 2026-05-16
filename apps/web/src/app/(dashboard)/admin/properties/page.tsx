import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PropertyList from "@/components/admin/PropertyList";

export default async function AdminPropertiesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const properties = await prisma.property.findMany({
    where: { adminId: session.user.id },
    include: { units: true },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Properties</h1>
      <PropertyList initialProperties={properties} />
    </div>
  );
}