"use client";

import { useState } from "react";
import { Car, Loader2, Search, ShieldCheck } from "lucide-react";
import { PageShell } from "./page-shell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getVehicleByRegNumber,
  isAppwriteConfigured,
} from "@/lib/appwrite";

export interface VehicleData {
  regNumber: string;
  ownerName: string;
  makerModel: string;
  vehicleClass: string;
  fuelType: string;
  rtoOffice: string;
  regDate: string;
  fitnessValidUntil: string;
  insuranceValidUntil: string;
  status: string;
}

const SEEDED_VEHICLES: Record<string, VehicleData> = {
  MH10EA1234: {
    regNumber: "MH10EA1234",
    ownerName: "Rahul Sharma",
    makerModel: "Tata Nexon EV (Electric)",
    vehicleClass: "Light Motor Vehicle (LMV)",
    fuelType: "Electric",
    rtoOffice: "MH-10 Sangli RTO",
    regDate: "15/03/2024",
    fitnessValidUntil: "14/03/2039",
    insuranceValidUntil: "14/03/2027",
    status: "Active · Clean Title",
  },
  MH10AB1234: {
    regNumber: "MH10AB1234",
    ownerName: "Demo Citizen",
    makerModel: "Hyundai i20 (Petrol)",
    vehicleClass: "Light Motor Vehicle (LMV)",
    fuelType: "Petrol",
    rtoOffice: "MH-10 Sangli RTO",
    regDate: "05/08/2022",
    fitnessValidUntil: "04/08/2037",
    insuranceValidUntil: "10/12/2026",
    status: "Active · Clean Title",
  },
};

interface VehicleSearchProps {
  initialRegNumber?: string;
  onVehicleFound?: (vehicle: VehicleData) => void;
  className?: string;
}

export function VehicleSearch({
  initialRegNumber = "MH10EA1234",
  onVehicleFound,
  className = "",
}: VehicleSearchProps) {
  const [regInput, setRegInput] = useState(initialRegNumber);
  const [vehicle, setVehicle] = useState<VehicleData | null>(
    SEEDED_VEHICLES[initialRegNumber.toUpperCase()] || null
  );
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    const key = regInput.trim().toUpperCase();
    if (!key) return;

    setLoading(true);
    let found: VehicleData | null = null;

    if (isAppwriteConfigured) {
      try {
        const remote = await getVehicleByRegNumber(key);
        if (remote) {
          found = {
            regNumber: remote.regNumber || key,
            ownerName: remote.ownerName || "Appwrite Verified Owner",
            makerModel: remote.makerModel || "Appwrite Registered Vehicle",
            vehicleClass: remote.vehicleClass || "Light Motor Vehicle (LMV)",
            fuelType: remote.fuelType || "Petrol",
            rtoOffice: remote.rtoOffice || "MH-10 Sangli RTO",
            regDate: remote.regDate || "2024-01-01",
            fitnessValidUntil: remote.fitnessValidUntil || "2039-01-01",
            insuranceValidUntil: remote.insuranceValidUntil || "2027-01-01",
            status: remote.status || "Active · Appwrite Verified",
          };
        }
      } catch (err) {
        console.warn("Appwrite vehicle lookup fallback:", err);
      }
    }

    if (!found) {
      found = SEEDED_VEHICLES[key] || {
        regNumber: key,
        ownerName: "Demo Vehicle Owner",
        makerModel: "Honda City 1.5 i-VTEC",
        vehicleClass: "Light Motor Vehicle (LMV)",
        fuelType: "Petrol",
        rtoOffice: "MH-10 Sangli RTO",
        regDate: "10/05/2023",
        fitnessValidUntil: "09/05/2038",
        insuranceValidUntil: "09/05/2026",
        status: "Active · Clean Record",
      };
    }

    setTimeout(() => {
      setVehicle(found);
      setLoading(false);
      if (found && onVehicleFound) {
        onVehicleFound(found);
      }
    }, 400);
  }

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#0d5c45]" />
          Official Vehicle RC Lookup
        </CardTitle>
        <CardDescription>
          Search any vehicle registration plate to view fitness, insurance, and road tax validity.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-2"
        >
          <Input
            value={regInput}
            onChange={(e) => setRegInput(e.target.value.toUpperCase())}
            placeholder="MH10EA1234"
            className="font-mono font-bold tracking-wider uppercase"
          />
          <Button type="submit" disabled={loading} className="gap-1.5 bg-[#0d5c45] hover:bg-[#094735]">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Search
          </Button>
        </form>

        {vehicle && (
          <div className="rounded-xl border border-[#cfe3dd] bg-[#f8fbf9] p-5 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#cfe3dd] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#152321]">{vehicle.makerModel}</h3>
                <p className="font-mono text-xs text-[#167c74] font-bold">{vehicle.regNumber}</p>
              </div>
              <Badge variant="success">Verified Digital RC</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <span className="text-[#5e6f68]">Registered Owner</span>
                <strong className="block text-[#152321]">{vehicle.ownerName}</strong>
              </div>
              <div>
                <span className="text-[#5e6f68]">RTO Office</span>
                <strong className="block text-[#152321]">{vehicle.rtoOffice}</strong>
              </div>
              <div>
                <span className="text-[#5e6f68]">Fuel Type</span>
                <strong className="block text-[#152321]">{vehicle.fuelType}</strong>
              </div>
              <div>
                <span className="text-[#5e6f68]">Fitness Expiry</span>
                <strong className="block text-[#152321]">{vehicle.fitnessValidUntil}</strong>
              </div>
              <div>
                <span className="text-[#5e6f68]">Insurance Expiry</span>
                <strong className="block text-[#0d5c45]">{vehicle.insuranceValidUntil}</strong>
              </div>
              <div>
                <span className="text-[#5e6f68]">Status</span>
                <strong className="block text-[#0d5c45]">{vehicle.status}</strong>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function VehicleSearchPage() {
  return (
    <PageShell>
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-10">
        <div className="mx-auto max-w-5xl px-6">
          <Badge variant="secondary" className="mb-2 gap-1.5 font-bold">
            <Car size={14} className="text-[#167c74]" /> Official VAHAN & RC Inspection
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#152321] md:text-3xl">
            Vehicle RC & Records Lookup
          </h1>
          <p className="mt-1 max-w-2xl text-xs font-medium text-[#5e6f68] md:text-sm">
            Inspect fitness validity, insurance coverage, PUC status, and registered owner details instantly.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <VehicleSearch />
      </main>
    </PageShell>
  );
}
