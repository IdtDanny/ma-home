"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AnnouncementsList({
  initialAnnouncements,
}: {
  initialAnnouncements: any[];
}) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [openNew, setOpenNew] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Announcement created");
      setForm({ title: "", body: "" });
      setOpenNew(false);
      router.refresh(); // will re-fetch on server, but we can also refetch manually
      const data = await fetch("/api/announcements").then(res => res.json());
      setAnnouncements(data);
    } else {
      toast.error("Failed to create announcement");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast.success("Announcement deleted.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Body</Label>
                <Textarea
                  required
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Publishing..." : "Publish"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No announcements yet.</p>
        ) : (
          announcements.map((ann) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between p-4">
                  <div>
                    <CardTitle className="text-lg">{ann.title}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(ann.createdAt).toLocaleString()} • by {ann.author?.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(ann.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {ann.body}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}