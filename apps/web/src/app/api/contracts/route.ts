import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const contractSchema = z.object({
  tenantId: z.string(),
  startDate: z.string(), // ISO string
  endDate: z.string(),
  monthlyRent: z.number().positive(),
  deposit: z.number().optional(),
  utilities: z.record(z.string()).optional(), // e.g., { electricity: "tenant" }
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = contractSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Verify tenant exists and belongs to admin's property
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: parsed.data.tenantId,
      unit: { property: { adminId: session.user.id } },
    },
    include: {
      user: true,
      unit: { include: { property: true } },
    },
  });
  if (!tenant)
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  // Generate contract text from template
  const content = generateContract({
    tenantName: tenant.user.name,
    tenantPhone: tenant.user.phone || "",
    tenantAddress: `${tenant.unit.property.name}, ${tenant.unit.name}`,
    landlordName: session.user.name || "Landlord",
    landlordPhone: "", // you may fetch from admin profile
    landlordAddress: tenant.unit.property.address || "",
    propertyAddress: tenant.unit.property.address || tenant.unit.property.name,
    propertyType: "Room", // could be dynamic
    startDate: new Date(parsed.data.startDate).toLocaleDateString(),
    endDate: new Date(parsed.data.endDate).toLocaleDateString(),
    monthlyRent: parsed.data.monthlyRent,
    deposit: parsed.data.deposit,
    utilities: parsed.data.utilities || {},
  });

  const contract = await prisma.contract.create({
    data: {
      tenantId: parsed.data.tenantId,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      monthlyRent: parsed.data.monthlyRent,
      deposit: parsed.data.deposit,
      utilities: parsed.data.utilities || {},
      content,
    },
  });

  return NextResponse.json({ success: true, contract });
}

// Helper: fill the template (simplified version)
function generateContract(data: Record<string, any>) {
  return `PROPERTY RENTAL AGREEMENT
This Rental Agreement is made on ${new Date().toLocaleDateString()}, between:
Landlord:
Name: ${data.landlordName}
Address: ${data.landlordAddress}
Phone: ${data.landlordPhone}
AND
Tenant:
Name: ${data.tenantName}
Address: ${data.tenantAddress}
Phone: ${data.tenantPhone}

1. Property Details
The Landlord agrees to rent to the Tenant the following property:
Address: ${data.propertyAddress}
Type: ${data.propertyType}

2. Lease Term
The lease shall begin on ${data.startDate} and end on ${data.endDate}.

3. Rent Payment
Monthly Rent: ${data.monthlyRent} RWF
Payment Due Date: 5th of each month
Payment Method: Mobile Payment

4. Security Deposit
The Tenant shall pay a deposit of ${data.deposit || "N/A"} RWF.

5. Utilities
Utilities will be paid as follows:
${Object.entries(data.utilities).map(([key, val]) => `${key}: ${val}`).join("\n") || "All utilities included in rent"}

6. Use of Property
The property shall be used only for residential purposes. No illegal activities are allowed.

7. Maintenance and Repairs
Tenant agrees to maintain the property in good condition.
Landlord is responsible for major repairs.

8. Termination
Either party may terminate this agreement by giving 30 days written notice.

9. Rules and Regulations
No subletting without landlord permission.

10. Inspection
The landlord may inspect the property with prior notice.

11. Signatures
Landlord Signature: ________________________
Date: ______________________
Tenant Signature: ________________________
Date: ______________________`;
}