// "use client";
// import { motion } from "framer-motion";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

// interface ContractProps {
//   unit: { name: string; property: { name: string } };
//   rentAmount: number;
//   startDate: Date;
//   isActive: boolean;
// }

// export default function TenantContractCard({ unit, rentAmount, startDate, isActive }: ContractProps) {
//   return (
//     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center justify-between">
//             My Contract
//             <Badge variant={isActive ? "default" : "destructive"}>
//               {isActive ? "Active" : "Inactive"}
//             </Badge>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <dl className="grid grid-cols-2 gap-4 text-sm">
//             <div>
//               <dt className="text-gray-500">Property</dt>
//               <dd className="font-medium">{unit.property.name}</dd>
//             </div>
//             <div>
//               <dt className="text-gray-500">Unit</dt>
//               <dd className="font-medium">{unit.name}</dd>
//             </div>
//             <div>
//               <dt className="text-gray-500">Monthly Rent</dt>
//               <dd className="font-medium">{rentAmount.toLocaleString()} RWF</dd>
//             </div>
//             <div>
//               <dt className="text-gray-500">Move‑in Date</dt>
//               <dd className="font-medium">{new Date(startDate).toLocaleDateString()}</dd>
//             </div>
//           </dl>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// }

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Download, FileText } from "lucide-react";
import toast from "react-hot-toast";

interface Contract {
  id: string;
  content: string | null;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  status: string;
  tenantSignature?: string | null;
  landlordSignature?: boolean;
  deposit?: number | null;
  utilities?: Record<string, string> | null;
}

interface TenantData {
  user: { name: string };
  unit: {
    name: string;
    property: {
      name: string;
      address?: string | null;
    };
  };
}

export default function TenantContractCard({
  contract,
  tenant,
}: {
  contract: Contract;
  tenant: TenantData;
}) {
  const [openView, setOpenView] = useState(false);

  const downloadPDF = async () => {
    if (!contract.content) {
      toast.error("No contract content available");
      return;
    }
    try {
      const pdfMake = (await import("pdfmake/build/pdfmake")).default;
      const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
      pdfMake.vfs = pdfFonts;

      const docDefinition = {
        content: [{ text: contract.content, fontSize: 10 }],
        defaultStyle: { font: "Roboto" },
      };
      pdfMake.createPdf(docDefinition).download(`contract-${contract.id}.pdf`);
      toast.success("Contract downloaded");
    } catch (err) {
      toast.error("Could not generate PDF");
      console.error(err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary-600" />
            My Rental Agreement
          </CardTitle>
          <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            Active
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Property</p>
              <p className="font-medium">
                {tenant.unit.property.name}
                {tenant.unit.property.address && (
                  <span className="block text-xs text-gray-400">
                    {tenant.unit.property.address}
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Unit</p>
              <p className="font-medium">{tenant.unit.name}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Monthly Rent</p>
              <p className="font-medium">{contract.monthlyRent.toLocaleString()} RWF</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Security Deposit</p>
              <p className="font-medium">
                {contract.deposit ? `${contract.deposit.toLocaleString()} RWF` : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Start Date</p>
              <p className="font-medium">
                {new Date(contract.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">End Date</p>
              <p className="font-medium">
                {new Date(contract.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Landlord Signature</p>
              <p className="font-medium">
                {contract.landlordSignature ? "✅ Signed" : "❌ Pending"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Tenant Signature</p>
              <p className="font-medium">
                {contract.tenantSignature ? `✅ Signed by ${contract.tenantSignature}` : "❌ Pending"}
              </p>
            </div>
          </div>

          {/* Utility breakdown (if present) */}
          {contract.utilities && Object.keys(contract.utilities).length > 0 && (
            <div className="border-t pt-4 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Utilities Responsibility</p>
              <ul className="text-sm space-y-1">
                {Object.entries(contract.utilities).map(([utility, who]) => (
                  <li key={utility} className="flex justify-between">
                    <span className="capitalize">{utility}</span>
                    <span className="font-medium">{who}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions: View & Download */}
          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <Button variant="outline" size="sm" onClick={() => setOpenView(true)}>
              <Eye className="mr-1 h-4 w-4" /> View Full Contract
            </Button>
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="mr-1 h-4 w-4" /> Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View Contract Dialog */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="max-w-2xl dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Rental Agreement</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            {contract.content || "No contract text available."}
          </pre>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}