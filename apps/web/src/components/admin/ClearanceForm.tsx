"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

interface ClearanceFormProps {
  tenant: any; // replace with TenantWithRelations type
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ClearanceForm({ tenant, onSuccess, onCancel }: ClearanceFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    endDate: new Date().toISOString().split("T")[0],
    propertyCondition: "Good",
    repairDetails: "",
    securityDeposit: "",
    depositAction: "fully_refunded",
    refundAmount: "",
    depositRetainedReason: "",
    rentCleared: true,
    utilitiesCleared: true,
    serviceChargesCleared: true,
    damagesCleared: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      endDate: form.endDate,
      propertyCondition: form.propertyCondition,
      repairDetails: form.repairDetails || undefined,
      securityDeposit: form.securityDeposit ? parseFloat(form.securityDeposit) : undefined,
      depositAction: form.depositAction,
      refundAmount: form.depositAction === "partially_refunded" ? parseFloat(form.refundAmount) : undefined,
      depositRetainedReason: form.depositAction === "retained" ? form.depositRetainedReason : undefined,
      rentCleared: form.rentCleared,
      utilitiesCleared: form.utilitiesCleared,
      serviceChargesCleared: form.serviceChargesCleared,
      damagesCleared: form.damagesCleared,
    };

    // const res = await fetch(`/api/tenants/${tenant.id}/delete-with-clearance`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // });

    // if (res.ok) {
    //   onSuccess(); // 🔥 this calls the parent's success handler
    // } else {
    //   const error = await res.json();
    //   toast.error(error.error || "Failed to evict tenant.");
    // }
    // setLoading(false);

    const res = await fetch(`/api/tenants/${tenant.id}/delete-with-clearance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMessage = "Failed to evict tenant.";
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // response wasn’t JSON
        console.error("Non-JSON response", res.status, res.statusText);
      }
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    // success
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Move‑out Date</Label>
          <Input
            type="date"
            required
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>
        <div>
          <Label>Property Condition</Label>
          <RadioGroup
            value={form.propertyCondition}
            onValueChange={(v) => setForm({ ...form, propertyCondition: v })}
            className="flex gap-2 mt-2"
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="Good" id="good" />
              <Label htmlFor="good" className="font-normal cursor-pointer">Good</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="Acceptable" id="acceptable" />
              <Label htmlFor="acceptable" className="font-normal cursor-pointer">Acceptable</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="Minor repairs required" id="minor" />
              <Label htmlFor="minor" className="font-normal cursor-pointer">Minor repairs</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {form.propertyCondition === "Minor repairs required" && (
        <div>
          <Label>Repair Details</Label>
          <Textarea
            value={form.repairDetails}
            onChange={(e) => setForm({ ...form, repairDetails: e.target.value })}
            placeholder="Describe required repairs..."
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Security Deposit (RWF)</Label>
          <Input
            type="number"
            value={form.securityDeposit}
            onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })}
            placeholder="0"
          />
        </div>
        <div>
          <Label>Deposit Refund</Label>
          <RadioGroup
            value={form.depositAction}
            onValueChange={(v) => setForm({ ...form, depositAction: v })}
            className="flex flex-col gap-1 mt-2"
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="fully_refunded" id="full" />
              <Label htmlFor="full" className="font-normal cursor-pointer">Fully refunded</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="partially_refunded" id="partial" />
              <Label htmlFor="partial" className="font-normal cursor-pointer">Partially refunded</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="retained" id="retained" />
              <Label htmlFor="retained" className="font-normal cursor-pointer">Retained</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {form.depositAction === "partially_refunded" && (
        <div>
          <Label>Refund Amount (RWF)</Label>
          <Input
            type="number"
            value={form.refundAmount}
            onChange={(e) => setForm({ ...form, refundAmount: e.target.value })}
          />
        </div>
      )}
      {form.depositAction === "retained" && (
        <div>
          <Label>Reason for Retention</Label>
          <Input
            value={form.depositRetainedReason}
            onChange={(e) => setForm({ ...form, depositRetainedReason: e.target.value })}
          />
        </div>
      )}

      <div>
        <Label>Clearance Status</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rent"
              checked={form.rentCleared}
              onCheckedChange={(v) => setForm({ ...form, rentCleared: !!v })}
            />
            <Label htmlFor="rent" className="font-normal cursor-pointer">Rent Cleared</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="utilities"
              checked={form.utilitiesCleared}
              onCheckedChange={(v) => setForm({ ...form, utilitiesCleared: !!v })}
            />
            <Label htmlFor="utilities" className="font-normal cursor-pointer">Utilities Cleared</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="service"
              checked={form.serviceChargesCleared}
              onCheckedChange={(v) => setForm({ ...form, serviceChargesCleared: !!v })}
            />
            <Label htmlFor="service" className="font-normal cursor-pointer">Service Charges Cleared</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="damages"
              checked={form.damagesCleared}
              onCheckedChange={(v) => setForm({ ...form, damagesCleared: !!v })}
            />
            <Label htmlFor="damages" className="font-normal cursor-pointer">Damages Cleared</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Generate Certificate & Evict"}
        </Button>
      </div>
    </form>
  );
}