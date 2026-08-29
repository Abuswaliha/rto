import { VehicleTransferService } from "@/components/vehicle-transfer";

export const metadata = {
  title: "Vehicle Ownership Transfer (Form 29 & 30) | Smart RTO",
  description: "Apply online for vehicle ownership transfer, NOC endorsement, and RC update.",
};

export default function Page() {
  return <VehicleTransferService mode="transfer" />;
}
