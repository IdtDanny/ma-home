"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MailOpen, Mail, Trash2, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function MessagesList({ initialMessages }: { initialMessages: any[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [viewMsg, setViewMsg] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const handleReply = async (parentId: string) => {
    if (!reply.trim()) return;
    setSending(true);
    const res = await fetch(`/api/contact/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId, message: reply }),
    });
    if (res.ok) {
      toast.success("Reply sent.");
      // Update local state: add reply to the parent message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === parentId
            ? {
                ...m,
                replies: [
                  ...m.replies,
                  {
                    id: Date.now().toString(),
                    message: reply,
                    senderRole: "ADMIN",
                    createdAt: new Date(),
                    isRead: false,
                  },
                ],
              }
            : m
        )
      );
      // Also update the viewing dialog if open
      setViewMsg((prev: any) =>
        prev && prev.id === parentId
          ? {
              ...prev,
              replies: [
                ...prev.replies,
                {
                  id: Date.now().toString(),
                  message: reply,
                  senderRole: "ADMIN",
                  createdAt: new Date(),
                  isRead: false,
                },
              ],
            }
          : prev
      );
      setReply("");
    } else {
      toast.error("Failed to send reply.");
    }
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success("Message deleted.");
    }
  };

  return (
    <>
      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No messages.</p>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card
                className={`cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800 ${
                  msg.isRead ? "opacity-70" : ""
                }`}
                onClick={() => {
                  setViewMsg(msg);
                  // Mark as read if unread
                  if (!msg.isRead) {
                    fetch(`/api/messages/${msg.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ isRead: true }),
                    });
                    setMessages((prev) =>
                      prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
                    );
                  }
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between p-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {msg.replies.length > 0 ? (
                        <MailOpen className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Mail className="h-5 w-5 text-primary-600" />
                      )}
                      {msg.subject}
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      From: {msg.tenant.name} ({msg.tenant.email}) • {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(msg.id);
                    }}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardHeader>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Thread View & Reply Dialog */}
      <Dialog open={!!viewMsg} onOpenChange={(open) => !open && setViewMsg(null)}>
        <DialogContent className="max-w-2xl dark:bg-gray-900 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewMsg?.subject}</DialogTitle>
          </DialogHeader>
          {viewMsg && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {viewMsg.tenant.name} • {new Date(viewMsg.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {viewMsg.message}
                </p>
              </div>

              {viewMsg.replies.map((reply: any) => (
                <div
                  key={reply.id}
                  className={`p-4 rounded-lg ${
                    reply.senderRole === "ADMIN"
                      ? "bg-green-50 dark:bg-green-950"
                      : "bg-blue-50 dark:bg-blue-950"
                  }`}
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {reply.senderRole === "ADMIN" ? "You (Landlord)" : viewMsg.tenant.name} •{" "}
                    {new Date(reply.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {reply.message}
                  </p>
                </div>
              ))}

              {/* Reply input */}
              <div className="border-t dark:border-gray-700 pt-4 space-y-2">
                <p className="text-sm font-medium">Reply</p>
                <Textarea
                  rows={3}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                />
                <Button
                  onClick={() => handleReply(viewMsg.id)}
                  disabled={sending || !reply.trim()}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" /> Send Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}