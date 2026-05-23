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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import BillsTable from "./BillsTable";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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
  basePath = "/admin/bills",
}: BillsViewProps) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const pageSize = isMobile ? 5 : 20;

  const [status, setStatus] = useState(currentStatus);
  const [type, setType] = useState(currentType);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const updateFilters = (newStatus?: string, newType?: string) => {
    const params = new URLSearchParams();
    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    if (newType && newType !== "ALL") params.set("type", newType);
    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
  };

  // Filter by search query
  const filteredBills = bills.filter((bill) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      bill.tenant.user.name.toLowerCase().includes(q) ||
      bill.type.toLowerCase().includes(q) ||
      bill.period.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredBills.length / pageSize);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const Pagination = () => (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {filteredBills.length === 0
          ? "0 results"
          : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
              currentPage * pageSize,
              filteredBills.length
            )} of ${filteredBills.length}`}
      </p>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(page)}
            className="hidden md:inline-flex"
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          {/* Status filter */}
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              updateFilters(v, type);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
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

          {/* Type filter */}
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v);
              updateFilters(status, v);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
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

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tenant, type, period…"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>

      {/* Bills table with pagination */}
      <BillsTable bills={paginatedBills} />
      <Pagination />
    </div>
  );
}