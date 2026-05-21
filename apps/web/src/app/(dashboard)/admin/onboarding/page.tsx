import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function OnboardingRequestsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD") redirect("/login");

  const requests = await prisma.onboardingRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Onboarding Requests</h1>
      <div className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-gray-500">No requests yet.</p>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
              <p className="font-semibold">{req.name} ({req.email})</p>
              {req.phone && <p className="text-sm text-gray-500">{req.phone}</p>}
              {req.message && <p className="text-sm mt-1">{req.message}</p>}
              <p className="text-xs text-gray-400 mt-2">{new Date(req.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}