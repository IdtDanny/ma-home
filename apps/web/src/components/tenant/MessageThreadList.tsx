"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, MailOpen } from "lucide-react";

interface Reply {
  id: string;
  message: string;
  senderRole: string;
  createdAt: Date;
  isRead: boolean;
}

interface Thread {
  id: string;
  subject: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  replies: Reply[];
}

export default function MessageThreadList({ threads }: { threads: Thread[] }) {
  const [openThread, setOpenThread] = useState<Thread | null>(null);

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <motion.div
          key={thread.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            className={`cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800 ${
              thread.isRead ? "opacity-70" : ""
            }`}
            onClick={() => setOpenThread(thread)}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  {thread.replies.length > 0 ? (
                    <MailOpen className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Mail className="h-4 w-4 text-primary-600" />
                  )}
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    {thread.subject}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(thread.createdAt).toLocaleString()}
                </p>
              </div>
              {thread.replies.length > 0 ? (
                <Badge variant="outline">{thread.replies.length} reply</Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-600">Pending reply</Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Thread View Dialog */}
      <Dialog open={!!openThread} onOpenChange={(open) => !open && setOpenThread(null)}>
        <DialogContent className="max-w-2xl dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{openThread?.subject}</DialogTitle>
          </DialogHeader>
          {openThread && (
            <div className="space-y-4">
              {/* Original message */}
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  You • {new Date(openThread.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {openThread.message}
                </p>
              </div>

              {/* Replies */}
              {openThread.replies.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm italic">
                  No response yet.
                </p>
              ) : (
                openThread.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="bg-green-50 dark:bg-green-950 p-4 rounded-lg"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Landlord • {new Date(reply.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {reply.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}