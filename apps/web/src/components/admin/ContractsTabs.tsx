"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ContractsTable from "./ContractsTable";

interface Contract {
  id: string;
  // … other fields
  status: string;
}

export default function ContractsTabs({ contracts }: { contracts: Contract[] }) {
  const [filter, setFilter] = useState("pending-landlord");

  const pendingLandlord = contracts.filter(c => c.status === "PENDING_LANDLORD_SIGNATURE");
  const pendingTenant = contracts.filter(c => c.status === "PENDING_TENANT_SIGNATURE");
  const active = contracts.filter(c => c.status === "ACTIVE");
  const expired = contracts.filter(c => c.status === "EXPIRED" || c.status === "TERMINATED");

  const filterOptions = [
    { value: "pending-landlord", label: `Pending My Signature (${pendingLandlord.length})` },
    { value: "pending-tenant", label: `Pending Tenant (${pendingTenant.length})` },
    { value: "active", label: `Active (${active.length})` },
    { value: "expired", label: `Expired/Terminated (${expired.length})` },
  ];

  return (
    <div>
      {/* ── Mobile: Dropdown Select ── */}
      <div className="md:hidden mb-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter contracts" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Desktop: Tabs ── */}
      <Tabs value={filter} onValueChange={setFilter} className="w-full hidden md:block">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending-landlord">
            Pending My Signature ({pendingLandlord.length})
          </TabsTrigger>
          <TabsTrigger value="pending-tenant">
            Pending Tenant ({pendingTenant.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({active.length})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expired/Terminated ({expired.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── Content (shown for both mobile and desktop) ── */}
      <div className="mt-4">
        {filter === "pending-landlord" && <ContractsTable contracts={pendingLandlord} />}
        {filter === "pending-tenant" && <ContractsTable contracts={pendingTenant} />}
        {filter === "active" && <ContractsTable contracts={active} />}
        {filter === "expired" && <ContractsTable contracts={expired} />}
      </div>
    </div>
  );
}