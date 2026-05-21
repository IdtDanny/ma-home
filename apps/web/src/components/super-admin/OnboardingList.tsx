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
import { Check, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function OnboardingList({ requests }: { requests: any[] }) {
  const router = useRouter();
  const [list, setList] = useState(requests);
  const [approveOpen, setApproveOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!selected || !password.trim()) return;
    setLoading(true);
    const res = await fetch("/api/super-admin/approve-landlord", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: selected.id,
        password,
      }),
    });
    if (res.ok) {
      toast.success("Landlord created successfully!");
      setList((prev) => prev.filter((r) => r.id !== selected.id));
      setApproveOpen(false);
      setPassword("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Failed to create landlord");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this request?")) return;
    const res = await fetch(`/api/onboarding/${id}`, { method: "DELETE" });
    if (res.ok) {
      setList((prev) => prev.filter((r) => r.id !== id));
      toast.success("Request deleted.");
    }
  };

  return (
    <>
      <div className="space-y-4">
        {list.length === 0 ? (
          <p className="text-gray-500">No pending requests.</p>
        ) : (
          list.map((req) => (
            <Card key={req.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{req.name}</CardTitle>
                  <p className="text-sm text-gray-500">{req.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => { setSelected(req); setApproveOpen(true); }} title="Approve">
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(req.id)} title="Delete">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              {req.phone && <CardContent className="text-sm">{req.phone}</CardContent>}
              {req.message && <CardContent className="text-sm">{req.message}</CardContent>}
            </Card>
          ))
        )}
      </div>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Approve Landlord</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">{selected?.name} ({selected?.email})</p>
            <div>
              <Label>Set a temporary password</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button onClick={handleApprove} disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Landlord Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}