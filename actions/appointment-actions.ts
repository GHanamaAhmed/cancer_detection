"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

interface AppointmentData {
  doctorId: string;
  userId: string;
  date: string;
  type: string;
  reasonForVisit?: string;
  location?: string;
  duration: number;
  lesionCaseId?: string;
}

export async function createAppointment(data: AppointmentData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "You must be logged in" };
    }

    // Validate input data
    if (!data.doctorId || !data.userId || !data.date || !data.type) {
      return { success: false, message: "Missing required fields" };
    }

    // Make sure appointment date is in the future
    const appointmentDate = new Date(data.date);
    if (appointmentDate <= new Date()) {
      return {
        success: false,
        message: "Appointment date must be in the future",
      };
    }

    // Check if the doctor exists
    const doctor = await prisma.user.findUnique({
      where: { id: data.doctorId },
      select: { id: true, doctor: true },
    });

    if (!doctor || !doctor.doctor) {
      return { success: false, message: "Doctor not found" };
    }

    // Check if the patient exists
    const patient = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, patient: true },
    });

    if (!patient || !patient.patient) {
      return { success: false, message: "Patient not found" };
    }

    // Check if there's already an appointment at the same time
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        date: appointmentDate,
        status: { in: ["CONFIRMED", "REQUESTED"] },
      },
    });

    if (existingAppointment) {
      return {
        success: false,
        message:
          "This time slot is already booked. Please select another time.",
      };
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        doctorId: data.doctorId,
        userId: data.userId,
        date: appointmentDate,
        type: data.type,
        reasonForVisit: data.reasonForVisit,
        location: data.location,
        status: user.id === data.doctorId ? "CONFIRMED" : "REQUESTED",
        lesionCaseId: data.lesionCaseId,
        duration: data.duration || 30,
      },
    });

    // Create a notification for the doctor or patient
    await prisma.notification.create({
      data: {
        userId: user.id === data.userId ? data.doctorId : data.userId,
        title: "New Appointment",
        message:
          user.id === data.userId
            ? "A patient has requested an appointment"
            : "A doctor has scheduled an appointment for you",
        type: "APPOINTMENT",
        isRead: false,
        relatedId: appointment.id,
      },
    });

    revalidatePath("/dashboard/appointments");

    return {
      success: true,
      message: "Appointment created successfully",
      appointmentId: appointment.id,
    };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { success: false, message: "Failed to create appointment" };
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("You must be logged in");
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { doctorId: true, userId: true },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Verify the user has permission (either the doctor or the patient)
    if (user.id !== appointment.doctorId && user.id !== appointment.userId) {
      throw new Error("You don't have permission to update this appointment");
    }

    // Update the appointment status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    // Determine which user to notify
    const recipientId =
      user.id === appointment.doctorId
        ? appointment.userId
        : appointment.doctorId;

    // Create a notification
    await prisma.notification.create({
      data: {
        userId: recipientId,
        title: "Appointment Update",
        message: `Your appointment has been ${status.toLowerCase()}`,
        type: "APPOINTMENT_REMINDER",
        isRead: false,
        relatedEntityId: appointmentId,
      },
    });

    revalidatePath("/dashboard/appointments");
    return { success: true };
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
}
