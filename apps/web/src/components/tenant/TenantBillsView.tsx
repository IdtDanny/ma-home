"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PayButton from "@/components/PayButton";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  SUCCESSFUL: { label: "Paid", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  EXPIRED: { label: "Expired", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

export default function TenantBillsView({
  bills,
  counts,
}: {
  bills: any[];
  counts: Record<string, number>;
}) {
  const [status, setStatus] = useState("ALL");
  const [viewBill, setViewBill] = useState<any>(null);

  const filtered = status === "ALL" ? bills : bills.filter((b) => b.status === status);

  return (
    <div className="space-y-4">
      {/* Filter – Mobile select / Desktop tabs */}
      <div className="flex justify-between items-center">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-auto">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All ({counts.ALL})</SelectItem>
            <SelectItem value="PENDING">Pending ({counts.PENDING})</SelectItem>
            <SelectItem value="SUCCESSFUL">Paid ({counts.SUCCESSFUL})</SelectItem>
            <SelectItem value="FAILED">Failed ({counts.FAILED})</SelectItem>
            <SelectItem value="EXPIRED">Expired ({counts.EXPIRED})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bills found.</p>
        ) : (
          filtered.map((bill) => (
            <motion.div key={bill.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="dark:bg-gray-900">
                <CardHeader className="flex flex-row justify-between p-4">
                  <div>
                    <CardTitle className="text-base capitalize">{bill.type}</CardTitle>
                    <p className="text-sm text-gray-500">{bill.period}</p>
                  </div>
                  <Badge className={statusConfig[bill.status]?.color}>
                    {statusConfig[bill.status]?.label}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium">{bill.amount.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Due: {new Date(bill.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewBill(bill)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {bill.status === "PENDING" && <PayButton billId={bill.id} />}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Period</th>
              <th className="text-left p-3">Due Date</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((bill) => (
                <motion.tr key={bill.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b dark:border-gray-700">
                  <td className="p-3 capitalize">{bill.type}</td>
                  <td className="p-3">{bill.amount.toLocaleString()} RWF</td>
                  <td className="p-3">{bill.period}</td>
                  <td className="p-3">{new Date(bill.dueDate).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Badge className={statusConfig[bill.status]?.color}>
                      {statusConfig[bill.status]?.label}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setViewBill(bill)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {bill.status === "PENDING" && <PayButton billId={bill.id} />}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* View Bill Dialog */}
      <Dialog open={!!viewBill} onOpenChange={(open) => !open && setViewBill(null)}>
        <DialogContent className="max-w-md dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {viewBill && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Type:</span> <span className="capitalize">{viewBill.type}</span></div>
              <div className="flex justify-between"><span>Amount:</span> <span>{viewBill.amount.toLocaleString()} RWF</span></div>
              <div className="flex justify-between"><span>Period:</span> <span>{viewBill.period}</span></div>
              <div className="flex justify-between"><span>Due Date:</span> <span>{new Date(viewBill.dueDate).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span>Status:</span> <Badge className={statusConfig[viewBill.status]?.color}>{statusConfig[viewBill.status]?.label}</Badge></div>
              {viewBill.payment && (
                <>
                  <hr className="dark:border-gray-700" />
                  <div className="flex justify-between"><span>Payment Method:</span> <span>{viewBill.payment.method}</span></div>
                  <div className="flex justify-between"><span>Transaction ID:</span> <span className="text-xs">{viewBill.payment.transactionId || "N/A"}</span></div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}