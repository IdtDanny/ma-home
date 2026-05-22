import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LandlordProfileCard from "@/components/admin/LandlordProfileCard";

export default async function LandlordProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      adminProperties: {
        include: { units: true },
      },
    },
  });

  // const user = await prisma.user.findUnique({
  //   where: { id: session.user.id },
  //   include: {
  //     adminProperties: { include: { units: true } },
  //   },
  // });

  if (!user) return <p>User not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        My Profile
      </h1>
      <LandlordProfileCard user={user} />
    </div>
  );
}