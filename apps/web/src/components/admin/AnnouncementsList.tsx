"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { Trash2, Plus, MessageCircle, Send } from "lucide-react";
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
  const [commentText, setCommentText] = useState("");
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

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
      router.refresh();
      // Refetch
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

  const handleComment = async (announcementId: string) => {
    if (!commentText.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/announcements/${announcementId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText }),
    });
    if (res.ok) {
      const data = await res.json();
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === announcementId
            ? { ...a, comments: [...(a.comments || []), data.comment] }
            : a
        )
      );
      setCommentText("");
      setActiveCommentId(null);
      toast.success("Comment added.");
    } else {
      toast.error("Failed to add comment.");
    }
    setLoading(false);
  };

  const handleDeleteComment = async (commentId: string, announcementId: string) => {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === announcementId
            ? { ...a, comments: a.comments.filter((c: any) => c.id !== commentId) }
            : a
        )
      );
      toast.success("Comment deleted.");
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
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Body</Label>
                <Textarea required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Publishing..." : "Publish"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <div>
                  <CardTitle className="text-lg">{ann.title}</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(ann.createdAt).toLocaleString()} • by {ann.author?.name}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(ann.id)} title="Delete">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ann.body}</p>

                {/* Comments */}
                {ann.comments?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <MessageCircle className="h-3 w-3" /> Comments ({ann.comments.length})
                    </div>
                    {ann.comments.map((c: any) => (
                      <div key={c.id} className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm flex justify-between">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {c.author.name} ({c.author.role}) • {new Date(c.createdAt).toLocaleString()}
                          </p>
                          <p className="text-gray-800 dark:text-gray-200">{c.content}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteComment(c.id, ann.id)}>
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment input */}
                <div className="flex gap-2 mt-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={activeCommentId === ann.id ? commentText : ""}
                    onChange={(e) => {
                      setActiveCommentId(ann.id);
                      setCommentText(e.target.value);
                    }}
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={() => handleComment(ann.id)}
                    disabled={loading || !commentText.trim()}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}