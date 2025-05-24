import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMobileAuth } from "@/lib/mobile-auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Check if the appointment exists and is confirmed
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
        status: "CONFIRMED",
        type: "VIDEO_CONSULTATION",
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found or not eligible for video call" },
        { status: 404 }
      );
    }
    console.log("participantId", appointment.doctorId);
    console.log("hostId", appointment.userId);
    console.log("userId", userId);
    // Check if the user is authorized (either the doctor or the patient)
    if (appointment.userId !== userId && appointment.doctorId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to join this video call" },
        { status: 403 }
      );
    }

    // Check if a room already exists for this appointment
    let room = await prisma.videoCallRoom.findUnique({
      where: { appointmentId },
    });

    // If room exists but is ENDED, create a new one
    if (room && room.status === "ENDED") {
      // Create a new room
      const roomId = uuidv4();

      room = await prisma.videoCallRoom.create({
        data: {
          roomId,
          appointmentId,
          hostId: appointment.doctorId,
          participantId: appointment.userId,
          status: "CREATED",
        },
      });
    }
    // If no room exists, create one
    else if (!room) {
      const roomId = uuidv4();

      room = await prisma.videoCallRoom.create({
        data: {
          roomId,
          appointmentId,
          hostId: appointment.doctorId,
          participantId: appointment.userId,
          status: "CREATED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      roomId: room.roomId,
    });
  } catch (error: any) {
    console.error("Error creating video call room:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create video call room" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const appointmentId = url.searchParams.get("appointmentId");
    const roomId = url.searchParams.get("roomId");

    if (!appointmentId && !roomId) {
      return NextResponse.json(
        { error: "Either appointment ID or room ID is required" },
        { status: 400 }
      );
    }

    let room;
    if (appointmentId) {
      room = await prisma.videoCallRoom.findUnique({
        where: { appointmentId },
        include: {
          appointment: {
            include: {
              doctor: {
                select: {
                  name: true,
                  image: true,
                },
              },
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    } else if (roomId) {
      room = await prisma.videoCallRoom.findUnique({
        where: { roomId: roomId as string },
        include: {
          appointment: {
            include: {
              doctor: {
                select: {
                  name: true,
                  image: true,
                },
              },
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    }

    if (!room) {
      return NextResponse.json(
        { error: "Video call room not found" },
        { status: 404 }
      );
    }
    console.log("participantId", room.participantId);
    console.log("hostId", room.hostId);
    console.log("userId", userId);
    
    // Check if the user is authorized (either the doctor or the patient)
    if (room.participantId !== userId && room.hostId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to access this video call" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error: any) {
    console.error("Error retrieving video call room:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve video call room" },
      { status: 500 }
    );
  }
}

// Update room status (start or end call)
export async function PATCH(request: NextRequest) {
  try {
    const userId = await verifyMobileAuth(request);
    if (!userId) {
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
    console.log("participantId", room.participantId);
    console.log("hostId", room.hostId);
    console.log("userId", userId);
    // Validate the user is either the host or participant
    if (room.hostId !== userId && room.participantId !== userId) {
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
