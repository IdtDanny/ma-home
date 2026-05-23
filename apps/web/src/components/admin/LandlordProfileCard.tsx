// "use client";

// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Pencil, Home, Phone, Mail } from "lucide-react";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";

// interface LandlordUser {
//   id: string;
//   name: string;
//   email: string;
//   phone: string | null;
//   adminProperties: {
//     id: string;
//     name: string;
//     address: string | null;
//     units: { id: string; name: string }[];
//   }[];
// }

// export default function LandlordProfileCard({ user }: { user: LandlordUser }) {
//   const router = useRouter();
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState({
//     name: user.name,
//     email: user.email,
//     phone: user.phone || "",
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     const res = await fetch("/api/landlord/profile", {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(form),
//     });
//     if (res.ok) {
//       toast.success("Profile updated.");
//       setOpen(false);
//       router.refresh();
//     } else {
//       const data = await res.json().catch(() => ({}));
//       toast.error(data.error || "Update failed.");
//     }
//     setLoading(false);
//   };

//   return (
//     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
//       <Card className="dark:bg-gray-900 dark:border-gray-800">
//         <CardHeader className="flex flex-row items-center justify-between">
//           <div>
//             <CardTitle className="text-xl">{user.name}</CardTitle>
//             <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
//               <Mail className="h-4 w-4" /> {user.email}
//             </p>
//             {user.phone && (
//               <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
//                 <Phone className="h-4 w-4" /> {user.phone}
//               </p>
//             )}
//           </div>
//           <div className="flex items-center gap-2">
//             <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300">
//               Free Plan
//             </Badge>
//             <Dialog open={open} onOpenChange={setOpen}>
//               <DialogTrigger asChild>
//                 <Button variant="outline" size="sm">
//                   <Pencil className="mr-2 h-4 w-4" /> Edit Profile
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="dark:bg-gray-900">
//                 <DialogHeader>
//                   <DialogTitle>Edit Personal Info</DialogTitle>
//                 </DialogHeader>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div>
//                     <Label>Name</Label>
//                     <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
//                   </div>
//                   <div>
//                     <Label>Email</Label>
//                     <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
//                   </div>
//                   <div>
//                     <Label>Phone</Label>
//                     <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
//                   </div>
//                   <Button type="submit" disabled={loading} className="w-full">
//                     {loading ? "Saving..." : "Save Changes"}
//                   </Button>
//                 </form>
//               </DialogContent>
//             </Dialog>
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {/* Properties */}
//           <div>
//             <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
//               Your Properties
//             </h3>
//             {user.adminProperties.length === 0 ? (
//               <p className="text-gray-400 text-sm">No properties added yet.</p>
//             ) : (
//               <div className="grid gap-4 sm:grid-cols-2">
//                 {user.adminProperties.map((prop) => (
//                   <div
//                     key={prop.id}
//                     className="border dark:border-gray-700 rounded-lg p-4"
//                   >
//                     <div className="flex items-center gap-2 mb-2">
//                       <Home className="h-5 w-5 text-gray-600" />
//                       <h4 className="font-medium">{prop.name}</h4>
//                     </div>
//                     {prop.address && (
//                       <p className="text-sm text-gray-500 dark:text-gray-400">
//                         {prop.address}
//                       </p>
//                     )}
//                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                       {prop.units.length} unit{prop.units.length !== 1 ? "s" : ""}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Owner/Representative Details (static for now) */}
//           <div className="border-t dark:border-gray-700 pt-4">
//             <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
//               Owner / Representative
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
//               <InfoBox label="Full Name" value={user.name} />
//               <InfoBox label="Email" value={user.email} />
//               <InfoBox label="Phone" value={user.phone || "—"} />
//               <InfoBox label="Role" value="Landlord / Property Manager" />
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// }

// function InfoBox({ label, value }: { label: string; value: string }) {
//   return (
//     <div>
//       <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{label}</p>
//       <p className="font-medium text-gray-800 dark:text-gray-200">{value}</p>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Home,
  Mail,
  Phone,
  User,
  Building2,
  DollarSign,
  Hash,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import AvatarUpload from "@/components/AvatarUpload";

interface LandlordUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  adminProperties: {
    id: string;
    name: string;
    address: string | null;
    units: { id: string; name: string }[];
  }[];
}

export default function LandlordProfileCard({ user }: { user: LandlordUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/landlord/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Profile updated.");
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Update failed.");
    }
    setLoading(false);
  };

  const updateImage = async (url: string) => {
    await fetch("/api/user/image", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: url }),
    });
    router.refresh();
  };

  const totalUnits = user.adminProperties.reduce(
    (sum, prop) => sum + prop.units.length,
    0
  );
  const totalProperties = user.adminProperties.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <Card className="dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
        {/* Header Gradient */}
        <div className="p-6 sm:p-8 text-gray-700 dark:text-gray-300">
        {/* <div className="bg-gradient-to-r from-gray-400 to-gray-700 p-6 sm:p-8 text-white"> */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <AvatarUpload
              currentImage={user.image || null}
              onUploadComplete={updateImage}
            />
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
              <p className="text-gray-400 text-sm">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="border-gray-500 dark:border-gray-300 text-gray-500 dark:text-gray-300"
                >
                  Landlord
                </Badge>
                <Badge
                  variant="outline"
                  className="border-gray-500 dark:border-gray-300 text-gray-500 dark:text-gray-300"
                >
                  {totalProperties} Properties · {totalUnits} Units
                </Badge>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-gray-700 dark:bg-gray-200 text-gray-100 dark:text-gray-700 p-4 hover:bg-gray-400"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-gray-900">
                <DialogHeader>
                  <DialogTitle>Edit Personal Info</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Personal Details */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard
                icon={Mail}
                label="Email"
                value={user.email}
              />
              <InfoCard
                icon={Phone}
                label="Phone"
                value={user.phone || "—"}
              />
              <InfoCard
                icon={User}
                label="Role"
                value="Landlord / Property Manager"
              />
            </div>
          </div>

          {/* Portfolio Summary */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              Property Portfolio
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard
                icon={Hash}
                label="Total Properties"
                value={totalProperties.toString()}
              />
              <InfoCard
                icon={Home}
                label="Total Units"
                value={totalUnits.toString()}
              />
            </div>
          </div>

          {/* Property List */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              Your Properties
            </h2>
            {user.adminProperties.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                No properties added yet.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {user.adminProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="border dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">
                        {prop.name}
                      </h3>
                    </div>
                    {prop.address && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {prop.address}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {prop.units.length} unit{prop.units.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-full">
        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
          {label}
        </p>
        <p className="font-medium text-gray-800 dark:text-gray-200">
          {value}
        </p>
      </div>
    </div>
  );
}