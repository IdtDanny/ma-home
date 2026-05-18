"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MailOpen, Mail, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function MessagesList({ initialMessages }: { initialMessages: any[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [viewMsg, setViewMsg] = useState<any>(null);

  const toggleRead = async (id: string, currentRead: boolean) => {
    const res = await fetch(`/api/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: !currentRead }),
    });
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isRead: !currentRead } : m))
      );
    }
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
              <Card className={`dark:bg-gray-900 dark:border-gray-800 ${msg.isRead ? "opacity-70" : ""}`}>
                <CardHeader className="flex flex-row items-center justify-between p-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {msg.isRead ? <MailOpen className="h-5 w-5 text-gray-400" /> : <Mail className="h-5 w-5 text-primary-600" />}
                      {msg.subject}
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      From: {msg.tenant.name} ({msg.tenant.email}) • {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRead(msg.id, msg.isRead)}
                      title={msg.isRead ? "Mark as unread" : "Mark as read"}
                    >
                      {msg.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(msg.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {msg.message.substring(0, 150)}
                    {msg.message.length > 150 ? "..." : ""}
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={() => setViewMsg(msg)}
                  >
                    View full message
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Dialog open={!!viewMsg} onOpenChange={(open) => !open && setViewMsg(null)}>
        <DialogContent className="dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>{viewMsg?.subject}</DialogTitle>
          </DialogHeader>
          <div className="text-sm space-y-2">
            <p className="text-gray-500 dark:text-gray-400">
              From: {viewMsg?.tenant.name} ({viewMsg?.tenant.email}) • {new Date(viewMsg?.createdAt).toLocaleString()}
            </p>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{viewMsg?.message}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}