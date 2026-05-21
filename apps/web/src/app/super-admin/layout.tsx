import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SuperAdminNavbar from "@/components/layout/SuperAdminNavbar";
import Footer from "@/components/layout/Footer";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <SuperAdminNavbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      <Footer />
    </div>
  );
}