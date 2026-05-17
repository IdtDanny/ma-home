"use client";

import { Button } from "@/components/ui/button";
import { Download, Mail, Share2 } from "lucide-react";
import toast from "react-hot-toast";

interface Certificate {
  id: string;
  tenantName: string;
  propertyAddress: string;
  tenantEmail?: string | null;
  tenantPhone?: string | null;
  content?: string | null;
}

export default function CertificateActions({ cert }: { cert: Certificate }) {
  const downloadPDF = async () => {
    if (!cert.content) {
      toast.error("No certificate content available");
      return;
    }
    try {
      // Dynamically import pdfmake only on client
      const pdfMake = (await import("pdfmake/build/pdfmake")).default;
      const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
      pdfMake.vfs = pdfFonts;

      const docDefinition = {
        content: [{ text: cert.content, fontSize: 10 }],
        defaultStyle: { font: "Helvetica" },
      };
      pdfMake.createPdf(docDefinition).download(`clearance-${cert.id}.pdf`);
      toast.success("PDF downloaded");
    } catch (err) {
      toast.error("Could not generate PDF");
      console.error(err);
    }
  };

  const sendEmail = async () => {
    if (!cert.tenantEmail) {
      toast.error("No email on file for this tenant");
      return;
    }
    const res = await fetch("/api/send-certificate-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificateId: cert.id }),
    });
    if (res.ok) {
      toast.success("Email sent");
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Failed to send email");
    }
  };

  const shareWhatsApp = () => {
    if (!cert.content) {
      toast.error("No certificate content to share");
      return;
    }
    const text = encodeURIComponent(
      `Tenant Clearance Certificate for ${cert.tenantName}\n\n${cert.content}`
    );
    const phone = cert.tenantPhone?.replace(/\+/g, "") || "";
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={downloadPDF}>
        <Download className="mr-1 h-4 w-4" /> PDF
      </Button>
      {cert.tenantEmail && (
        <Button variant="outline" size="sm" onClick={sendEmail}>
          <Mail className="mr-1 h-4 w-4" /> Email
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={shareWhatsApp}>
        <Share2 className="mr-1 h-4 w-4" /> WhatsApp
      </Button>
    </div>
  );
}