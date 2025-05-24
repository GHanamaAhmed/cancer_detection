import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Check, X, RefreshCw } from "lucide-react";
import { prisma } from "@/lib/db";
import { updateAppointmentStatus } from "@/actions/appointment-actions";
import { getCurrentUser } from "@/lib/auth";

interface AppointmentDetailsProps {
  appointmentId?: string;
}

export async function AppointmentDetails({
  appointmentId,
}: AppointmentDetailsProps) {
  const user = await getCurrentUser();

  if (!appointmentId) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-gray-500">
        <p>No appointment selected</p>
        <p className="text-sm">
          Click on a date or appointment to view details
        </p>
      </div>
    );
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      doctor: {
        include: {
          profile: true,
        },
      },
      lesionCase: true,
    },
  });

  if (!appointment) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-gray-500">
        <p>Appointment not found</p>
      </div>
    );
  }

  // Format patient name
  const patientName = appointment.user.profile
    ? `${appointment.user.profile.firstName} ${appointment.user.profile.lastName}`
    : appointment.user.name || "Unknown Patient";

  // Format doctor name
  const doctorName = appointment.doctor.profile
    ? `${appointment.doctor.profile.firstName} ${appointment.doctor.profile.lastName}`
    : appointment.doctor.name || "Unknown Doctor";

  // Format patient initials
  const patientInitials = appointment.user.profile
    ? `${appointment.user.profile.firstName.charAt(
        0
      )}${appointment.user.profile.lastName.charAt(0)}`
    : appointment.user.name
        ?.split(" ")
        .map((n) => n.charAt(0))
        .join("") || "??";

  // Format appointment type
  const appointmentType = appointment.type.replace(/_/g, " ").toLowerCase();

  // Check if current user is the doctor
  const isDoctor = user?.id === appointment.doctorId;

  // Format appointment status for display
  const statusDisplay =
    appointment.status.charAt(0) +
    appointment.status.slice(1).toLowerCase().replace(/_/g, " ");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{appointmentType}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date(appointment.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>
            {new Date(appointment.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="mt-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              appointment.status === "CONFIRMED" &&
                "bg-green-100 text-green-800",
              appointment.status === "REQUESTED" && "bg-blue-100 text-blue-800",
              appointment.status === "COMPLETED" &&
                "bg-purple-100 text-purple-800",
              appointment.status === "CANCELED" && "bg-red-100 text-red-800",
              appointment.status === "RESCHEDULED" &&
                "bg-yellow-100 text-yellow-800"
            )}
          >
            {statusDisplay}
          </span>
        </div>
      </div>

      {appointment.reasonForVisit && (
        <div className="space-y-2">
          <h4 className="font-medium">Patient's Note</h4>
          <p className="text-sm text-gray-600">{appointment.reasonForVisit}</p>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="font-medium">Appointment Time</h4>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{new Date(appointment.date).toLocaleDateString()}</span>
          <Clock className="ml-2 h-4 w-4 text-gray-500" />
          <span>
            {new Date(appointment.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Patient's Name</h4>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={
                appointment.user.image || "/placeholder.svg?height=40&width=40"
              }
              alt={patientName}
            />
            <AvatarFallback>{patientInitials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{patientName}</p>
            <p className="text-sm text-gray-500">Dermatology Patient</p>
          </div>
        </div>
      </div>

      {appointment.lesionCase && (
        <div className="space-y-2">
          <h4 className="font-medium">Related Case:</h4>
          <a
            href={`/dashboard/patients/${appointment.user.id}/cases/${appointment.lesionCase.id}`}
            className="text-blue-600 hover:underline"
          >
            {appointment.lesionCase.caseNumber} -{" "}
            {appointment.lesionCase.lesionType.replace(/_/g, " ").toLowerCase()}
          </a>
          <span
            className={cn(
              "ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              appointment.lesionCase.riskLevel === "LOW" &&
                "bg-green-100 text-green-800",
              appointment.lesionCase.riskLevel === "MEDIUM" &&
                "bg-yellow-100 text-yellow-800",
              appointment.lesionCase.riskLevel === "HIGH" &&
                "bg-red-100 text-red-800",
              appointment.lesionCase.riskLevel === "CRITICAL" &&
                "bg-red-100 text-red-800"
            )}
          >
            {appointment.lesionCase.riskLevel.toLowerCase()} risk
          </span>
        </div>
      )}

      {isDoctor && appointment.status === "REQUESTED" && (
        <div className="flex gap-2">
          <form
            action={updateAppointmentStatus.bind(
              null,
              appointmentId,
              "CONFIRMED"
            )}
          >
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Accept
            </Button>
          </form>
          <form
            action={updateAppointmentStatus.bind(
              null,
              appointmentId,
              "CANCELED"
            )}
          >
            <Button
              type="submit"
              variant="outline"
              className="flex-1 text-red-600"
            >
              <X className="mr-2 h-4 w-4" />
              Decline
            </Button>
          </form>
        </div>
      )}

      {isDoctor && appointment.status === "CONFIRMED" && (
        <div className="flex gap-2">
          <form
            action={updateAppointmentStatus.bind(
              null,
              appointmentId,
              "COMPLETED"
            )}
          >
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Mark Completed
            </Button>
          </form>
          <form
            action={updateAppointmentStatus.bind(
              null,
              appointmentId,
              "RESCHEDULED"
            )}
          >
            <Button type="submit" variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reschedule
            </Button>
          </form>
        </div>
      )}

      {!isDoctor &&
        (appointment.status === "REQUESTED" ||
          appointment.status === "CONFIRMED") && (
          <form
            action={updateAppointmentStatus.bind(
              null,
              appointmentId,
              "CANCELED"
            )}
          >
            <Button
              type="submit"
              variant="outline"
              className="w-full text-red-600"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel Appointment
            </Button>
          </form>
        )}
    </div>
  );
}
