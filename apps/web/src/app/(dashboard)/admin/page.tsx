import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import StatPep from "@/components/StatPep";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, FileText, CreditCard } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") redirect("/login");

  const totalCollected = await prisma.payment.aggregate({
    where: { status: "SUCCESSFUL" },
    _sum: { amount: true },
  });
  const pendingPayments = await prisma.payment.count({ where: { status: "PENDING" } });
  const tenantCount = await prisma.tenant.count({
    where: { unit: { property: { adminId: session.user.id } } },
  });
  const propertyCount = await prisma.property.count({
    where: { adminId: session.user.id },
  });

  const quickLinks = [
    {
      title: "Tenants",
      description: "Manage all your tenants",
      icon: Users,
      href: "/admin/tenants",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Properties",
      description: "Add or edit properties & units",
      icon: Building2,
      href: "/admin/properties",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      title: "Bills",
      description: "View and manage bills",
      icon: FileText,
      href: "/admin/bills",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950",
    },
    {
      title: "Contracts",
      description: "Manage rental agreements",
      icon: FileText,
      href: "/admin/contracts",
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Collected"
          value={totalCollected._sum.amount || 0}
          icon="💰"
          color="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
        />
        <StatCard
          title="Pending Payments"
          value={pendingPayments}
          icon="⏳"
          color="bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400"
        />
        <StatPep
          title="Total Tenants"
          value={tenantCount}
          icon="👥"
          color="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
        />
        <StatPep
          title="Properties"
          value={propertyCount}
          icon="🏠"
          color="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <div className={`p-2 rounded-lg ${link.bg}`}>
                    <link.icon className={`h-6 w-6 ${link.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{link.title}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {link.description}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}