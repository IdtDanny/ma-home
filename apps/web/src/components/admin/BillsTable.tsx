"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  SUCCESSFUL: { label: "Paid", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  EXPIRED: { label: "Expired", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

export default function BillsTable({ bills }: { bills: any[] }) {
  const [viewBill, setViewBill] = useState<any>(null);

  return (
    <>
      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {bills.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No bills found.</p>
        ) : (
          bills.map((bill) => (
            <motion.div key={bill.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="dark:bg-gray-900">
                <CardHeader className="flex flex-row justify-between p-4">
                  <div>
                    <CardTitle className="text-base">{bill.tenant.user.name}</CardTitle>
                    <p className="text-sm text-gray-500">{bill.tenant.unit.property.name} – {bill.tenant.unit.name}</p>
                  </div>
                  <Badge className={statusConfig[bill.status]?.color}>{statusConfig[bill.status]?.label}</Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{bill.type}</span>
                    <span className="font-medium">{bill.amount.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Period: {bill.period}</span>
                    <span>Due: {new Date(bill.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => setViewBill(bill)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Property/Unit</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {bills.map((bill) => (
                <motion.tr key={bill.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b dark:border-gray-800">
                  <TableCell className="font-medium">{bill.tenant.user.name}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {bill.tenant.unit.property.name} – {bill.tenant.unit.name}
                  </TableCell>
                  <TableCell className="capitalize">{bill.type}</TableCell>
                  <TableCell>{bill.amount.toLocaleString()} RWF</TableCell>
                  <TableCell>{bill.period}</TableCell>
                  <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[bill.status]?.color}>
                      {statusConfig[bill.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setViewBill(bill)} title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* View Bill Dialog */}
      <Dialog open={!!viewBill} onOpenChange={(open) => !open && setViewBill(null)}>
        <DialogContent className="max-w-md dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {viewBill && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Tenant:</span> <span className="font-medium">{viewBill.tenant.user.name}</span></div>
              <div className="flex justify-between"><span>Unit:</span> <span>{viewBill.tenant.unit.property.name} – {viewBill.tenant.unit.name}</span></div>
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
    </>
  );
}