"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface AvailabilityData {
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface AvailabilityUpdateData {
  isAvailable?: boolean;
  startTime?: string;
  endTime?: string;
}

export async function updateDoctorAvailability(
  id: string,
  data: AvailabilityUpdateData
) {
  try {
    await prisma.doctorAvailability.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating availability:", error);
    throw new Error("Failed to update availability");
  }
}

export async function deleteDoctorAvailability(id: string) {
  try {
    await prisma.doctorAvailability.delete({
      where: { id },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error deleting availability:", error);
    throw new Error("Failed to delete availability");
  }
}

export async function addDoctorAvailability(data: AvailabilityData) {
  try {
    const availability = await prisma.doctorAvailability.create({
      data: {
        doctorId: data.doctorId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isAvailable: data.isAvailable,
      },
    });

    revalidatePath("/dashboard/profile");
    return availability;
  } catch (error) {
    console.error("Error adding availability:", error);
    throw new Error("Failed to add availability");
  }
}
