"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus, Home, DoorOpen } from "lucide-react";
import toast from "react-hot-toast";

interface Unit {
  id: string;
  name: string;
  propertyId: string;
}

interface Property {
  id: string;
  name: string;
  address: string | null;
  units: Unit[];
}

export default function PropertyList({
  initialProperties,
}: {
  initialProperties: Property[];
}) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyForm, setPropertyForm] = useState({ name: "", address: "" });
  const [unitForm, setUnitForm] = useState({ name: "", propertyId: "" });
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);

  const resetPropertyForm = () => {
    setPropertyForm({ name: "", address: "" });
    setEditingProperty(null);
  };

  const resetUnitForm = () => {
    setUnitForm({ name: "", propertyId: "" });
  };

  // ── Property CRUD ────────────────────────────────────────────
  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProperty
      ? `/api/properties/${editingProperty.id}`
      : "/api/properties";
    const method = editingProperty ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(propertyForm),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingProperty) {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === editingProperty.id ? { ...p, ...propertyForm } : p
          )
        );
        toast.success("Property updated.");
      } else {
        setProperties((prev) => [...prev, data.property]);
        toast.success("Property created.");
      }
      setPropertyDialogOpen(false);
      resetPropertyForm();
    } else {
      toast.error("Operation failed.");
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Delete this property and all its units?")) return;
    const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      toast.success("Property deleted.");
    }
  };

  // ── Unit CRUD ─────────────────────────────────────────────────
  const handleUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unitForm),
    });

    if (res.ok) {
      const data = await res.json();
      setProperties((prev) =>
        prev.map((p) =>
          p.id === unitForm.propertyId
            ? { ...p, units: [...p.units, data.unit] }
            : p
        )
      );
      toast.success("Unit created.");
      setUnitDialogOpen(false);
      resetUnitForm();
    } else {
      toast.error("Failed to create unit.");
    }
  };

  const handleDeleteUnit = async (unitId: string, propertyId: string) => {
    if (!confirm("Delete this unit?")) return;
    const res = await fetch(`/api/units/${unitId}`, { method: "DELETE" });
    if (res.ok) {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId
            ? { ...p, units: p.units.filter((u) => u.id !== unitId) }
            : p
        )
      );
      toast.success("Unit deleted.");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Properties</h2>
        <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetPropertyForm();
                setEditingProperty(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Property
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProperty ? "Edit Property" : "New Property"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePropertySubmit} className="space-y-4">
              <div>
                <Label>Property Name</Label>
                <Input
                  required
                  value={propertyForm.name}
                  onChange={(e) =>
                    setPropertyForm({ ...propertyForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Address (optional)</Label>
                <Input
                  value={propertyForm.address}
                  onChange={(e) =>
                    setPropertyForm({
                      ...propertyForm,
                      address: e.target.value,
                    })
                  }
                />
              </div>
              <Button type="submit">
                {editingProperty ? "Save Changes" : "Create Property"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Property Cards ────────────────────────── */}
      {properties.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No properties yet. Add your first property.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {properties.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary-600" />
                      <CardTitle>{property.name}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingProperty(property);
                          setPropertyForm({
                            name: property.name,
                            address: property.address ?? "",
                          });
                          setPropertyDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProperty(property.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {property.address && (
                      <p className="text-sm text-gray-500 mb-3">
                        {property.address}
                      </p>
                    )}

                    {/* Units list */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Units</h4>
                        <Dialog
                          open={unitDialogOpen}
                          onOpenChange={setUnitDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setUnitForm({
                                  name: "",
                                  propertyId: property.id,
                                })
                              }
                            >
                              <Plus className="mr-1 h-3 w-3" /> Add Unit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Unit</DialogTitle>
                            </DialogHeader>
                            <form
                              onSubmit={handleUnitSubmit}
                              className="space-y-4"
                            >
                              <div>
                                <Label>Unit Name (e.g., Room A)</Label>
                                <Input
                                  required
                                  value={unitForm.name}
                                  onChange={(e) =>
                                    setUnitForm({
                                      ...unitForm,
                                      name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <input
                                type="hidden"
                                value={unitForm.propertyId}
                              />
                              <Button type="submit">Create Unit</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {property.units.length === 0 ? (
                        <p className="text-xs text-gray-400">No units yet.</p>
                      ) : (
                        <ul className="divide-y">
                          {property.units.map((unit) => (
                            <li
                              key={unit.id}
                              className="flex items-center justify-between py-2"
                            >
                              <div className="flex items-center gap-2">
                                <DoorOpen className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{unit.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDeleteUnit(unit.id, property.id)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}