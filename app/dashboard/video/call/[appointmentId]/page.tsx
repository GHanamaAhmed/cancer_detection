import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { VideoCallInterface } from "@/components/video-call-interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function VideoCallPage({
  params: p,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const params = await p;
  const user = await requireAuth();
  const appointmentId = params.appointmentId;

  // Fetch the appointment details 
  const appointment = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
      doctorId: user.id, // Ensure it belongs to the current doctor
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
  });

  // If appointment doesn't exist or isn't valid, return 404
  if (!appointment) {
    notFound();
  }

  const patientName = `${appointment.user.profile?.firstName || "Patient"} ${
    appointment.user.profile?.lastName || ""
  }`.trim();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight dark:text-white">
            Video Call with {patientName}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Consultation scheduled for{" "}
            {new Date(appointment.date).toLocaleString()}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/video">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Video Calls
          </Link>
        </Button>
      </div>

      <Card className="dark:bg-gray-950 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Active Call</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoCallInterface
            patientId={appointment.userId}
            appointmentId={appointment.id}
            patientName={patientName}
          />
        </CardContent>
      </Card>
    </div>
  );
}
