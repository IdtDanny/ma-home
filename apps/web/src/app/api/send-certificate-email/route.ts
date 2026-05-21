import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "LANDLORD")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { certificateId } = await req.json();
  const cert = await prisma.clearanceCertificate.findUnique({
    where: { id: certificateId },
  });
  if (!cert || !cert.tenantEmail)
    return NextResponse.json({ error: "Invalid certificate or missing email" }, { status: 400 });

  // Configure transporter (use Gmail App Password or other SMTP)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: cert.tenantEmail,
      subject: `Clearance Certificate - ${cert.tenantName}`,
      text: cert.content || "Your clearance certificate is attached.",
      attachments: cert.content
        ? [
            {
              filename: `clearance-${cert.id}.pdf`,
              content: cert.content,
            },
          ]
        : undefined,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Email could not be sent" }, { status: 500 });
  }
}