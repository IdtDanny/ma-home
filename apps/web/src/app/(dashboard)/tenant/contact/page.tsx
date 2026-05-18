import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContactForm from "@/components/tenant/ContactForm";
import MessageThreadList from "@/components/tenant/MessageThreadList";

export default async function TenantContactPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT") redirect("/login");

  // Fetch all root messages sent by this tenant (no parentId)
  const threads = await prisma.contactMessage.findMany({
    where: {
      tenantId: session.user.id,
      parentId: null, // only root messages
    },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Contact Your Landlord
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Send a message or view your previous conversations.
        </p>
        <ContactForm />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Messages</h2>
        {threads.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No messages yet.</p>
        ) : (
          <MessageThreadList threads={threads} />
        )}
      </div>
    </div>
  );
}