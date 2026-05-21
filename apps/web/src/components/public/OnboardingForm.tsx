"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface OnboardingFormProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export default function OnboardingForm({ variant = "outline" }: OnboardingFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Request submitted! We'll contact you shortly.");
      setForm({ name: "", email: "", phone: "", message: "" });
      setOpen(false);
    } else {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="lg" className="w-full sm:w-auto md:ml-4 text-base px-10 py-6 bg-gray-200 dark:bg-gray-800 text-primary-700 hover:bg-gray-100">
        {/* <Button variant={variant} size="lg" className="w-full sm:w-auto text-base px-10 py-6 bg-gray-600 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-100"> */}
          Request Access
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Request Landlord Access</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Phone (optional)</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label>Message (optional)</Label>
            <Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}