"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import BillsTable from "@/components/admin/BillsTable";

interface Bill {
  id: string;
  amount: number;
  period: string;
  dueDate: Date;
  status: string;
  type: string;
  tenant: {
    user: { name: string };
    unit: { property: { name: string }; name: string };
  };
  payment: any | null;
}

interface BillsViewProps {
  bills: Bill[];
  currentStatus: string;
  currentType: string;
  counts: Record<string, number>;
  basePath?: string;
}

const statusOptions = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESSFUL", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "EXPIRED", label: "Expired" },
];

const typeOptions = [
  { value: "ALL", label: "All Types" },
  { value: "RENT", label: "Rent" },
  { value: "ELECTRICITY", label: "Electricity" },
  { value: "WATER", label: "Water" },
  { value: "CUSTOM", label: "Custom" },
];

export default function BillsView({
  bills,
  currentStatus,
  currentType,
  counts,
  basePath = "/super-admin/bills",
}: BillsViewProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [type, setType] = useState(currentType);

  const updateFilters = (newStatus?: string, newType?: string) => {
    const params = new URLSearchParams();
    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    if (newType && newType !== "ALL") params.set("type", newType);
    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
    // router.push(`/admin/bills${query ? `?${query}` : ""}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Status filter */}
        <div className="flex-1">
          {/* Desktop tabs */}
          <Tabs
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              updateFilters(v, type);
            }}
            className="hidden md:block"
          >
            <TabsList className="grid w-full grid-cols-5">
              {statusOptions.map((opt) => (
                <TabsTrigger key={opt.value} value={opt.value}>
                  {opt.label} ({counts[opt.value] || 0})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {/* Mobile select */}
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              updateFilters(v, type);
            }}
          >
            <SelectTrigger className="w-full md:hidden">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label} ({counts[opt.value] || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type filter */}
        <div className="w-full sm:w-48">
          <Label className="block mb-1 text-xs sm:hidden">Type</Label>
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v);
              updateFilters(status, v);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bills table */}
      <BillsTable bills={bills} />
    </div>
  );
}