export type TenantWithRelations = {
  id: string;
  userId: string;
  unitId: string;
  rentAmount: number;
  startDate: Date;
  isActive: boolean;
  nationalId: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  numberOfOccupants: number | null;
  occupants: Occupant[];
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  unit: {
    id: string;
    name: string;
    property: { name: string };
  };
  bills: {
    id: string;
    type: string;
    amount: number;
    status: string;
    period: string;
  }[];
};

export type Occupant = {
  id: string;
  name: string;
  phone: string | null;
  relation: string | null;
};