"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import ContractRow from "@/components/admin/ContractRow"; // we'll create this

interface Contract {
  id: string;
  content: string | null;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  status: string;
  tenant: {
    user: { name: string; email: string };
    unit: { property: { name: string } };
  };
}

export default function ContractsTabs({ contracts }: { contracts: Contract[] }) {
  const [activeTab, setActiveTab] = useState("pending-landlord");

  const pendingLandlord = contracts.filter(c => c.status === "PENDING_LANDLORD_SIGNATURE");
  const pendingTenant = contracts.filter(c => c.status === "PENDING_TENANT_SIGNATURE");
  const active = contracts.filter(c => c.status === "ACTIVE");
  const expired = contracts.filter(c => c.status === "EXPIRED" || c.status === "TERMINATED");

  return (
    <Tabs defaultValue="pending-landlord" onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="pending-landlord">
          Pending My Signature ({pendingLandlord.length})
        </TabsTrigger>
        <TabsTrigger value="pending-tenant">
          Pending Tenant ({pendingTenant.length})
        </TabsTrigger>
        <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
        <TabsTrigger value="expired">Expired/Terminated ({expired.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="pending-landlord" className="mt-4">
        <ContractList contracts={pendingLandlord} emptyMessage="No contracts waiting for your signature." />
      </TabsContent>
      <TabsContent value="pending-tenant" className="mt-4">
        <ContractList contracts={pendingTenant} emptyMessage="No contracts pending tenant signature." />
      </TabsContent>
      <TabsContent value="active" className="mt-4">
        <ContractList contracts={active} emptyMessage="No active contracts." />
      </TabsContent>
      <TabsContent value="expired" className="mt-4">
        <ContractList contracts={expired} emptyMessage="No expired contracts." />
      </TabsContent>
    </Tabs>
  );
}

function ContractList({ contracts, emptyMessage }: { contracts: Contract[]; emptyMessage: string }) {
  if (contracts.length === 0) {
    return <p className="text-center text-gray-500 py-8">{emptyMessage}</p>;
  }
  return (
    <div className="space-y-3">
      {contracts.map((c) => (
        <ContractRow key={c.id} contract={c} />
      ))}
    </div>
  );
}