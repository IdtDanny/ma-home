import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader"; // 👈 import

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  const role = session.user.role as "ADMIN" | "TENANT";

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />   {/* 👈 Header with logout */}
        <main className="flex-1 bg-gray-50 p-4 md:p-6 pt-16 md:pt-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}