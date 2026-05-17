import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TenantsTable from "@/components/admin/TenantsTable";
import AddTenantDialog from "@/components/admin/AddTenantDialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default async function AdminTenantsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const tenants = await prisma.tenant.findMany({
    where: { unit: { property: { adminId: session.user.id } } },
    include: {
      user: true,
      unit: { include: { property: true } },
      bills: { orderBy: { createdAt: "desc" }, take: 5 },
      occupants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch units for the form dropdown
  const units = await prisma.unit.findMany({
    where: { property: { adminId: session.user.id } },
    include: { property: true },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Manage Tenants
        </h1>
        <div className="flex gap-2">
          <Link href="/admin/past-tenants">
            <Button>
              <Eye className="mr-0 h-4 w-4" /> 
                <span className="sr-only sm:not-sr-only">View Past Tenants</span>
            </Button>
            {/* <Button variant="outline" size="sm">
              View Past Tenants
            </Button> */}
          </Link>
          <AddTenantDialog units={units} />
        </div>
      </div>
      <TenantsTable tenants={tenants} />
    </div>
  );
}