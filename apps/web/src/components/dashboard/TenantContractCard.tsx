"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContractProps {
  unit: { name: string; property: { name: string } };
  rentAmount: number;
  startDate: Date;
  isActive: boolean;
}

export default function TenantContractCard({ unit, rentAmount, startDate, isActive }: ContractProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            My Contract
            <Badge variant={isActive ? "default" : "destructive"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Property</dt>
              <dd className="font-medium">{unit.property.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Unit</dt>
              <dd className="font-medium">{unit.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Monthly Rent</dt>
              <dd className="font-medium">{rentAmount.toLocaleString()} RWF</dd>
            </div>
            <div>
              <dt className="text-gray-500">Move‑in Date</dt>
              <dd className="font-medium">{new Date(startDate).toLocaleDateString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </motion.div>
  );
}