import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PendingContractsList from "@/components/admin/PendingContractsList";

export default async function PendingContractsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const contracts = await prisma.contract.findMany({
    where: {
      status: "PENDING_LANDLORD_SIGNATURE",
      tenant: { 
        unit: { 
          property: { adminId: session.user.id } 
        } 
      },
    },
    include: { 
      tenant: { 
        include: { 
          user: true, 
          unit: { include: { property: true } }, 
        } 
      } 
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Pending Contracts for Your Signature</h1>
      <PendingContractsList contracts={contracts} />
    </div>
  );
}