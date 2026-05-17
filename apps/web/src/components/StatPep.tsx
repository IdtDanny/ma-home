// src/components/StatPep.tsx
"use client";

import { motion } from "framer-motion";

interface StatPepProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  delay?: number;
}

export default function StatPep({ title, value, icon, color, delay = 0 }: StatPepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 backdrop-blur-lg rounded-xl shadow p-6 flex items-center gap-4"
    >
      <div className={`text-3xl p-3 rounded-full ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-100">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          {value.toLocaleString()} 
        </p>
      </div>
    </motion.div>
  );
}