"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PendingContract from "./PendingContract";
import TenantContractCard from "./TenantContractCard";

interface Contract {
  id: string;
  status: string;
  content?: string | null;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  // ... other fields as needed
}

interface Props {
  contract: Contract | null;
  tenant: any; // pass tenant data needed for TenantContractCard
}

export default function ContractLifecycle({ contract, tenant }: Props) {
  if (!contract) {
    return (
      <Card className="dark:bg-gray-900">
        <CardHeader>
          <CardTitle>Rental Contract</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">No contract assigned yet.</p>
        </CardContent>
      </Card>
    );
  }

  const statusMessages: Record<string, { title: string; color: string; message: string }> = {
    PENDING_TENANT_SIGNATURE: {
      title: "Action Required",
      color: "text-yellow-600 dark:text-yellow-400",
      message: "Please review and sign your rental agreement.",
    },
    PENDING_LANDLORD_SIGNATURE: {
      title: "In Progress",
      color: "text-blue-600 dark:text-blue-400",
      message: "You have signed. Waiting for landlord to finalize the agreement.",
    },
    ACTIVE: {
      title: "Active",
      color: "text-green-600 dark:text-green-400",
      message: "Your rental agreement is active.",
    },
    EXPIRED: {
      title: "Expired",
      color: "text-gray-600 dark:text-gray-400",
      message: "This agreement has expired.",
    },
    TERMINATED: {
      title: "Terminated",
      color: "text-red-600 dark:text-red-400",
      message: "This agreement has been terminated.",
    },
  };

  const status = statusMessages[contract.status] || statusMessages.PENDING_TENANT_SIGNATURE;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Rental Contract</span>
            <Badge className={`ml-2 ${status.color}`}>
              {status.title}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">{status.message}</p>
        </CardHeader>
        <CardContent>
          {contract.status === "PENDING_TENANT_SIGNATURE" && (
            <PendingContract contract={contract} />
          )}
          {contract.status === "PENDING_LANDLORD_SIGNATURE" && (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">Awaiting landlord signature.</p>
            </div>
          )}
          {/* {contract.status === "ACTIVE" && (
            <TenantContractCard
              contract={contract}
              tenant={tenant}
              // unit={tenant.unit}
              // rentAmount={tenant.rentAmount}
              // startDate={tenant.startDate}
              // isActive={tenant.isActive}
            />
          )} */}
          {(contract.status === "EXPIRED" || contract.status === "TERMINATED") && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              This contract is no longer valid.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}