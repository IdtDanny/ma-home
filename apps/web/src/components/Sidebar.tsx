"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/tenants", label: "Tenants", icon: "👥" },
  { href: "/admin/bills", label: "Bills", icon: "💰" },
];

const tenantLinks = [
  { href: "/tenant", label: "Dashboard", icon: "📊" },
  { href: "/tenant/bills", label: "My Bills", icon: "📄" },
  { href: "/tenant/profile", label: "Profile", icon: "👤" },
];

export default function Sidebar({ role }: { role: "ADMIN" | "TENANT" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = role === "ADMIN" ? adminLinks : tenantLinks;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md text-gray-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="md:hidden fixed inset-0 bg-black z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar container */}
      <motion.aside
        initial={false}
        animate={{
          x: open ? 0 : -280,
          transition: { type: "tween", duration: 0.3 },
        }}
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-40 transform md:translate-x-0 md:static md:z-auto transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="text-xl font-bold mb-8 mt-2 px-2">MA Home</div>
          <nav className="flex-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition ${
                  pathname === link.href
                    ? "bg-primary-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-auto px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
}