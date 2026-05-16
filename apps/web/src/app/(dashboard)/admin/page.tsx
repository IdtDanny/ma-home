import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/StatCard";
import AdminRegistrationForm from "@/components/dashboard/AdminRegistrationForm";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") redirect("/login");

  const totalCollected = await prisma.payment.aggregate({ where: { status: "SUCCESSFUL" }, _sum: { amount: true } });
  const pending = await prisma.payment.count({ where: { status: "PENDING" } });
  const units = await prisma.unit.findMany({
    where: { property: { adminId: session.user.id } },
    include: { property: true },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Collected" value={totalCollected._sum.amount || 0} icon="💰" color="bg-green-100 text-green-600" />
        <StatCard title="Pending Payments" value={pending} icon="⏳" color="bg-yellow-100 text-yellow-600" />
      </div>
      <AdminRegistrationForm units={units} />
    </div>
  );
}