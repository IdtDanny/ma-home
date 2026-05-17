"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Contract {
  id: string;
  content: string | null;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  status: string;
  tenant: {
    user: { name: string; email: string };
    unit: { property: { name: string }; name: string };
  };
}

export default function PendingContractsList({
  contracts,
}: {
  contracts: Contract[];
}) {
  const router = useRouter();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLandlordSign = async () => {
    if (!selectedContract || !signature.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/contracts/${selectedContract.id}/landlord-sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature }),
    });
    if (res.ok) {
      toast.success("Contract signed and is now active.");
      setSelectedContract(null);
      setSignature("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Signing failed");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {contracts.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No pending contracts.
        </p>
      ) : (
        contracts.map((contract) => (
          <motion.div
            key={contract.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {contract.tenant.user.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {contract.tenant.unit.property.name} – {contract.tenant.unit.name}
                  </p>
                </div>
                <Badge variant="outline">Awaiting Your Signature</Badge>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span>Rent: {contract.monthlyRent.toLocaleString()} RWF</span>
                  <span className="mx-2">|</span>
                  <span>
                    {new Date(contract.startDate).toLocaleDateString()} – {new Date(contract.endDate).toLocaleDateString()}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedContract(contract)}
                >
                  Review & Sign
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}

      <Dialog open={!!selectedContract} onOpenChange={(open) => !open && setSelectedContract(null)}>
        <DialogContent className="max-w-2xl dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Contract</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-60 overflow-y-auto">
                {selectedContract.content || "No contract text available."}
              </pre>
              <div className="space-y-2">
                <Label>Type your full name to sign</Label>
                <Input
                  placeholder="Your legal name"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                />
              </div>
              <Button
                onClick={handleLandlordSign}
                disabled={loading || !signature.trim()}
                className="w-full"
              >
                {loading ? "Signing..." : "Sign as Landlord"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}