"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  PenTool,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING_TENANT_SIGNATURE: {
    label: "Pending Tenant",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  },
  PENDING_LANDLORD_SIGNATURE: {
    label: "Pending Landlord",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  ACTIVE: {
    label: "Active",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  EXPIRED: {
    label: "Expired",
    color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  TERMINATED: {
    label: "Terminated",
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
};

export default function ContractsTable({ contracts: initialContracts }: { contracts: any[] }) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const pageSize = isMobile ? 5 : 20;

  const [contracts, setContracts] = useState(initialContracts);
  const [viewContract, setViewContract] = useState<any>(null);
  const [signContract, setSignContract] = useState<any>(null);
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Search & Pagination State ───────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleTerminate = async (id: string) => {
    if (!confirm("Terminate this contract?")) return;
    const res = await fetch(`/api/contracts/${id}/terminate`, { method: "POST" });
    if (res.ok) {
      setContracts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "TERMINATED" } : c))
      );
      toast.success("Contract terminated.");
    } else {
      toast.error("Failed to terminate.");
    }
  };

  const handleLandlordSign = async () => {
    if (!signContract || !signature.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/contracts/${signContract.id}/landlord-sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature }),
    });
    if (res.ok) {
      setContracts((prev) =>
        prev.map((c) =>
          c.id === signContract.id ? { ...c, status: "ACTIVE" } : c
        )
      );
      toast.success("Contract signed and activated.");
      setSignContract(null);
      setSignature("");
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Signing failed");
    }
    setLoading(false);
  };

  // ── Filter & Paginate ────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const filteredContracts = contracts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.tenant.user.name.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredContracts.length / pageSize);
  const paginatedContracts = filteredContracts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const Pagination = () => (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {filteredContracts.length === 0
          ? "0 results"
          : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
              currentPage * pageSize,
              filteredContracts.length
            )} of ${filteredContracts.length}`}
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
    <>
      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by tenant name…"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 w-full sm:w-64"
        />
      </div>

      {/* ── Desktop: Table ──────────────────────────────────────── */}
      <div className="hidden md:block overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {paginatedContracts.map((contract) => (
                <motion.tr
                  key={contract.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b dark:border-gray-800"
                >
                  <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                    {contract.tenant.user.name}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {contract.tenant.unit.property.name}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {contract.monthlyRent.toLocaleString()} RWF
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {new Date(contract.startDate).toLocaleDateString()} –{" "}
                    {new Date(contract.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig[contract.status]?.color || ""}>
                      {statusConfig[contract.status]?.label || contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewContract(contract)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {contract.status === "PENDING_LANDLORD_SIGNATURE" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSignContract(contract)}
                          title="Sign"
                        >
                          <PenTool className="h-4 w-4" />
                        </Button>
                      )}
                      {(contract.status === "ACTIVE" ||
                        contract.status === "PENDING_LANDLORD_SIGNATURE") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTerminate(contract.id)}
                          title="Terminate"
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
        <Pagination />
      </div>

      {/* ── Mobile: Cards ──────────────────────────────────────── */}
      <div className="md:hidden space-y-4">
        {paginatedContracts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No contracts found.</p>
        ) : (
          paginatedContracts.map((contract) => (
            <motion.div key={contract.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="flex flex-row justify-between">
                  <div>
                    <CardTitle className="text-base text-gray-800 dark:text-gray-200">
                      {contract.tenant.user.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {contract.tenant.unit.property.name}
                    </p>
                  </div>
                  <Badge className={statusConfig[contract.status]?.color}>
                    {statusConfig[contract.status]?.label}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {contract.monthlyRent.toLocaleString()} RWF
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(contract.startDate).toLocaleDateString()} –{" "}
                        {new Date(contract.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewContract(contract)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {contract.status === "PENDING_LANDLORD_SIGNATURE" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSignContract(contract)}
                        >
                          <PenTool className="h-4 w-4" />
                        </Button>
                      )}
                      {(contract.status === "ACTIVE" ||
                        contract.status === "PENDING_LANDLORD_SIGNATURE") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTerminate(contract.id)}
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
        <Pagination />
      </div>

      {/* View dialog */}
      <Dialog open={!!viewContract} onOpenChange={(open) => !open && setViewContract(null)}>
        <DialogContent className="max-w-2xl dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contract</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            {viewContract?.content || "No content"}
          </pre>
        </DialogContent>
      </Dialog>

      {/* Sign dialog */}
      <Dialog open={!!signContract} onOpenChange={(open) => !open && setSignContract(null)}>
        <DialogContent className="max-w-2xl dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sign as Landlord</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-60 overflow-y-auto">
            {signContract?.content || ""}
          </pre>
          <div className="space-y-2 mt-4">
            <Label>Type your full name to sign</Label>
            <Input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <Button
            onClick={handleLandlordSign}
            disabled={loading || !signature.trim()}
            className="w-full mt-2"
          >
            {loading ? "Signing..." : "Sign Contract"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}