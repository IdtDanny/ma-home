"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import NotificationBell from "@/components/dashboard/NotificationBell";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import AdminNotificationBell from "../dashboard/AdminNotificationBell";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/tenants", label: "Tenants" },
  { href: "/admin/bills", label: "Bills" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/contracts", label: "Contracts" },
];

const tenantLinks = [
  { href: "/tenant", label: "Dashboard" },
  // { href: "/tenant/contract", label: "My Contract", icon: "📝" },
  { href: "/tenant/contract", label: "My Contract" },
  { href: "/tenant/bills", label: "My Bills" },
  { href: "/tenant/profile", label: "Profile" },
  { href: "/tenant/contact", label: "Contact" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!session?.user) return null;

  const role = session.user.role as "ADMIN" | "TENANT";
  const links = role === "ADMIN" ? adminLinks : tenantLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 backdrop-blur-lg">
    {/* <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg"> */}
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 md:px-6">
      {/* <div className="flex h-16 items-center px-4 md:px-6"> */}
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          {/* <SheetContent side="left" className="w-64"> */}

          <SheetContent side="left" className="w-64 p-0 dark:bg-gray-900">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b dark:border-gray-800">
                <SheetTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  MA Home
                </SheetTitle>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-4 space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Bottom actions */}
              <div className="border-t dark:border-gray-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
                  <ThemeToggle />
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          {/* </SheetContent> */}

          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href={role === "ADMIN" ? "/admin" : "/tenant"} className="flex items-center gap-2 mr-6">
          {/* <div className="h-8 w-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">
            MA
          </div> */}
          <span className="font-bold hidden sm:inline">MA Home</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                pathname === link.href
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {role === "ADMIN" && <AdminNotificationBell />}
          {role === "TENANT" && <NotificationBell />}

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-primary-100">
                <User className="h-5 w-5 text-primary-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-4 py-2 text-sm text-gray-500">
                {session.user.name}
              </div>
              <DropdownMenuSeparator />
              {role === "TENANT" && (
                <DropdownMenuItem asChild>
                  <Link href="/tenant/profile">Profile</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}