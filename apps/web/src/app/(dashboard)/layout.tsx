// import { auth } from "@/lib/auth";
// import { redirect } from "next/navigation";
// import Sidebar from "@/components/Sidebar";
// import DashboardHeader from "@/components/DashboardHeader"; // 👈 import

// export default async function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const session = await auth();
//   if (!session) redirect("/login");
//   const role = session.user.role as "ADMIN" | "TENANT";

//   return (
//     <div className="flex min-h-screen">
//       <Sidebar role={role} />
//       <div className="flex-1 flex flex-col">
//         <DashboardHeader />   {/* 👈 Header with logout */}
//         <main className="flex-1 bg-gray-50 p-4 md:p-6 pt-16 md:pt-6 overflow-auto">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }


import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
        <main className="flex-1 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 md:p-6">
        {/* <main className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 md:p-6"> */}
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      {/* <main className="flex-1 bg-gray-50/50 p-4 md:p-6">{children}</main> */}
      <Footer />
    </div>
  );
}