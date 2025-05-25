import { prisma } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Calendar, Clock, Video } from "lucide-react";
import EndCallButton from "./endCallButton";

interface AvailableCallsProps {
  userId: string;
}

export async function AvailableCalls({ userId }: AvailableCallsProps) {
  // Get all confirmed appointments eligible for video call
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

  if (confirmedCalls.length === 0) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center dark:text-gray-400">
        <Video className="h-16 w-16 text-gray-300 dark:text-gray-600" />
        <div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            No approved video consultations
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            Once patients approve consultations, they'll appear here
          </p>
          <Button asChild>
            <a href="/dashboard/appointments">Schedule a Video Consultation</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-medium dark:text-white">
        Available Video Consultations
      </h3>

      <div className="grid gap-3">
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
              className="rounded-lg border p-5 dark:border-gray-800 dark:bg-gray-900/50 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={
                        call.user.profile?.avatarUrl ||
                        `/placeholder.svg?height=48&width=48`
                      }
                      alt={patientName}
                    />
                    <AvatarFallback className="text-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-lg dark:text-white">
                      {patientName}
                    </h4>
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 mt-1">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {isToday ? "Today" : callDate.toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {callDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
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

                <div className="flex flex-col gap-3 md:flex-row items-center">
                  <Button
                    asChild
                    size="default"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 space-x-2"
                  >
                    <Link href={`/dashboard/video/call/${call.id}`}>
                      <Video className="h-4 w-4" />
                      <span>Join Call</span>
                    </Link>
                  </Button>
                  <EndCallButton appointmentId={call.id} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
