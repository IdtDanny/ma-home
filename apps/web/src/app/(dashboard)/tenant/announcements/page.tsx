import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AnnouncementsClient from "@/components/tenant/AnnouncementsClient";

export default async function TenantAnnouncementsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT") redirect("/login");

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Announcements
      </h1>
      <AnnouncementsClient />
    </div>
  );
}