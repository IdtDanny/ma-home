// src/components/StatCard.tsx
"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  delay?: number;
}

export default function StatCard({ title, value, icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl shadow p-5 flex items-center gap-4"
    >
      <div className={`text-3xl p-3 rounded-full ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">
          {value.toLocaleString()} RWF
        </p>
      </div>
    </motion.div>
  );
}