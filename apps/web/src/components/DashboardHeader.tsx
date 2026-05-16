// src/components/DashboardHeader.tsx
"use client";

import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function DashboardHeader() {
  const { data: session } = useSession();
  if (!session?.user) return null;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-white shadow-sm px-4 md:px-6 py-3 mb-6 rounded-b-xl md:rounded-xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
          {session.user.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-medium text-gray-800">{session.user.name}</p>
          <p className="text-xs text-gray-500 capitalize">{session.user.role}</p>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-4 py-2 rounded-lg transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign Out
      </motion.button>
    </header>
  );
}