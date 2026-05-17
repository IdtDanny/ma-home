"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion } from "framer-motion";
import Link from "next/link";

interface AdminAlerts {
  pendingContracts: number;
  recentPayments: number;
  unreadMessages: number;
}

export default function AdminNotificationBell() {
  const [alerts, setAlerts] = useState<AdminAlerts | null>(null);

  const fetchAlerts = async () => {
    const res = await fetch("/api/admin/notifications");
    if (res.ok) {
      const data = await res.json();
      setAlerts(data);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30_000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const totalCount =
    (alerts?.pendingContracts ?? 0) +
    (alerts?.recentPayments ?? 0) +
    (alerts?.unreadMessages ?? 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <h4 className="font-medium mb-2">Notifications</h4>
        {totalCount === 0 ? (
          <p className="text-sm text-gray-500">No new notifications</p>
        ) : (
          <ul className="space-y-2">
            {alerts?.pendingContracts ? (
              <li>
                <Link
                  href="/admin/contracts?tab=pending-landlord"
                  className="text-sm hover:underline"
                >
                  {alerts.pendingContracts} contract(s) waiting for your signature
                </Link>
              </li>
            ) : null}
            {alerts?.recentPayments ? (
              <li className="text-sm">
                {alerts.recentPayments} payment(s) received today
              </li>
            ) : null}
            {alerts?.unreadMessages ? (
              <li>
                <Link
                  href="/admin/messages"
                  className="text-sm hover:underline"
                >
                  {alerts.unreadMessages} unread message(s) from tenants
                </Link>
              </li>
            ) : null}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}