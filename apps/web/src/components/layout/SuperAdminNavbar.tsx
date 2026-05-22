"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, LogOut, User } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/super-admin", label: "Dashboard", icon: "📊" },
  { href: "/super-admin/landlords", label: "Landlords", icon: "🏠" },
  { href: "/super-admin/onboarding", label: "Onboarding", icon: "📋" },
  { href: "/super-admin/tenants", label: "All Tenants", icon: "👥" },
  { href: "/super-admin/bills", label: "All Bills", icon: "💰" },
  { href: "/super-admin/contracts", label: "All Contracts", icon: "📝" },
];

export default function SuperAdminNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg dark:bg-gray-900/80 dark:border-gray-800">
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 md:px-6">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 dark:bg-gray-900">
            <div className="p-6 border-b dark:border-gray-800">
              <SheetTitle className="text-xl font-bold">MA Home</SheetTitle>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                    pathname === link.href
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t dark:border-gray-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Theme</span>
                <ThemeToggle />
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 dark:text-gray-300"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/super-admin" className="flex items-center gap-2 mr-6">
          <div className="h-8 w-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">SA</div>
          <span className="font-bold hidden sm:inline">MA Home</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                pathname === link.href
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <DropdownMenu>

            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <div className="h-full w-full rounded-full bg-primary-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-700 dark:text-gray-200">
                      {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>

            {/* <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger> */}
            
            
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-4 py-2 text-sm text-gray-500">{session?.user?.name}</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}