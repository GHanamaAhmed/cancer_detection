import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export interface Patient {
  id: string;
  name: string;
  image?: string;
  initials: string;
  appointment?: string;
  time?: string;
  risk: "low" | "medium" | "high";
  connectionStatus?: "connected" | "pending" | "not_connected" | "declined";
}

interface PatientListProps {
  patients: Patient[];
}

export function PatientList({ patients }: PatientListProps) {
  if (patients.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-500">
        No patients found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <Link
          key={patient.id}
          href={`/dashboard/patients/${patient.id}`}
          className="block"
        >
          <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={patient.image || "/placeholder.svg"}
                  alt={patient.name}
                />
                <AvatarFallback>{patient.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{patient.name}</p>
                <p className="text-sm text-gray-500">{patient.appointment}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {patient.connectionStatus && (
                <Badge
                  variant="outline"
                  className={cn(
                    patient.connectionStatus === "connected" &&
                      "border-green-500 text-green-600",
                    patient.connectionStatus === "pending" &&
                      "border-yellow-500 text-yellow-600",
                    patient.connectionStatus === "declined" &&
                      "border-red-500 text-red-600",
                    patient.connectionStatus === "not_connected" &&
                      "border-gray-500 text-gray-600"
                  )}
                >
                  {patient.connectionStatus === "connected" && "Connected"}
                  {patient.connectionStatus === "pending" && "Pending"}
                  {patient.connectionStatus === "declined" && "Declined"}
                  {patient.connectionStatus === "not_connected" &&
                    "Not Connected"}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={cn(
                  patient.risk === "low" && "border-green-500 text-green-600",
                  patient.risk === "medium" &&
                    "border-yellow-500 text-yellow-600",
                  patient.risk === "high" && "border-red-500 text-red-600"
                )}
              >
                {patient.risk}
              </Badge>
              {patient.time && (
                <div className="text-sm font-medium">{patient.time}</div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
