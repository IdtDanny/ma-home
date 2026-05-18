// src/components/StatCard.tsx
"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  delay?: number;
  className?: string;
}

export default function StatCard({ title, value, icon, color, delay = 0 }: StatCardProps) {
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
          {value.toLocaleString()} RWF
        </p>
      </div>
    </motion.div>
  );
}

// export default function StatCard({ title, value, icon, color, delay = 0, className = "" }: StatCardProps) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay }}
//       className={`bg-white dark:bg-gray-900 rounded-xl shadow p-4 sm:p-5 flex items-center gap-4 ${className}`}
//     >
//       <div className={`text-2xl sm:text-3xl p-2 sm:p-3 rounded-full ${color}`}>{icon}</div>
//       <div>
//         <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{title}</p>
//         <p className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
//           {typeof value === "number" ? value.toLocaleString() : value} RWF
//         </p>
//       </div>
//     </motion.div>
//   );
// }