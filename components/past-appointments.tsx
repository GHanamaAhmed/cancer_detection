import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, FileText } from "lucide-react";

interface PastAppointmentsProps {
  userId: string;
}

export async function PastAppointments({ userId }: PastAppointmentsProps) {
  // Get current date
  const now = new Date();

  // Fetch past appointments
  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [{ doctorId: userId }, { userId: userId }],
      OR: [
        {
          date: {
            lt: now,
          },
        },
        {
          status: {
            in: ["COMPLETED", "CANCELED"],
          },
        },
      ],
    },
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
    orderBy: {
      date: "desc",
    },
    take: 20, // Limit to 20 most recent past appointments
  });

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No past appointments
        </h3>
        <p className="text-gray-500 mb-6">
          Your appointment history will appear here.
        </p>
        <Button asChild>
          <a href="/dashboard/appointments?tab=book">
            Schedule New Appointment
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Past Appointments</h3>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {appointments.map((appointment) => {
          // Determine if current user is the doctor or patient
          const userIsDoctorForThisAppointment =
            appointment.doctorId === userId;

          // Format name based on role
          const otherPartyName = userIsDoctorForThisAppointment
            ? appointment.user.profile
              ? `${appointment.user.profile.firstName} ${appointment.user.profile.lastName}`
              : appointment.user.name || "Unknown Patient"
            : appointment.doctor.profile
            ? `Dr. ${appointment.doctor.profile.firstName} ${appointment.doctor.profile.lastName}`
            : appointment.doctor.name || "Unknown Doctor";

          // Format initials
          const initials = otherPartyName
            .split(" ")
            .map((n) => n.charAt(0))
            .join("")
            .substring(0, 2);

          // Get status badge styling
          const getStatusBadge = (status: string) => {
            switch (status) {
              case "COMPLETED":
                return "bg-green-100 text-green-800 hover:bg-green-200";
              case "CANCELED":
                return "bg-red-100 text-red-800 hover:bg-red-200";
              default:
                return "bg-gray-100 text-gray-800 hover:bg-gray-200";
            }
          };

          // Format appointment type
          const formattedType = appointment.type
            .replace(/_/g, " ")
            .toLowerCase();

          return (
            <Card key={appointment.id} className="overflow-hidden">
              <div
                className={`h-2 ${
                  appointment.status === "COMPLETED"
                    ? "bg-green-500"
                    : appointment.status === "CANCELED"
                    ? "bg-red-500"
                    : "bg-gray-300"
                }`}
              />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge className={getStatusBadge(appointment.status)}>
                    {appointment.status.charAt(0) +
                      appointment.status
                        .slice(1)
                        .toLowerCase()
                        .replace(/_/g, " ")}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(appointment.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(appointment.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage
                      src={
                        (userIsDoctorForThisAppointment
                          ? appointment.user.image
                          : appointment.doctor.image) || ""
                      }
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{otherPartyName}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {formattedType}
                    </p>
                  </div>
                </div>

                {appointment.lesionCase && (
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <a
                        href={`/dashboard/patients/${appointment.userId}/cases/${appointment.lesionCase.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View related case
                      </a>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={`/dashboard/appointments?tab=calendar&date=${
                        new Date(appointment.date).toISOString().split("T")[0]
                      }&appointmentId=${appointment.id}`}
                    >
                      View Details
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
