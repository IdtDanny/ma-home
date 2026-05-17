"use client";

import { motion } from "framer-motion";

interface TenantProfileCardProps {
  tenant: {
    user: { name: string; email: string; phone: string | null };
    unit: { name: string; property: { name: string; address: string | null } };
    rentAmount: number;
    startDate: Date;
    isActive: boolean;
    bills: { type: string; amount: number; status: string; period: string }[];
  };
}

export default function TenantProfileCard({ tenant }: TenantProfileCardProps) {
  const { user, unit, rentAmount, startDate, isActive } = tenant;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl shadow p-6 max-w-2xl"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-2xl font-bold text-primary-700">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          {isActive ? (
            <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
          ) : (
            <span className="inline-block mt-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Inactive</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <InfoBox label="Phone" value={user.phone || "Not provided"} />
        <InfoBox label="Property" value={unit.property.name} />
        <InfoBox label="Unit" value={unit.name} />
        <InfoBox label="Monthly Rent" value={`${rentAmount.toLocaleString()} RWF`} />
        <InfoBox label="Move‑in Date" value={new Date(startDate).toLocaleDateString()} />
        {unit.property.address && (
          <InfoBox label="Address" value={unit.property.address} />
        )}
      </div>

      <h3 className="font-semibold text-gray-700 mb-2">Recent Bills</h3>
      <div className="space-y-2">
        {tenant.bills.length === 0 ? (
          <p className="text-gray-400 text-sm">No bills yet.</p>
        ) : (
          tenant.bills.map((bill, idx) => (
            <div key={idx} className="flex justify-between text-sm border-b pb-2">
              <span>{bill.type} – {bill.period}</span>
              <span className={`font-medium ${bill.status === "SUCCESSFUL" ? "text-green-600" : "text-gray-600"}`}>
                {bill.amount.toLocaleString()} RWF ({bill.status})
              </span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  );
}