"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";

interface Alert {
  id: string;
  type: string;
  message: string;
  date: string;
}

export default function NotificationBell() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")  // we'll create this endpoint
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        setCount(data.length);
      });
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              {count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <h4 className="font-medium mb-2">Notifications</h4>
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500">No new alerts.</p>
        ) : (
          <ul className="space-y-2">
            {alerts.map(alert => (
              <motion.li
                key={alert.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm border-b pb-2"
              >
                <p className="font-medium">{alert.message}</p>
                <p className="text-xs text-gray-500">{alert.date}</p>
              </motion.li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}