import { prisma } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface VideoCallHistoryProps {
  userId: string;
}

export async function VideoCallHistory({ userId }: VideoCallHistoryProps) {
  // Update the query to retrieve all confirmed appointments, not just future ones
  const confirmedCalls = await prisma.appointment.findMany({
    where: {
      doctorId: userId,
      type: "VIDEO_CONSULTATION",
      status: "CONFIRMED",
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
    take: 10,
  });

  // Get requested appointments separately
  const requestedCalls = await prisma.appointment.findMany({
    where: {
      doctorId: userId,
      type: "VIDEO_CONSULTATION",
      status: "REQUESTED",
      date: {
        gte: new Date(),
      },
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
    take: 5,
  });

  // Get past completed/canceled calls
  const pastCalls = await prisma.appointment.findMany({
    where: {
      doctorId: userId,
      type: "VIDEO_CONSULTATION",
      status: {
        in: ["COMPLETED", "CANCELED"],
      },
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 5,
  });

  // Helper function to check if a date is today
  const isDateToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 font-medium dark:text-white">
          Upcoming Video Consultations
        </h3>
        {confirmedCalls.length > 0 ? (
          <div className="space-y-3">
            {confirmedCalls.map((call) => {
              // Generate patient name and initials
              const firstName = call.user.profile?.firstName || "Patient";
              const lastName = call.user.profile?.lastName || "";
              const patientName = `${firstName} ${lastName}`.trim();
              const initials = `${firstName.charAt(0)}${
                lastName.charAt(0) || ""
              }`.toUpperCase();

              // Check if appointment is today
              const callDate = new Date(call.date);
              const isToday = isDateToday(callDate);
              const isPast = callDate < new Date();

              return (
                <div
                  key={call.id}
                  className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={
                          call.user.profile?.avatarUrl ||
                          `/placeholder.svg?height=40&width=40`
                        }
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium dark:text-white">
                        {patientName}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isToday ? "Today" : callDate.toLocaleDateString()},{" "}
                          {callDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {isPast && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                          >
                            Past appointment
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Link
                        href={`/dashboard/video?tab=active&callId=${call.id}`}
                      >
                        Join Call
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-20 items-center justify-center rounded-lg border dark:border-gray-800 dark:text-gray-400">
            <p className="text-gray-500 dark:text-gray-400">
              No confirmed video consultations
            </p>
          </div>
        )}
      </div>
      {requestedCalls.length > 0 && (
        <div>
          <h3 className="mb-4 font-medium dark:text-white">
            Pending Consultation Requests
          </h3>
          <div className="space-y-3">
            {requestedCalls.map((call) => {
              // Generate patient name and initials
              const firstName = call.user.profile?.firstName || "Patient";
              const lastName = call.user.profile?.lastName || "";
              const patientName = `${firstName} ${lastName}`.trim();
              const initials = `${firstName.charAt(0)}${
                lastName.charAt(0) || ""
              }`.toUpperCase();

              // Check if appointment is today
              const callDate = new Date(call.date);
              const isToday = isDateToday(callDate);

              return (
                <div
                  key={call.id}
                  className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={
                          call.user.profile?.avatarUrl ||
                          `/placeholder.svg?height=40&width=40`
                        }
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium dark:text-white">
                        {patientName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isToday ? "Today" : callDate.toLocaleDateString()},{" "}
                        {callDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        call.status === "REQUESTED" ? "default" : "outline"
                      }
                      className={
                        call.status !== "REQUESTED"
                          ? "dark:text-gray-300 dark:border-gray-600"
                          : ""
                      }
                    >
                      {call.status != "REQUESTED" ? "Confirmed" : "Requested"}
                    </Badge>
                    {call.status === "REQUESTED" && (
                      <Button
                        asChild
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Link
                          href={`/dashboard/video?tab=active&callId=${call.id}`}
                        >
                          Join Call
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-4 font-medium dark:text-white">
          Past Video Consultations
        </h3>
        {pastCalls.length > 0 ? (
          <div className="space-y-3">
            {pastCalls.map((call) => {
              // Generate patient name and initials
              const firstName = call.user.profile?.firstName || "Patient";
              const lastName = call.user.profile?.lastName || "";
              const patientName = `${firstName} ${lastName}`.trim();
              const initials = `${firstName.charAt(0)}${
                lastName.charAt(0) || ""
              }`.toUpperCase();

              // Format the call date
              const callDate = new Date(call.date);

              return (
                <div
                  key={call.id}
                  className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={
                          call.user.profile?.avatarUrl ||
                          `/placeholder.svg?height=40&width=40`
                        }
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium dark:text-white">
                        {patientName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {callDate.toLocaleDateString()},{" "}
                        {callDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        call.status === "COMPLETED" ? "default" : "destructive"
                      }
                    >
                      {call.status === "COMPLETED" ? "Completed" : "Canceled"}
                    </Badge>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="dark:border-gray-700 dark:text-gray-300"
                    >
                      <Link href={`/dashboard/patients/${call.userId}`}>
                        View Patient
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-20 items-center justify-center rounded-lg border dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              No past video consultations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
