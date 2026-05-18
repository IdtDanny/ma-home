import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MessagesList from "@/components/admin/MessagesList";

export default async function AdminMessagesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const messages = await prisma.contactMessage.findMany({
    where: {
      tenant: {
        tenantProfile: {
          unit: { property: { adminId: session.user.id } },
        },
      },
    },
    include: {
      tenant: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Messages from Tenants
      </h1>
      <MessagesList initialMessages={messages} />
    </div>
  );
}