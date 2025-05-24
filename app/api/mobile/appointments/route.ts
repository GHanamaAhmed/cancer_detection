import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMobileAuth } from "@/lib/mobile-auth";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const data = await req.json();
    const { doctorId, date, type, reasonForVisit, lesionCaseId, location } =
      data;

    if (!doctorId || !date || !type) {
      return NextResponse.json(
        { error: "Doctor ID, date, and appointment type are required" },
        { status: 400 }
      );
    }

    // Validate date is in the future
    const appointmentDate = new Date(date);
    const now = new Date();
    if (appointmentDate <= now) {
      return NextResponse.json(
        { error: "Appointment date must be in the future" },
        { status: 400 }
      );
    }

    // Check if the doctor exists
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { id: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Check for connection between patient and doctor
    const patient = await prisma.patient.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient record not found" },
        { status: 404 }
      );
    }

    const connection = await prisma.connectionRequest.findFirst({
      where: {
        patientId: patient.id,
        doctor: {
          userId: doctorId,
        },
        status: "APPROVED",
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "You are not connected with this doctor" },
        { status: 403 }
      );
    }

    // Check if appointment slot is available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: appointmentDate,
        status: {
          in: ["CONFIRMED", "REQUESTED"],
        },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: "This appointment slot is already booked" },
        { status: 409 }
      );
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId,
        doctorId,
        date: appointmentDate,
        duration: 30, // Default to 30 minutes
        type,
        status: "REQUESTED", // Default status
        reasonForVisit,
        location,
        lesionCaseId,
      },
    });

    // Create notification for the doctor
    await prisma.notification.create({
      data: {
        userId: doctorId,
        type: "CONNECTION_REQUEST",
        title: "New Appointment Request",
        message: `You have a new appointment request from ${userId}`,
        actionUrl: `/appointments/${appointment.id}`,
        relatedEntityId: appointment.id,
        senderId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: appointment,
      message: "Appointment requested successfully",
    });
  } catch (error: any) {
    console.error("Error booking appointment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to book appointment" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    // Build the query
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    // Get all appointments for the user
    const appointments = await prisma.appointment.findMany({
      where: query,
      include: {
        doctor: {
          select: {
            name: true,
            image: true,
            role: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
        lesionCase: {
          select: {
            id: true,
            caseNumber: true,
            riskLevel: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    // Format the appointments
    const formattedAppointments = appointments.map((appointment) => {
      const appointmentDate = new Date(appointment.date);

      return {
        id: appointment.id,
        doctor: {
          id: appointment.doctorId,
          name: appointment.doctor.name,
          image:
            appointment.doctor.image || appointment.doctor.profile?.avatarUrl,
          role: appointment.doctor.role,
        },
        date: appointmentDate.toISOString(),
        formattedDate: appointmentDate.toLocaleDateString("en-US", {
          weekday: "short",
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
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedAppointments,
    });
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch appointments" },
      { status: 500 }
    );
  } 
}
  