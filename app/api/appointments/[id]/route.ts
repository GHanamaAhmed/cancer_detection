import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params: p }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await p;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        date: true,
        doctorId: true,
        userId: true,
        status: true,
        type: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check that the user is authorized (either the doctor or the patient)
    if (
      appointment.doctorId !== session.user.id &&
      appointment.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

// delete method to cancel an appointment
export async function DELETE(
  request: NextRequest,
  { params: p }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await p;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check that the user is authorized (either the doctor or the patient)
    if (
      appointment.doctorId !== session.user.id &&
      appointment.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    await Promise.all([
      await prisma.videoCallRoom.updateMany({
        where: {
          appointmentId: params.id,
        },
        data: {
          status: "ENDED",
        },
      }),
      await prisma.appointment.update({
        where: {
          id: params.id,
        },
        data: {
          status: "COMPLETED",
        },
      }),
    ]);

    return NextResponse.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
}
