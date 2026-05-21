import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Building2,
  FileText,
  CreditCard,
  Zap,
  Droplets,
  Home,
  Wrench,
  UserCog,
} from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD") redirect("/login");

  // ── High‑level stats ────────────────────────────────
  const totalCollected = await prisma.payment.aggregate({
    where: { status: "SUCCESSFUL" },
    _sum: { amount: true },
  });

  const pendingBills = await prisma.bill.aggregate({
    where: {
      status: "PENDING",
      tenant: { unit: { property: { adminId: session.user.id } } },
    },
    _sum: { amount: true },
    _count: true,
  });

  const tenantCount = await prisma.tenant.count({
    where: { unit: { property: { adminId: session.user.id } } },
  });
  const propertyCount = await prisma.property.count({
    where: { adminId: session.user.id },
  });

  // ── Stats per bill type ──────────────────────────────
  const billTypeStats = await prisma.bill.groupBy({
    by: ["type"],
    where: {
      status: "PENDING",
      tenant: { unit: { property: { adminId: session.user.id } } },
    },
    _sum: { amount: true },
    _count: true,
  });

  const typeIcons: Record<string, React.ComponentType<any>> = {
    RENT: Home,
    ELECTRICITY: Zap,
    WATER: Droplets,
    CUSTOM: Wrench,
  };
  const typeColors: Record<string, string> = {
    RENT: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
    ELECTRICITY: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
    WATER: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400",
    CUSTOM: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400",
  };

  const quickLinks = [
    {
      title: "Tenants",
      desc: "Manage tenants",
      icon: Users,
      href: "/admin/tenants",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Properties",
      desc: "Properties & units",
      icon: Building2,
      href: "/admin/properties",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      title: "Bills",
      desc: "Bills & payments",
      icon: FileText,
      href: "/admin/bills",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950",
    },
    {
      title: "Contracts",
      desc: "Rental agreements",
      icon: FileText,
      href: "/admin/contracts",
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950",
    },
    {
      title: "Profile",
      desc: "Admin profile",
      icon: UserCog,
      href: "/admin/profile",   // we'll build this page later
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-950",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Dashboard
      </h1>

      {/* ── Top stats row ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Collected"
          value={totalCollected._sum.amount || 0}
          icon="💰"
          color="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
        />
        <Link href="/admin/bills?status=PENDING" className="cursor-pointer">
          <StatCard
            title="Pending"
            value={pendingBills._sum.amount || 0}
            icon="⏳"
            color="bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400"
          />
        </Link>
        <StatCard
          title="Tenants"
          value={tenantCount}
          icon="👥"
          color="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Properties"
          value={propertyCount}
          icon="🏠"
          color="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* ── Bill type breakdown ────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Pending Bills by Type
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {billTypeStats.map((stat) => {
            const Icon = typeIcons[stat.type] || FileText;
            return (
              <Link
                key={stat.type}
                href={`/admin/bills?type=${stat.type}&status=PENDING`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-800">
                  <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${typeColors[stat.type] || "bg-gray-100"}`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {stat.type}
                      </p>
                      <p className="font-semibold text-base sm:text-lg">
                        {stat._sum.amount?.toLocaleString() || 0} RWF
                      </p>
                      <p className="text-xs text-gray-400">
                        {stat._count} unpaid
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          {billTypeStats.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-4">
              No pending bills
            </p>
          )}
        </div>
      </div>

      {/* ── Quick Links ────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="flex flex-row items-center gap-2 sm:gap-3 p-3 sm:p-4">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${link.bg}`}>
                    <link.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${link.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base">{link.title}</CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      {link.desc}
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