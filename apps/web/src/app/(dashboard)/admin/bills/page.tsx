import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BillsView from "@/components/admin/BillsView";

export default async function AdminBillsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD") redirect("/login");

  const { status, type } = await searchParams;

  const whereClause: any = {
    tenant: { unit: { property: { adminId: session.user.id } } },
  };

  if (status && status !== "ALL") {
    whereClause.status = status;
  }
  if (type && type !== "ALL") {
    whereClause.type = type;
  }

  const bills = await prisma.bill.findMany({
    where: whereClause,
    include: {
      tenant: {
        include: {
          user: { select: { name: true } },
          unit: { include: { property: { select: { name: true } } } },
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Aggregate counts for filter tabs
  const counts = {
    ALL: await prisma.bill.count({ where: { tenant: { unit: { property: { adminId: session.user.id } } } } }),
    PENDING: await prisma.bill.count({ where: { ...whereClause, status: "PENDING" } }),
    SUCCESSFUL: await prisma.bill.count({ where: { ...whereClause, status: "SUCCESSFUL", type: type || undefined } }),
    FAILED: await prisma.bill.count({ where: { ...whereClause, status: "FAILED", type: type || undefined } }),
    EXPIRED: await prisma.bill.count({ where: { ...whereClause, status: "EXPIRED", type: type || undefined } }),
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Bill Management
      </h1>
      <BillsView
        bills={JSON.parse(JSON.stringify(bills))}
        currentStatus={status || "ALL"}
        currentType={type || "ALL"}
        counts={counts}
      />
    </div>
  );
}