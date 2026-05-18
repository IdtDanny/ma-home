"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pencil,
  Trash2,
  Eye,
  PlusCircle,
  Download,
  FileText,
  Users,
} from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import type { TenantWithRelations } from "@/types/index";
import ClearanceForm from "@/components/admin/ClearanceForm";

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

export default function TenantsTable({
  tenants,
}: {
  tenants: TenantWithRelations[];
}) {
  const router = useRouter();
  const [tenantList, setTenantList] = useState(tenants);
  const [editingTenant, setEditingTenant] = useState<TenantWithRelations | null>(null);
  const [viewingTenant, setViewingTenant] = useState<TenantWithRelations | null>(null);
  const [billTenantId, setBillTenantId] = useState<string | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<TenantWithRelations | null>(null);
  const [clearanceFormOpen, setClearanceFormOpen] = useState(false);
  const [billForm, setBillForm] = useState({
    type: "RENT",
    amount: "",
    period: "",
    dueDate: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    rentAmount: "",
  });

  // ── Contract ────────────────────────────────────────────
  const [contractTenantId, setContractTenantId] = useState<string | null>(null);
  const [contractForm, setContractForm] = useState<{
    startDate: string;
    endDate: string;
    monthlyRent: string;
    deposit: string;
    utilities: Record<string, string>;   // 👈 allow any string key
  }>({
    startDate: "",
    endDate: "",
    monthlyRent: "",
    deposit: "",
    utilities: {
      electricity: "tenant",
      water: "landlord",
      internet: "tenant",
    },
  });

  const openContractForm = (tenant: TenantWithRelations) => {
    setContractTenantId(tenant.id);
    setContractForm({
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      monthlyRent: String(tenant.rentAmount),
      deposit: "",
      utilities: { electricity: "tenant", water: "landlord", internet: "tenant" },
    });
  };

  const handleContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractTenantId) return;
    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: contractTenantId,
        startDate: contractForm.startDate,
        endDate: contractForm.endDate,
        monthlyRent: parseFloat(contractForm.monthlyRent),
        deposit: contractForm.deposit ? parseFloat(contractForm.deposit) : undefined,
        utilities: contractForm.utilities,
      }),
    });
    if (res.ok) {
      toast.success("Contract created and sent for signature.");
      setContractTenantId(null);
      router.refresh();
    } else {
      toast.error("Failed to create contract.");
    }
  };

  // ── Delete ──────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tenant?")) return;
    const res = await fetch(`/api/tenants/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTenantList((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tenant deleted.");
    } else {
      toast.error("Failed to delete tenant.");
    }
  };

  // ── Edit ────────────────────────────────────────────────
  const openEdit = (tenant: TenantWithRelations) => {
    setEditingTenant(tenant);
    setEditForm({
      name: tenant.user.name,
      email: tenant.user.email,
      phone: tenant.user.phone || "",
      rentAmount: String(tenant.rentAmount),
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    const res = await fetch(`/api/tenants/${editingTenant.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setTenantList((prev) =>
        prev.map((t) =>
          t.id === editingTenant.id
            ? {
                ...t,
                user: {
                  ...t.user,
                  name: editForm.name,
                  email: editForm.email,
                  phone: editForm.phone,
                },
                rentAmount: parseFloat(editForm.rentAmount),
              }
            : t
        )
      );
      toast.success("Tenant updated.");
      setEditingTenant(null);
    } else {
      toast.error("Failed to update tenant.");
    }
  };

  // ── View Profile ────────────────────────────────────────
  const openView = (tenant: TenantWithRelations) => {
    setViewingTenant(tenant);
  };

  // ── Add Bill ────────────────────────────────────────────
  const openBillForm = (tenantId: string) => {
    setBillTenantId(tenantId);
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const dueDate = new Date(now.getFullYear(), now.getMonth(), 10)
      .toISOString()
      .split("T")[0];
    setBillForm({ type: "RENT", amount: "", period, dueDate });
  };

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billTenantId) return;
    const res = await fetch("/api/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: billTenantId,
        type: billForm.type,
        amount: parseFloat(billForm.amount),
        period: billForm.period,
        dueDate: new Date(billForm.dueDate),
      }),
    });
    if (res.ok) {
      toast.success("Bill added successfully.");
      setBillTenantId(null);
      router.refresh();
    } else {
      toast.error("Failed to add bill.");
    }
  };

  // ── Occupants ───────────────────────────────────────────
  const [occupantTenant, setOccupantTenant] = useState<TenantWithRelations | null>(null);
  const [newOccupant, setNewOccupant] = useState({ name: "", phone: "", relation: "" });

  const openOccupantsDialog = (tenant: TenantWithRelations) => {
    setOccupantTenant(tenant);
    setNewOccupant({ name: "", phone: "", relation: "" });
  };

  const handleAddOccupant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occupantTenant) return;
    const res = await fetch("/api/occupants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: occupantTenant.id,
        ...newOccupant,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setOccupantTenant((prev) =>
        prev ? { ...prev, occupants: [...prev.occupants, data.occupant] } : prev
      );
      setTenantList((prev) =>
        prev.map((t) =>
          t.id === occupantTenant.id
            ? { ...t, occupants: [...t.occupants, data.occupant] }
            : t
        )
      );
      setNewOccupant({ name: "", phone: "", relation: "" });
      toast.success("Occupant added.");
    } else {
      toast.error("Failed to add occupant.");
    }
  };

  const handleDeleteOccupant = async (occupantId: string) => {
    if (!occupantTenant) return;
    const res = await fetch(`/api/occupants/${occupantId}`, { method: "DELETE" });
    if (res.ok) {
      setOccupantTenant((prev) =>
        prev
          ? {
              ...prev,
              occupants: prev.occupants.filter((o) => o.id !== occupantId),
            }
          : prev
      );
      setTenantList((prev) =>
        prev.map((t) =>
          t.id === occupantTenant.id
            ? {
                ...t,
                occupants: t.occupants.filter((o) => o.id !== occupantId),
              }
            : t
        )
      );
      toast.success("Occupant removed.");
    }
  };

  // ── Export to Excel ─────────────────────────────────────
  const exportToExcel = () => {
    const data = tenantList.map((t) => ({
      Name: t.user.name,
      Email: t.user.email,
      Phone: t.user.phone || "",
      Property: t.unit.property.name,
      Unit: t.unit.name,
      "Monthly Rent (RWF)": t.rentAmount,
      Status: t.isActive ? "Active" : "Inactive",
      "Move-in Date": new Date(t.startDate).toLocaleDateString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tenants");
    XLSX.writeFile(workbook, "tenants.xlsx");
    toast.success("Export downloaded.");
  };

  // ── Actions Helper (now receives hasContract to decide button) ──
  const actionButtons = (tenant: TenantWithRelations, hasContract: boolean) => (
    <div className="flex gap-1 justify-end">
      <Button variant="ghost" size="icon" onClick={() => openView(tenant)} title="View Profile">
        <Eye className="h-4 w-4" />
      </Button>
      {hasContract ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/admin/contracts?tenantId=${tenant.id}`)}
          title="View Contract"
        >
          <FileText className="h-4 w-4 text-blue-600" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => openContractForm(tenant)}
          title="Assign Contract"
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={() => openEdit(tenant)} title="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => openBillForm(tenant.id)} title="Add Bill">
        <PlusCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setDeletingTenant(tenant);
          setClearanceFormOpen(true);
        }}
        title="Delete"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );

  return (
    <>
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-gray-800 dark:text-gray-100">
            All Tenants
          </CardTitle>
          <Button onClick={exportToExcel} variant="outline" size="sm" className="dark:border-gray-700 dark:text-gray-200">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </CardHeader>
        <CardContent>
          {/* ── Mobile: Cards ── */}
          <div className="md:hidden space-y-4">
            {tenantList.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No tenants found.
              </p>
            ) : (
              tenantList.map((tenant) => {
                const latestContract = tenant.contracts?.[0];
                const contractStatus = latestContract?.status ?? null;
                const hasContract = !!latestContract;

                return (
                  <motion.div
                    key={tenant.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {tenant.user.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {tenant.user.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {tenant.unit.property.name} – {tenant.unit.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">Contract:</span>
                        {contractStatus ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              statusConfig[contractStatus]?.color ?? ""
                            }`}
                          >
                            {statusConfig[contractStatus]?.label ?? contractStatus}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No Contract</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">ID:</span>{" "}
                        {tenant.nationalId || "—"}
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Occupants:</span>{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => openOccupantsDialog(tenant)}
                        >
                          {tenant.occupants.length}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-between items-center">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {tenant.rentAmount.toLocaleString()} RWF
                      </span>
                      {actionButtons(tenant, hasContract)}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* ── Desktop: Table ── */}
          <div className="hidden md:block overflow-auto">
            {tenantList.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No tenants found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>ID / Passport</TableHead>
                    <TableHead>Occupants</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {tenantList.map((tenant) => {
                      const latestContract = tenant.contracts?.[0];
                      const contractStatus = latestContract?.status ?? null;
                      const hasContract = !!latestContract;

                      return (
                        <motion.tr
                          key={tenant.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="border-b dark:border-gray-800"
                        >
                          <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                            {tenant.user.name}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {tenant.user.email}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {tenant.unit.property.name} – {tenant.unit.name}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400 text-xs">
                            {tenant.nationalId || "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{tenant.occupants.length}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openOccupantsDialog(tenant)}
                                title="Manage Occupants"
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {tenant.rentAmount.toLocaleString()} RWF
                          </TableCell>
                          <TableCell>
                            {contractStatus ? (
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  statusConfig[contractStatus]?.color ?? ""
                                }`}
                              >
                                {statusConfig[contractStatus]?.label ?? contractStatus}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">No Contract</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {actionButtons(tenant, hasContract)}
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editingTenant} onOpenChange={(open) => !open && setEditingTenant(null)}>
        <DialogContent className="max-w-md dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input required type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div>
              <Label>Monthly Rent (RWF)</Label>
              <Input type="number" required value={editForm.rentAmount} onChange={(e) => setEditForm({ ...editForm, rentAmount: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── View Profile Dialog ── */}
      <Dialog open={!!viewingTenant} onOpenChange={(open) => !open && setViewingTenant(null)}>
        <DialogContent className="max-w-2xl dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Tenant Profile</DialogTitle>
          </DialogHeader>
          {viewingTenant && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{viewingTenant.user.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{viewingTenant.user.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{viewingTenant.user.phone || "—"}</p>
                </div>
                <div>
                  <Label>Unit</Label>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {viewingTenant.unit.property.name} – {viewingTenant.unit.name}
                  </p>
                </div>
                <div>
                  <Label>Monthly Rent</Label>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {viewingTenant.rentAmount.toLocaleString()} RWF
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {viewingTenant.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div>
                  <Label>Move‑in Date</Label>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {new Date(viewingTenant.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {viewingTenant.bills.length > 0 && (
                <div>
                  <Label>Recent Bills</Label>
                  <ul className="space-y-1 mt-2">
                    {viewingTenant.bills.map((bill) => (
                      <li key={bill.id} className="flex justify-between text-sm border-b dark:border-gray-700 pb-1">
                        <span>{bill.type} – {bill.period}</span>
                        <span className={`font-medium ${bill.status === "SUCCESSFUL" ? "text-green-600" : "text-gray-600 dark:text-gray-400"}`}>
                          {bill.amount.toLocaleString()} RWF ({bill.status})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Add Bill Dialog ── */}
      <Dialog open={!!billTenantId} onOpenChange={(open) => !open && setBillTenantId(null)}>
        <DialogContent className="max-w-md dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Add Bill</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBill} className="space-y-4">
            <div>
              <Label>Bill Type</Label>
              <Select value={billForm.type} onValueChange={(v) => setBillForm({ ...billForm, type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RENT">Rent</SelectItem>
                  <SelectItem value="ELECTRICITY">Electricity</SelectItem>
                  <SelectItem value="WATER">Water</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (RWF)</Label>
              <Input type="number" required value={billForm.amount} onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })} />
            </div>
            <div>
              <Label>Period (YYYY‑MM)</Label>
              <Input required value={billForm.period} onChange={(e) => setBillForm({ ...billForm, period: e.target.value })} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" required value={billForm.dueDate} onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Create Bill</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Create Contract Dialog ── */}
      <Dialog open={!!contractTenantId} onOpenChange={(open) => !open && setContractTenantId(null)}>
        <DialogContent className="max-w-lg dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Assign Rental Contract</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContractSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" required value={contractForm.startDate} onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" required value={contractForm.endDate} onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Monthly Rent (RWF)</Label>
              <Input type="number" required value={contractForm.monthlyRent} onChange={(e) => setContractForm({ ...contractForm, monthlyRent: e.target.value })} />
            </div>
            <div>
              <Label>Security Deposit (RWF)</Label>
              <Input type="number" value={contractForm.deposit} onChange={(e) => setContractForm({ ...contractForm, deposit: e.target.value })} />
            </div>
            <fieldset>
              <legend className="text-sm font-medium mb-2">Utilities Responsibility</legend>
              <div className="grid grid-cols-2 gap-2">
                {["electricity", "water", "internet"].map((utility) => (
                  <div key={utility} className="flex flex-col">
                    <Label className="capitalize">{utility}</Label>
                    <Select
                      value={contractForm.utilities[utility] || "landlord"}
                      onValueChange={(value) =>
                        setContractForm({
                          ...contractForm,
                          utilities: { ...contractForm.utilities, [utility]: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tenant">Tenant</SelectItem>
                        <SelectItem value="landlord">Landlord</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </fieldset>
            <Button type="submit" className="w-full">Generate & Send Contract</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Occupants Dialog ── */}
      <Dialog open={!!occupantTenant} onOpenChange={(open) => !open && setOccupantTenant(null)}>
        <DialogContent className="max-w-md dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Occupants for {occupantTenant?.user.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {occupantTenant?.occupants.length === 0 ? (
              <p className="text-sm text-gray-500">No occupants registered.</p>
            ) : (
              <ul className="divide-y dark:divide-gray-700">
                {occupantTenant?.occupants.map((occ) => (
                  <li key={occ.id} className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">{occ.name}</p>
                      {occ.relation && <p className="text-xs text-gray-500">{occ.relation}</p>}
                      {occ.phone && <p className="text-xs text-gray-400">{occ.phone}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteOccupant(occ.id)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={handleAddOccupant} className="space-y-3 border-t pt-4 dark:border-gray-700">
              <Input
                placeholder="Name"
                required
                value={newOccupant.name}
                onChange={(e) => setNewOccupant({ ...newOccupant, name: e.target.value })}
              />
              <Input
                placeholder="Phone (optional)"
                value={newOccupant.phone}
                onChange={(e) => setNewOccupant({ ...newOccupant, phone: e.target.value })}
              />
              <Input
                placeholder="Relation (e.g., spouse)"
                value={newOccupant.relation}
                onChange={(e) => setNewOccupant({ ...newOccupant, relation: e.target.value })}
              />
              <Button type="submit" size="sm">Add Occupant</Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Clearance Dialog ── */}
      <Dialog
        open={clearanceFormOpen}
        onOpenChange={(open) => {
          setClearanceFormOpen(open);
          if (!open) setDeletingTenant(null);
        }}
      >
        <DialogContent className="max-w-2xl dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Eviction & Clearance Certificate</DialogTitle>
          </DialogHeader>
          {deletingTenant && (
            <ClearanceForm
              tenant={deletingTenant}
              onSuccess={() => {
                setTenantList((prev) => prev.filter((t) => t.id !== deletingTenant.id));
                setClearanceFormOpen(false);
                setDeletingTenant(null);
                toast.success("Tenant evicted and certificate generated.");
                router.refresh();
              }}
              onCancel={() => {
                setClearanceFormOpen(false);
                setDeletingTenant(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}