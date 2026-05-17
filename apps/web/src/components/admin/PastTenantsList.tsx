"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import CertificateActions from "./CertificateActions";

interface Certificate {
  id: string;
  tenantName: string;
  propertyAddress: string;
  endDate: Date;
  content?: string | null;
  tenantEmail?: string | null;
  tenantPhone?: string | null;
}

export default function PastTenantsList({
  certificates,
}: {
  certificates: Certificate[];
}) {
  const router = useRouter();
  const [list, setList] = useState(certificates);
  const [viewingCert, setViewingCert] = useState<Certificate | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this certificate permanently?")) return;
    const res = await fetch(`/api/certificates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setList((prev) => prev.filter((c) => c.id !== id));
      toast.success("Certificate deleted.");
    } else {
      toast.error("Failed to delete certificate.");
    }
  };

  return (
    <div className="space-y-4">
      {list.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No past tenants found.
        </p>
      ) : (
        <>
          {/* ── Mobile: Cards (visible only on small screens) ── */}
          <div className="md:hidden space-y-4">
            <AnimatePresence>
              {list.map((cert) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="dark:bg-gray-900 dark:border-gray-800">
                    <CardHeader className="flex flex-row items-start justify-between p-4">
                      <div>
                        <CardTitle className="text-base">
                          {cert.tenantName}
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {cert.propertyAddress}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingCert(cert)}
                          title="View Certificate"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cert.id)}
                          title="Delete Certificate"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Move‑out: {new Date(cert.endDate).toLocaleDateString()}
                      </p>
                      <CertificateActions cert={cert} />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Desktop: Table (hidden on small screens) ── */}
          <div className="hidden md:block overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Move‑out Date</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {list.map((cert) => (
                    <motion.tr
                      key={cert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="border-b dark:border-gray-800"
                    >
                      <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                        {cert.tenantName}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {cert.propertyAddress}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {new Date(cert.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {cert.tenantEmail || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <CertificateActions cert={cert} />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingCert(cert)}
                            title="View Certificate"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cert.id)}
                            title="Delete Certificate"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* ── View Certificate Dialog (shared) ── */}
      <Dialog
        open={!!viewingCert}
        onOpenChange={(open) => !open && setViewingCert(null)}
      >
        <DialogContent className="max-w-2xl dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clearance Certificate</DialogTitle>
          </DialogHeader>
          {viewingCert && (
            <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {viewingCert.content || "No certificate content available."}
            </pre>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}