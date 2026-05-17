"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Unit {
  id: string;
  name: string;
  property: { name: string };
}

export default function AddTenantDialog({ units }: { units: Unit[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    unitId: "",
    rentAmount: "",
    nationalId: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    numberOfOccupants: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      unitId: form.unitId,
      rentAmount: parseFloat(form.rentAmount),
      nationalId: form.nationalId || undefined,
      emergencyContactName: form.emergencyContactName || undefined,
      emergencyContactPhone: form.emergencyContactPhone || undefined,
      numberOfOccupants: form.numberOfOccupants ? parseInt(form.numberOfOccupants) : undefined,
    };

    const res = await fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success("Tenant created successfully!");
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        unitId: "",
        rentAmount: "",
        nationalId: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        numberOfOccupants: "",
      });
      setOpen(false);
      router.refresh();
    } else {
      const errorData = await res.json().catch(() => ({}));
      // If the API returned detailed field errors (e.g. { password: [ '...' ] }), show the first one
      if (errorData.details?.fieldErrors) {
        const messages = Object.values(errorData.details.fieldErrors).flat() as string[];
        toast.error((messages[0] as string) || "Failed to create tenant.");
      } else {
        toast.error(errorData.error || "Failed to create tenant.");
      }
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-0 h-4 w-4" /> 
          <span className="sr-only sm:not-sr-only">Add Tenant</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Register New Tenant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone (e.g., 25078xxxxxxx)</Label>
              <Input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Select
                value={form.unitId}
                onValueChange={(v) => setForm({ ...form, unitId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.property.name} – {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Monthly Rent (RWF)</Label>
              <Input
                type="number"
                required
                value={form.rentAmount}
                onChange={(e) => setForm({ ...form, rentAmount: e.target.value })}
              />
            </div>
            <div>
              <Label>National ID / Passport (optional)</Label>
              <Input
                value={form.nationalId}
                onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
              />
            </div>
            <div>
              <Label>Emergency Contact Name (optional)</Label>
              <Input
                value={form.emergencyContactName}
                onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
              />
            </div>
            <div>
              <Label>Emergency Contact Phone (optional)</Label>
              <Input
                value={form.emergencyContactPhone}
                onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
              />
            </div>
            <div>
              <Label>Number of Occupants (optional)</Label>
              <Input
                type="number"
                value={form.numberOfOccupants}
                onChange={(e) => setForm({ ...form, numberOfOccupants: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Tenant"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}