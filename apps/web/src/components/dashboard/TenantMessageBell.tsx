"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TenantMessageBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/contact/unread-count")
      .then(res => res.json())
      .then(data => setCount(data.count || 0));
  }, []);

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href="/tenant/contact">
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
            {count}
          </span>
        )}
      </Link>
    </Button>
  );
}