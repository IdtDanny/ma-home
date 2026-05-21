import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingList from "@/components/super-admin/OnboardingList";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/login");

  const requests = await prisma.onboardingRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Onboarding Requests</h1>
      <OnboardingList requests={requests} />
    </div>
  );
}