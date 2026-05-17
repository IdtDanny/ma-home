// import { NextResponse } from "next/server";
// import { auth } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import { z } from "zod";

// const clearanceSchema = z.object({
//   endDate: z.string(),
//   propertyCondition: z.enum(["Good", "Acceptable", "Minor repairs required"]),
//   repairDetails: z.string().optional(),
//   securityDeposit: z.number().optional(),
//   depositAction: z.enum(["fully_refunded", "partially_refunded", "retained"]).optional(),
//   refundAmount: z.number().optional(),
//   depositRetainedReason: z.string().optional(),
//   rentCleared: z.boolean(),
//   utilitiesCleared: z.boolean(),
//   serviceChargesCleared: z.boolean(),
//   damagesCleared: z.boolean(),
// });

// export async function POST(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const session = await auth();
//   if (!session?.user || session.user.role !== "ADMIN")
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const { id } = await params;
//   const tenant = await prisma.tenant.findFirst({
//     where: {
//       id,
//       unit: { property: { adminId: session.user.id } },
//     },
//     include: {
//       user: true,
//       unit: { include: { property: true } },
//       bills: true,
//     },
//   });

//   if (!tenant)
//     return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

//   const body = await req.json();
//   const parsed = clearanceSchema.safeParse(body);
//   if (!parsed.success)
//     return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

//   // Generate certificate text (simplified)
//   const content = `TENANT DEBT CLEARANCE CERTIFICATE
// Date: ${new Date().toLocaleDateString()}
// ...
// LANDLORD CONFIRMATION
// Landlord/Property Manager Name: ${session.user.name}
// Signature: ${session.user.name}
// Phone: ${session.user.phone || ""}`;

//   // Create certificate record
//   await prisma.clearanceCertificate.create({
//     data: {
//       tenantName: tenant.user.name,
//       nationalId: tenant.nationalId,
//       propertyAddress: tenant.unit.property.address || tenant.unit.property.name,
//       startDate: tenant.startDate,
//       endDate: new Date(parsed.data.endDate),
//       rentCleared: parsed.data.rentCleared,
//       utilitiesCleared: parsed.data.utilitiesCleared,
//       serviceChargesCleared: parsed.data.serviceChargesCleared,
//       damagesCleared: parsed.data.damagesCleared,
//       propertyCondition: parsed.data.propertyCondition,
//       repairDetails: parsed.data.repairDetails,
//       securityDeposit: parsed.data.securityDeposit,
//       depositRefunded:
//         parsed.data.depositAction === "fully_refunded"
//           ? true
//           : parsed.data.depositAction === "partially_refunded"
//           ? false
//           : null,
//       refundAmount: parsed.data.refundAmount,
//       depositRetainedReason: parsed.data.depositRetainedReason,
//       landlordName: session.user.name ?? "",
//       landlordSignature: session.user.name ?? "",
//       landlordPhone: session.user.phone || "",
//       tenantEmail: tenant.user.email,
//       tenantPhone: tenant.user.phone,
//       // content: content, // optional: store the full text if you want
//     },
//   });

//   // Delete the user (which cascades to tenant, bills, payments, contracts, etc.)
//   await prisma.user.delete({ where: { id: tenant.userId } });

//   return NextResponse.json({ success: true });
// }

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const clearanceSchema = z.object({
  endDate: z.string(),
  propertyCondition: z.enum(["Good", "Acceptable", "Minor repairs required"]),
  repairDetails: z.string().optional(),
  securityDeposit: z.number().optional(),
  depositAction: z.enum(["fully_refunded", "partially_refunded", "retained"]).optional(),
  refundAmount: z.number().optional(),
  depositRetainedReason: z.string().optional(),
  rentCleared: z.boolean(),
  utilitiesCleared: z.boolean(),
  serviceChargesCleared: z.boolean(),
  damagesCleared: z.boolean(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const tenant = await prisma.tenant.findFirst({
      where: {
        id,
        unit: { property: { adminId: session.user.id } },
      },
      include: {
        user: true,
        unit: { include: { property: true } },
        bills: true,
      },
    });

    if (!tenant)
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const body = await req.json();
    const parsed = clearanceSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    // Save the clearance certificate
    await prisma.clearanceCertificate.create({
      data: {
        tenantName: tenant.user.name,
        nationalId: tenant.nationalId,
        propertyAddress: tenant.unit.property.address || tenant.unit.property.name,
        startDate: tenant.startDate,
        endDate: new Date(parsed.data.endDate),
        rentCleared: parsed.data.rentCleared,
        utilitiesCleared: parsed.data.utilitiesCleared,
        serviceChargesCleared: parsed.data.serviceChargesCleared,
        damagesCleared: parsed.data.damagesCleared,
        propertyCondition: parsed.data.propertyCondition,
        repairDetails: parsed.data.repairDetails,
        securityDeposit: parsed.data.securityDeposit,
        depositRefunded:
          parsed.data.depositAction === "fully_refunded" ? true
            : parsed.data.depositAction === "partially_refunded" ? false
            : null,
        refundAmount: parsed.data.refundAmount,
        depositRetainedReason: parsed.data.depositRetainedReason,
        landlordName: session.user.name || "",
        landlordSignature: session.user.name || "",
        landlordPhone: session.user.phone || "",
        tenantEmail: tenant.user.email,
        tenantPhone: tenant.user.phone,
      },
    });

    // Delete the user (cascades to all related data)
    await prisma.user.delete({ where: { id: tenant.userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete with clearance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}