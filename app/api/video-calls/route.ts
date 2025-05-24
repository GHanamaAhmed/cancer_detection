import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// Create a new video call room
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await request.json();

    // Validate appointment
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
        type: "VIDEO_CONSULTATION",
        status: "CONFIRMED",
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found or not eligible for video call" },
        { status: 404 }
      );
    }

    // Check if room already exists for this appointment
    const existingRoom = await prisma.videoCallRoom.findUnique({
      where: { appointmentId },
    });

    if (existingRoom) {
      if (existingRoom.status !== "ENDED") {
        return NextResponse.json({ roomId: existingRoom.roomId });
      }
      // If the room exists but is ended, we'll create a new one below
    }

    // Create a new room
    const roomId = uuidv4();

    const room = await prisma.videoCallRoom.create({
      data: {
        roomId,
        appointmentId,
        hostId: appointment.doctorId,
        participantId: appointment.userId,
        status: "CREATED",
      },
    });

    return NextResponse.json({ roomId: room.roomId });
  } catch (error) {
    console.error("Error creating video call room:", error);
    return NextResponse.json(
      { error: "Failed to create video call room" },
      { status: 500 }
    );
  }
}

// Update room status (start or end call)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, status } = await request.json();

    if (!roomId || !status || !["ACTIVE", "ENDED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid room ID or status" },
        { status: 400 }
      );
    }

    const room = await prisma.videoCallRoom.findUnique({
      where: { roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Validate the user is either the host or participant
    if (
      room.hostId !== session.user.id &&
      room.participantId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Not authorized to update this room" },
        { status: 403 }
      );
    }

    const updates: any = { status };

    if (status === "ACTIVE" && !room.startedAt) {
      updates.startedAt = new Date();
    } else if (status === "ENDED" && room.startedAt && !room.endedAt) {
      updates.endedAt = new Date();
      // Calculate duration in seconds
      updates.duration = Math.floor(
        (new Date().getTime() - room.startedAt.getTime()) / 1000
      );

      // Also update appointment status to COMPLETED
      await prisma.appointment.update({
        where: { id: room.appointmentId },
        data: { status: "COMPLETED" },
      });
    }

    const updatedRoom = await prisma.videoCallRoom.update({
      where: { roomId },
      data: updates,
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("Error updating video call room:", error);
    return NextResponse.json(
      { error: "Failed to update video call room" },
      { status: 500 }
    );
  }
}

// Get room info
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const appointmentId = url.searchParams.get("appointmentId");
    const roomId = url.searchParams.get("roomId");

    if (!appointmentId && !roomId) {
      return NextResponse.json(
        { error: "Either appointmentId or roomId is required" },
        { status: 400 }
      );
    }

    const room = await prisma.videoCallRoom.findUnique({
      where: appointmentId ? { appointmentId } : { roomId: roomId as string },
      include: {
        appointment: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Validate the user is either the host or participant
    if (
      room.hostId !== session.user.id &&
      room.participantId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Not authorized to view this room" },
        { status: 403 }
      );
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error getting video call room:", error);
    return NextResponse.json(
      { error: "Failed to get video call room" },
      { status: 500 }
    );
  }
}
