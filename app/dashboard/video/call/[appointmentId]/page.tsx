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
    <VideoCallInterface
      patientId={appointment.userId}
      appointmentId={appointment.id}
      patientName={patientName}
    />
  );
}
