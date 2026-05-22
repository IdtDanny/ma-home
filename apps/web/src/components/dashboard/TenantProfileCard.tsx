"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Home,
  DollarSign,
  Calendar,
  ShieldCheck,
  Phone,
  User,
  Users,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import AvatarUpload from "@/components/AvatarUpload";

interface TenantProfileProps {
  tenant: {
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
      phone: string | null;
    };
    unit: { name: string; property: { name: string; address: string | null } };
    rentAmount: number;
    startDate: Date;
    isActive: boolean;
    nationalId: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    numberOfOccupants: number | null;
    bills: { type: string; amount: number; status: string; period: string }[];
  };
}

export default function TenantProfileCard({ tenant }: TenantProfileProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: tenant.user.name,
    email: tenant.user.email,
    phone: tenant.user.phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/tenant/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Profile updated.");
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Update failed.");
    }
    setLoading(false);
  };

  const updateImage = async (url: string) => {
    await fetch("/api/user/image", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: url }),
    });
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <Card className="dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <AvatarUpload
              currentImage={tenant.user.image || null}
              onUploadComplete={updateImage}
            />
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {tenant.user.name}
              </h1>
              <p className="text-primary-100 text-sm">{tenant.user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="border-primary-200 text-primary-100"
                >
                  {tenant.isActive ? "Active Tenant" : "Inactive"}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-primary-200 text-primary-100"
                >
                  {tenant.unit.property.name}
                </Badge>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white text-primary-700 hover:bg-gray-100"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-gray-900">
                <DialogHeader>
                  <DialogTitle>Edit Personal Info</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Key Information Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary-600" />
              Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard
                icon={ShieldCheck}
                label="National ID / Passport"
                value={tenant.nationalId || "—"}
              />
              <InfoCard
                icon={Phone}
                label="Phone"
                value={tenant.user.phone || "—"}
              />
              <InfoCard
                icon={Users}
                label="Occupants"
                value={tenant.numberOfOccupants?.toString() || "—"}
              />
              <InfoCard
                icon={Phone}
                label="Emergency Contact"
                value={
                  tenant.emergencyContactName
                    ? `${tenant.emergencyContactName} (${tenant.emergencyContactPhone || "—"})`
                    : "—"
                }
              />
            </div>
          </div>

          {/* Property Details */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-primary-600" />
              Rental Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard
                icon={Home}
                label="Property"
                value={tenant.unit.property.name}
              />
              <InfoCard
                icon={Home}
                label="Unit"
                value={tenant.unit.name}
              />
              <InfoCard
                icon={DollarSign}
                label="Monthly Rent"
                value={`${tenant.rentAmount.toLocaleString()} RWF`}
              />
              <InfoCard
                icon={Calendar}
                label="Move‑in Date"
                value={new Date(tenant.startDate).toLocaleDateString()}
              />
            </div>
          </div>

          {/* Recent Bills */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              Recent Bills
            </h2>
            {tenant.bills.length === 0 ? (
              <p className="text-gray-400 text-sm italic">
                No bills yet.
              </p>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                {tenant.bills.map((bill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm border-b dark:border-gray-700 pb-2 last:border-0"
                  >
                    <div>
                      <span className="font-medium capitalize">
                        {bill.type}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        {bill.period}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {bill.amount.toLocaleString()} RWF
                      </span>
                      <Badge
                        variant={
                          bill.status === "SUCCESSFUL"
                            ? "default"
                            : bill.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {bill.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-full">
        <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
          {label}
        </p>
        <p className="font-medium text-gray-800 dark:text-gray-200">
          {value}
        </p>
      </div>
    </div>
  );
}