"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, PenTool, XCircle, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING_TENANT_SIGNATURE: { label: "Pending Tenant", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  PENDING_LANDLORD_SIGNATURE: { label: "Pending Landlord", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  ACTIVE: { label: "Active", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  EXPIRED: { label: "Expired", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  TERMINATED: { label: "Terminated", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
};

export default function ContractsTable({ contracts: initialContracts }: { contracts: any[] }) {
  const router = useRouter();
  const [contracts, setContracts] = useState(initialContracts);
  const [viewContract, setViewContract] = useState<any>(null);
  const [signContract, setSignContract] = useState<any>(null);
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTerminate = async (id: string) => {
    if (!confirm("Terminate this contract?")) return;
    const res = await fetch(`/api/contracts/${id}/terminate`, { method: "POST" });
    if (res.ok) {
      setContracts(prev => prev.map(c => c.id === id ? { ...c, status: "TERMINATED" } : c));
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
      setContracts(prev => prev.map(c => c.id === signContract.id ? { ...c, status: "ACTIVE" } : c));
      toast.success("Contract signed and activated.");
      setSignContract(null);
      setSignature("");
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Signing failed");
    }
    setLoading(false);
  };

  return (
    <>
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
              {contracts.map((contract) => (
                <motion.tr key={contract.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TableCell className="font-medium">{contract.tenant.user.name}</TableCell>
                  <TableCell>{contract.tenant.unit.property.name}</TableCell>
                  <TableCell>{contract.monthlyRent.toLocaleString()} RWF</TableCell>
                  <TableCell>
                    {new Date(contract.startDate).toLocaleDateString()} – {new Date(contract.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig[contract.status]?.color || ""}>
                      {statusConfig[contract.status]?.label || contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewContract(contract)} title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {contract.status === "PENDING_LANDLORD_SIGNATURE" && (
                        <Button variant="ghost" size="icon" onClick={() => setSignContract(contract)} title="Sign">
                          <PenTool className="h-4 w-4" />
                        </Button>
                      )}
                      {(contract.status === "ACTIVE" || contract.status === "PENDING_LANDLORD_SIGNATURE") && (
                        <Button variant="ghost" size="icon" onClick={() => handleTerminate(contract.id)} title="Terminate">
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
      </div>

      {/* Mobile card view (optional, but we can keep the old card layout for consistency) */}
      <div className="md:hidden space-y-4">
        {contracts.map((contract) => (
          <motion.div key={contract.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="dark:bg-gray-900">
              <CardHeader className="flex flex-row justify-between">
                <div>
                  <CardTitle>{contract.tenant.user.name}</CardTitle>
                  <p className="text-sm text-gray-500">{contract.tenant.unit.property.name}</p>
                </div>
                <Badge className={statusConfig[contract.status]?.color}>{statusConfig[contract.status]?.label}</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p>{contract.monthlyRent.toLocaleString()} RWF</p>
                    <p className="text-xs">{new Date(contract.startDate).toLocaleDateString()} – {new Date(contract.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewContract(contract)}><Eye className="h-4 w-4" /></Button>
                    {contract.status === "PENDING_LANDLORD_SIGNATURE" && (
                      <Button variant="ghost" size="icon" onClick={() => setSignContract(contract)}><PenTool className="h-4 w-4" /></Button>
                    )}
                    {(contract.status === "ACTIVE" || contract.status === "PENDING_LANDLORD_SIGNATURE") && (
                      <Button variant="ghost" size="icon" onClick={() => handleTerminate(contract.id)}><XCircle className="h-4 w-4 text-red-500" /></Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* View dialog */}
      <Dialog open={!!viewContract} onOpenChange={(open) => !open && setViewContract(null)}>
        <DialogContent className="max-w-2xl dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Contract</DialogTitle></DialogHeader>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            {viewContract?.content || "No content"}
          </pre>
        </DialogContent>
      </Dialog>

      {/* Sign dialog */}
      <Dialog open={!!signContract} onOpenChange={(open) => !open && setSignContract(null)}>
        <DialogContent className="max-w-2xl dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Sign as Landlord</DialogTitle></DialogHeader>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-60 overflow-y-auto">
            {signContract?.content || ""}
          </pre>
          <div className="space-y-2 mt-4">
            <Label>Type your full name to sign</Label>
            <Input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Your name" />
          </div>
          <Button onClick={handleLandlordSign} disabled={loading || !signature.trim()} className="w-full mt-2">
            {loading ? "Signing..." : "Sign Contract"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}