"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";

export async function endVideoCall(appointmentId: string) {
  const user = await requireAuth();

  // Update the appointment status to completed
  await prisma.appointment.update({
    where: {
      id: appointmentId,
      doctorId: user.id,
    },
    data: {
      status: "COMPLETED",
      notes: `Video call completed on ${new Date().toLocaleString()}`,
    },
  });

  revalidatePath("/dashboard/video");
  revalidatePath("/dashboard/appointments");
}

export async function startVideoCall(appointmentId: string) {
  const user = await requireAuth();

  // Update the appointment status to confirmed if it's not already
  await prisma.appointment.update({
    where: {
      id: appointmentId,
      doctorId: user.id,
    },
    data: {
      status: "CONFIRMED",
    },
  });

  revalidatePath("/dashboard/video");
  revalidatePath("/dashboard/appointments");

  return appointmentId;
}
