import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function LandlordsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/login");

  const landlords = await prisma.user.findMany({
    where: { role: "LANDLORD" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Landlords</h1>
      <div className="space-y-4">
        {landlords.map((l) => (
          <div key={l.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
            <p className="font-semibold">{l.name}</p>
            <p className="text-sm text-gray-500">{l.email}</p>
            {l.phone && <p className="text-sm text-gray-500">{l.phone}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}