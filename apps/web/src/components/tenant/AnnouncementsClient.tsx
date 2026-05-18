"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

interface CommentType {
  id: string;
  content: string;
  createdAt: Date;
  author: { name: string; role: string };
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  isNew: boolean;
  author: { name: string };
  comments: CommentType[];
}

export default function AnnouncementsClient() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    const res = await fetch("/api/announcements/tenant");
    if (res.ok) {
      const data = await res.json();
      setAnnouncements(data);
      // Mark as read
      fetch("/api/announcements/read", { method: "POST" });
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

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
            ? { ...a, comments: [...a.comments, data.comment] }
            : a
        )
      );
      setCommentText("");
      toast.success("Comment added.");
    } else {
      toast.error("Failed to add comment.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {announcements.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No announcements yet.</p>
      ) : (
        announcements.map((ann) => (
          <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`dark:bg-gray-900 dark:border-gray-800 ${ann.isNew ? "border-l-4 border-primary-500" : ""}`}>
              <CardHeader className="flex flex-row items-start justify-between p-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {ann.title}
                    {ann.isNew && <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">New</Badge>}
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(ann.createdAt).toLocaleDateString()} • by {ann.author.name}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ann.body}</p>

                {/* Comments section */}
                {ann.comments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <MessageCircle className="h-3 w-3" /> Comments ({ann.comments.length})
                    </div>
                    {ann.comments.map((c) => (
                      <div key={c.id} className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {c.author.name} ({c.author.role}) • {new Date(c.createdAt).toLocaleString()}
                        </p>
                        <p className="text-gray-800 dark:text-gray-200">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment input */}
                <div className="flex gap-2 mt-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
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
        ))
      )}
    </div>
  );
}