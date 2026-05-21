import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/login");

  const [landlordCount, tenantCount, propertyCount, pendingOnboarding] = await Promise.all([
    prisma.user.count({ where: { role: "LANDLORD" } }),
    prisma.user.count({ where: { role: "TENANT" } }),
    prisma.property.count(),
    prisma.onboardingRequest.count(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>Landlords</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{landlordCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Tenants</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{tenantCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Properties</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{propertyCount}</p></CardContent>
        </Card>
        <Link href="/super-admin/onboarding">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader><CardTitle>Onboarding Requests</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{pendingOnboarding}</p></CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}