"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Plus,
  Home,
  Building,
  Check,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/guards/auth-guard";
import { useAuth } from "@/providers/auth-provider";
import { updateUserProfile } from "@/services/users";
import { INDIAN_STATES, getDistrictsForState } from "@/config/india-locations";
import type { Address } from "@/types";

function AddressesContent() {
  const { user, userProfile, refreshProfile } = useAuth();
  const addresses: Address[] = userProfile?.addresses || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [label, setLabel] = useState<string>("Home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [state, setState] = useState("Tamil Nadu");
  const [city, setCity] = useState("Salem");
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const availableDistricts = React.useMemo(() => getDistrictsForState(state), [state]);

  const handleStateChange = (newState: string) => {
    setState(newState);
    const districts = getDistrictsForState(newState);
    if (districts.length > 0) {
      if (districts.includes(city)) {
        setIsCustomCity(false);
      } else {
        setCity(districts[0]);
        setIsCustomCity(false);
      }
    } else {
      setIsCustomCity(true);
    }
  };

  const handleDistrictChange = (val: string) => {
    if (val === "__custom__") {
      setIsCustomCity(true);
      setCity("");
    } else {
      setIsCustomCity(false);
      setCity(val);
    }
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setLabel("Home");
    setFullName(userProfile?.displayName || "");
    setPhone(userProfile?.phone || "");
    setLine1("");
    setLine2("");
    setState("Tamil Nadu");
    setCity("Salem");
    setIsCustomCity(false);
    setPostalCode("");
    setIsDefault(addresses.length === 0);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setLabel(addr.label || "Home");
    setFullName(addr.fullName || "");
    setPhone(addr.phone || "");
    setLine1(addr.line1 || "");
    setLine2(addr.line2 || "");
    const addrState = addr.state || "Tamil Nadu";
    setState(addrState);
    const districts = getDistrictsForState(addrState);
    const addrCity = addr.city || "Salem";
    setCity(addrCity);
    setIsCustomCity(districts.length > 0 && !districts.includes(addrCity));
    setPostalCode(addr.postalCode || "");
    setIsDefault(Boolean(addr.isDefault));
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Please enter recipient's full name.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!line1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setErrorMessage("Please complete all required address fields.");
      return;
    }

    setIsSaving(true);
    try {
      let updatedAddresses: Address[] = [...addresses];

      const addressData: Address = {
        id: editingAddress?.id || `addr-${Date.now()}`,
        label: label.trim() || "Home",
        fullName: fullName.trim(),
        phone: phone.trim(),
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: "India",
        isDefault: isDefault || addresses.length === 0,
      };

      if (isDefault) {
        // Mark all existing as not default
        updatedAddresses = updatedAddresses.map((a) => ({
          ...a,
          isDefault: false,
        }));
      }

      if (editingAddress) {
        // Edit existing
        updatedAddresses = updatedAddresses.map((a) =>
          a.id === editingAddress.id ? addressData : a
        );
      } else {
        // Append new
        updatedAddresses.push(addressData);
      }

      // If only one address, it must be default
      if (updatedAddresses.length === 1) {
        updatedAddresses[0].isDefault = true;
      }

      await updateUserProfile(user.uid, { addresses: updatedAddresses });
      await refreshProfile();
      setIsModalOpen(false);
    } catch (err: unknown) {
      console.error("Failed to save address:", err);
      setErrorMessage((err as Error)?.message || "Failed to save address.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (addrId: string) => {
    if (!user?.uid) return;
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === addrId,
    }));
    try {
      await updateUserProfile(user.uid, { addresses: updated });
      await refreshProfile();
    } catch (err) {
      console.error("Failed to set default address:", err);
    }
  };

  const handleDelete = async (addrId: string) => {
    if (!user?.uid) return;
    if (!confirm("Are you sure you want to remove this delivery address?")) return;

    const remaining = addresses.filter((a) => a.id !== addrId);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }

    try {
      await updateUserProfile(user.uid, { addresses: remaining });
      await refreshProfile();
    } catch (err) {
      console.error("Failed to delete address:", err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Account</span>
          </Link>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={openAddModal}
            className="flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-xl bg-neutral-900 hover:bg-black text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Address</span>
          </Button>
        </div>

        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Saved Delivery Addresses
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-light">
            Manage your delivery locations. Your default address is automatically auto-filled during checkout.
          </p>
        </div>

        {/* Addresses Grid */}
        {addresses.length === 0 ? (
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-8 sm:p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-neutral-900">No Saved Addresses</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                You haven&apos;t saved any delivery addresses yet. Add an address now to enjoy instant 1-click checkout.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Address</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => {
              const isDefaultAddr = Boolean(addr.isDefault);
              const isWork = addr.label?.toLowerCase() === "work" || addr.label?.toLowerCase() === "office";

              return (
                <div
                  key={addr.id}
                  className={`bg-white rounded-2xl p-5 border transition-all duration-200 space-y-3 relative flex flex-col justify-between ${
                    isDefaultAddr
                      ? "border-rose-400/80 shadow-xs ring-1 ring-rose-400/30"
                      : "border-neutral-200/80 hover:border-neutral-300"
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Label & Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-neutral-100 text-neutral-800">
                          {isWork ? (
                            <Building className="w-3 h-3 text-neutral-600" />
                          ) : (
                            <Home className="w-3 h-3 text-neutral-600" />
                          )}
                          <span>{addr.label || "Home"}</span>
                        </span>

                        {isDefaultAddr && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>Default</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(addr)}
                          title="Edit address"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(addr.id)}
                          title="Delete address"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Recipient Details */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{addr.fullName}</span>
                      </h4>
                      <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-neutral-400" />
                        <span>+91 {addr.phone.replace(/^(\+91|91)/, "")}</span>
                      </p>
                    </div>

                    {/* Address Body */}
                    <div className="text-xs text-neutral-600 font-light leading-relaxed pt-1 border-t border-neutral-100">
                      <p>{addr.line1}</p>
                      {addr.line2 && <p>{addr.line2}</p>}
                      <p className="font-medium text-neutral-800 mt-0.5">
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Set as Default Action */}
                  {!isDefaultAddr && (
                    <div className="pt-2 border-t border-neutral-100">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[11px] text-neutral-600 hover:text-neutral-900 px-0 h-auto font-medium"
                      >
                        Set as Default Address
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add / Edit Address */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 isolate"
            role="dialog"
            aria-modal="true"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-neutral-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-neutral-900">
                    {editingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Label Select (Home, Work, Other) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Address Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Home", "Work", "Other"].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setLabel(lbl)}
                        className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                          label === lbl
                            ? "bg-rose-50 border-rose-300 text-rose-800 font-bold"
                            : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700">
                      10-Digit Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Address Line 1 */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">
                    House / Flat No., Building, Street <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    placeholder="e.g. 3/76 A, Jeeva Street"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>

                {/* Address Line 2 */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">
                    Area, Colony, Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    placeholder="e.g. Near Amman Kovil, Jagir Ammapalayam"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>

                {/* State, District/City, Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* State Dropdown */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden bg-white text-neutral-900 font-medium cursor-pointer"
                    >
                      <option value="" disabled>
                        Select State
                      </option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District / City Dropdown */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-neutral-700">
                        District / City <span className="text-rose-500">*</span>
                      </label>
                      {isCustomCity && availableDistricts.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomCity(false);
                            if (availableDistricts.length > 0) setCity(availableDistricts[0]);
                          }}
                          className="text-[10px] text-rose-600 hover:text-rose-700 underline font-medium cursor-pointer"
                        >
                          List view
                        </button>
                      )}
                    </div>

                    {isCustomCity || availableDistricts.length === 0 ? (
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Salem, Attur..."
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                      />
                    ) : (
                      <select
                        required
                        value={availableDistricts.includes(city) ? city : (city ? "__custom__" : "")}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden bg-white text-neutral-900 font-medium cursor-pointer"
                      >
                        <option value="" disabled>
                          Select District
                        </option>
                        {availableDistricts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                        <option value="__custom__">✏️ Other / Enter Manually...</option>
                      </select>
                    )}
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700">
                      Pincode <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="636302"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Set as Default Checkbox */}
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                  />
                  <span className="text-xs text-neutral-700 font-medium">
                    Make this my default delivery address
                  </span>
                </label>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSaving}
                    className="text-xs font-semibold bg-neutral-900 hover:bg-black text-white px-5"
                  >
                    {isSaving ? "Saving..." : "Save Address"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SavedAddressesPage() {
  return (
    <AuthGuard>
      <AddressesContent />
    </AuthGuard>
  );
}
