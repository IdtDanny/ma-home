"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ContractRow({ contract }: { contract: any }) {
  const router = useRouter();
  const [openSign, setOpenSign] = useState(false);
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLandlordSign = async () => {
    if (!signature.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/contracts/${contract.id}/landlord-sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature }),
    });
    if (res.ok) {
      toast.success("Contract signed and activated.");
      setOpenSign(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Signing failed");
    }
    setLoading(false);
  };

  const statusColor = {
    PENDING_TENANT_SIGNATURE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    PENDING_LANDLORD_SIGNATURE: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    EXPIRED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    TERMINATED: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
  }[contract.status] || "";

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div>
            <CardTitle className="text-lg">{contract.tenant.user.name}</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {contract.tenant.unit.property.name} | {contract.monthlyRent.toLocaleString()} RWF
            </p>
          </div>
          <Badge className={statusColor}>
            {contract.status.replace(/_/g, " ")}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(contract.startDate).toLocaleDateString()} – {new Date(contract.endDate).toLocaleDateString()}
          </div>
          {contract.status === "PENDING_LANDLORD_SIGNATURE" && (
            <Button size="sm" onClick={() => setOpenSign(true)}>Review & Sign</Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={openSign} onOpenChange={setOpenSign}>
        <DialogContent className="max-w-2xl dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sign Contract</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-60 overflow-y-auto">
            {contract.content || "No contract text"}
          </pre>
          <div className="space-y-2">
            <Label>Type your full name to sign</Label>
            <Input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Landlord name" />
          </div>
          <Button onClick={handleLandlordSign} disabled={loading || !signature.trim()} className="w-full">
            {loading ? "Signing..." : "Sign as Landlord"}
          </Button>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}