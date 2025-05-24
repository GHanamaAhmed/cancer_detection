import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Video,
  User,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { updateAppointmentStatus } from "@/actions/appointment-actions";

interface UpcomingAppointmentsProps {
  userId: string;
}

export async function UpcomingAppointments({
  userId,
}: UpcomingAppointmentsProps) {
  // Get current date
  const now = new Date();

  // Fetch upcoming appointments
  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [{ doctorId: userId }, { userId: userId }],
      date: {
        gte: now,
      },
      status: {
        in: ["CONFIRMED", "REQUESTED", "RESCHEDULED"],
      },
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
      date: "asc",
    },
  });

  // Check if user is doctor or patient for each appointment
  const isDoctor = await prisma.doctor.findFirst({
    where: { userId },
    select: { id: true },
  });

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No upcoming appointments
        </h3>
        <p className="text-gray-500 mb-6">
          You don't have any upcoming appointments scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Upcoming Appointments</h3>
        <Button asChild>
          <a href="/dashboard/appointments?tab=book">New Appointment</a>
        </Button>
      </div>

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
              case "CONFIRMED":
                return "bg-green-100 text-green-800 hover:bg-green-200";
              case "REQUESTED":
                return "bg-blue-100 text-blue-800 hover:bg-blue-200";
              case "RESCHEDULED":
                return "bg-amber-100 text-amber-800 hover:bg-amber-200";
              default:
                return "bg-gray-100 text-gray-800 hover:bg-gray-200";
            }
          };

          // Format appointment type
          const formattedType = appointment.type
            .replace(/_/g, " ")
            .toLowerCase();

          // Type icon
          const getTypeIcon = (type: string) => {
            switch (type) {
              case "VIDEO_CONSULTATION":
                return <Video className="h-4 w-4" />;
              case "IN_PERSON":
                return <User className="h-4 w-4" />;
              default:
                return <Calendar className="h-4 w-4" />;
            }
          };

          return (
            <Card key={appointment.id} className="overflow-hidden">
              <div
                className={`h-2 ${
                  appointment.status === "CONFIRMED"
                    ? "bg-green-500"
                    : appointment.status === "REQUESTED"
                    ? "bg-blue-500"
                    : "bg-amber-500"
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
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {getTypeIcon(appointment.type)}
                      <span className="capitalize">{formattedType}</span>
                    </div>
                  </div>
                </div>

                {appointment.location && (
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{appointment.location}</span>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1" asChild>
                    <a
                      href={`/dashboard/appointments?tab=calendar&date=${
                        new Date(appointment.date).toISOString().split("T")[0]
                      }&appointmentId=${appointment.id}`}
                    >
                      Details
                    </a>
                  </Button>

                  {userIsDoctorForThisAppointment &&
                  appointment.status === "REQUESTED" ? (
                    <form
                      action={async () => {
                        "use server";
                        await updateAppointmentStatus(
                          appointment.id,
                          "CONFIRMED"
                        );
                      }}
                      className="flex-1"
                    >
                      <Button type="submit" className="w-full">
                        Accept
                      </Button>
                    </form>
                  ) : (
                    <form
                      action={async () => {
                        "use server";
                        await updateAppointmentStatus(
                          appointment.id,
                          "CANCELED"
                        );
                      }}
                      className="flex-1"
                    >
                      <Button type="submit" variant="destructive">
                        Cancel
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
