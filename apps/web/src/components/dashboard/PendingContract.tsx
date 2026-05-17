"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function PendingContract({ contract }: { contract: any }) {
  const router = useRouter();
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSign = async () => {
    if (!signature.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Contract signed successfully!");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(data.error || "Signing failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
    setLoading(false);
  };

  if (!contract || (contract.status !== "PENDING_TENANT_SIGNATURE" && contract.status !== "PENDING_LANDLORD_SIGNATURE")) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
        <CardHeader>
          <CardTitle className="text-amber-800 dark:text-amber-200">Pending Contract</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
            Your rental agreement is ready for signature.
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">View & Sign Contract</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Rental Agreement</DialogTitle>
              </DialogHeader>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                {contract.content}
              </pre>
              <div className="space-y-2">
                <Label>Type your full name to sign</Label>
                <Input
                  placeholder="Your legal name"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                />
              </div>
              <Button onClick={handleSign} disabled={loading || !signature.trim()} className="w-full">
                {loading ? "Signing..." : "Sign Contract"}
              </Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </motion.div>
  );
}