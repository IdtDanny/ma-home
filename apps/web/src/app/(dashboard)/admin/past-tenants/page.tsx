import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PastTenantsList from "@/components/admin/PastTenantsList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PastTenantsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD") redirect("/login");

  const certificates = await prisma.clearanceCertificate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/tenants">
          <Button variant="ghost" size="sm">
            ← Back to Tenants
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Past Tenants / Clearance Certificates</h1>
      </div>
      <PastTenantsList certificates={certificates} />
    </div>
  );
}