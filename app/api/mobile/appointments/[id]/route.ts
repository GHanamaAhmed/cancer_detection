import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMobileAuth } from "@/lib/mobile-auth";
import { pusher } from "@/lib/pusher";

export async function GET(
  req: NextRequest,
  { params: p }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const params = await p;
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointmentId = params.id;
    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Get appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            profile: {
              select: {
                avatarUrl: true,
                phoneNumber: true,
              },
            },
            doctor: {
              select: {
                id: true,
                userId: true,
                specialties: true,
                consultationFee: true,
                facilities: {
                  include: {
                    facility: true,
                  },
                  where: {
                    isPrimary: true,
                  },
                },
              },
            },
          },
        },
        lesionCase: {
          select: {
            id: true,
            caseNumber: true,
            riskLevel: true,
            bodyLocation: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if the user is authorized to view this appointment
    if (appointment.userId !== userId && appointment.doctorId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to view this appointment" },
        { status: 403 }
      );
    }

    // Format the appointment data
    const appointmentDate = new Date(appointment.date);
    const formattedAppointment = {
      id: appointment.id,
      doctor: {
        id: appointment.doctor.doctor?.id,
        name: appointment.doctor.name,
        image:
          appointment.doctor.image || appointment.doctor.profile?.avatarUrl,
        role: appointment.doctor.role,
        specialties: appointment.doctor.doctor?.specialties || [],
        phoneNumber: appointment.doctor.profile?.phoneNumber,
        facility: appointment.doctor.doctor?.facilities[0]?.facility,
      },
      date: appointmentDate.toISOString(),
      formattedDate: appointmentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
      formattedTime: appointmentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      duration: appointment.duration,
      type: appointment.type,
      status: appointment.status,
      reasonForVisit: appointment.reasonForVisit,
      location: appointment.location,
      case: appointment.lesionCase
        ? {
            id: appointment.lesionCase.id,
            caseNumber: appointment.lesionCase.caseNumber,
            riskLevel: appointment.lesionCase.riskLevel,
            bodyLocation: appointment.lesionCase.bodyLocation,
          }
        : null,
      followUpNeeded: appointment.followUpNeeded,
      notes: appointment.notes,
      consultationFee: appointment.doctor.doctor?.consultationFee,
    };

    return NextResponse.json({
      success: true,
      data: formattedAppointment,
    });
  } catch (error: any) {
    console.error("Error fetching appointment details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch appointment details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params: p }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const params = await p;
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointmentId = params.id;
    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Get the existing appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify the user owns this appointment
    if (appointment.userId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to modify this appointment" },
        { status: 403 }
      );
    }

    // Parse the update data
    const data = await req.json();
    const { date, type, reasonForVisit, status } = data;

    // Build the update object
    const updateData: any = {};

    if (date) {
      const newDate = new Date(date);
      const now = new Date();

      if (newDate <= now) {
        return NextResponse.json(
          { error: "Appointment date must be in the future" },
          { status: 400 }
        );
      }

      // If rescheduling, check if the new slot is available
      if (newDate.getTime() !== appointment.date.getTime()) {
        const existingAppointment = await prisma.appointment.findFirst({
          where: {
            doctorId: appointment.doctorId,
            date: newDate,
            status: {
              in: ["CONFIRMED", "REQUESTED"],
            },
            id: { not: appointmentId }, // Exclude the current appointment
          },
        });

        if (existingAppointment) {
          return NextResponse.json(
            { error: "This appointment slot is already booked" },
            { status: 409 }
          );
        }
      }

      updateData.date = newDate;

      // If rescheduling, update status to RESCHEDULED
      if (newDate.getTime() !== appointment.date.getTime()) {
        updateData.status = "RESCHEDULED";
      }
    }

    if (type) updateData.type = type;
    if (reasonForVisit) updateData.reasonForVisit = reasonForVisit;

    // Only allow canceling through status update
    if (status === "CANCELED" && appointment.status !== "CANCELED") {
      updateData.status = "CANCELED";
      if (appointment.status !== "CONFIRMED") {
        const n = await prisma.notification.create({
          data: {
            userId: appointment.doctorId,
            type: "APPOINTMENT_REMINDER",
            title: "Appointment Canceled",
            message: `Appointment on ${new Date(
              appointment.date
            ).toLocaleDateString()} has been canceled by the patient`,
            actionUrl: `/appointments/${appointment.id}`,
            relatedEntityId: appointment.id,
          },
        });
        await pusher.trigger(
          `private-notifications-${appointment.doctorId}`,
          "new-notification",
          n
        );
      }
    }

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
    });

    // Notify the doctor about the update
    if (Object.keys(updateData).length > 0) {
      let notificationTitle, notificationMessage;

      if (updateData.status === "CANCELED") {
        notificationTitle = "Appointment Canceled";
        notificationMessage = `Appointment on ${new Date(
          appointment.date
        ).toLocaleDateString()} has been canceled by the patient`;
      } else if (updateData.status === "RESCHEDULED") {
        notificationTitle = "Appointment Rescheduled";
        notificationMessage = `Appointment has been rescheduled to ${new Date(
          updateData.date
        ).toLocaleDateString()} by the patient`;
      } else {
        notificationTitle = "Appointment Updated";
        notificationMessage = `Appointment details have been updated by the patient`;
      }

      const n = await prisma.notification.create({
        data: {
          userId: appointment.doctorId,
          type: "APPOINTMENT_REMINDER",
          title: notificationTitle,
          message: notificationMessage,
          actionUrl: `/appointments/${appointment.id}`,
          relatedEntityId: appointment.id,
        },
      });
      await pusher.trigger(
        `private-notifications-${appointment.doctorId}`,
        "new-notification",
        n
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedAppointment,
      message: "Appointment updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update appointment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params: p }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const params = await p;
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointmentId = params.id;
    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Get the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify the user owns this appointment
    if (appointment.userId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to delete this appointment" },
        { status: 403 }
      );
    }

    // Instead of deleting, update status to CANCELED
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "CANCELED" },
    });

    // Notify the doctor about the cancellation
    const n = await prisma.notification.create({
      data: {
        userId: appointment.doctorId,
        type: "APPOINTMENT_REMINDER",
        title: "Appointment Canceled",
        message: `Appointment on ${new Date(
          appointment.date
        ).toLocaleDateString()} has been canceled by the patient`,
        actionUrl: `/appointments/${appointment.id}`,
        relatedEntityId: appointment.id,
      },
    });
    await pusher.trigger(
      `private-notifications-${appointment.doctorId}`,
      "new-notification",
      n
    );

    return NextResponse.json({
      success: true,
      message: "Appointment canceled successfully",
    });
  } catch (error: any) {
    console.error("Error canceling appointment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel appointment" },
      { status: 500 }
    );
  }
}
