"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export default function AnnouncementsCard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetch("/api/announcements")
      .then(res => res.json())
      .then(data => setAnnouncements(data));
  }, []);

  if (announcements.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {announcements.map(ann => (
            <div key={ann.id}>
              <h3 className="font-semibold">{ann.title}</h3>
              <p className="text-sm text-gray-600">{ann.body}</p>
              <p className="text-xs text-gray-400">{new Date(ann.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}