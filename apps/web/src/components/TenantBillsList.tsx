"use client";

import { motion } from "framer-motion";
import PayButton from "./PayButton";
import type { Bill } from "@/lib/generated/prisma/client";
// import type { Bill } from "@prisma/client";

interface TenantBillsListProps {
  bills: Bill[];
}

export default function TenantBillsList({ bills }: TenantBillsListProps) {
  return (
    <div className="space-y-3">
      {bills.length === 0 ? (
        <p className="text-gray-400">No bills yet.</p>
      ) : (
        bills.map((bill, index) => (
          <motion.div
            key={bill.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 rounded-lg p-4"
          >
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-300">
                {bill.type} – {bill.period}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Due: {new Date(bill.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2 sm:mt-0">
              <span className="font-bold text-lg">
                {bill.amount.toLocaleString()} RWF
              </span>
              {bill.status === "PENDING" && <PayButton billId={bill.id} />}
              {bill.status === "SUCCESSFUL" && (
                <span className="text-green-600 font-medium">Paid</span>
              )}
              {bill.status === "FAILED" && (
                <span className="text-red-500 font-medium">Failed</span>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}