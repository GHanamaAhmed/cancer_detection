import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMobileAuth } from "@/lib/mobile-auth";

export async function PUT(req: NextRequest) {
  try {
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { roomId, status } = body;

    if (!roomId || !status) {
      return NextResponse.json(
        { error: "Room ID and status are required" },
        { status: 400 }
      ); 
    }

    // Verify the room exists
    const room = await prisma.videoCallRoom.findUnique({
      where: { roomId },
      include: {
        appointment: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Verify this user is part of the call
    if (room.participantId !== userId && room.hostId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to update this room" },
        { status: 403 }
      );
    }

    // Update the room status
    const updates: any = { status };

    if (status === "ACTIVE" && !room.startedAt) {
      updates.startedAt = new Date();
    } else if (status === "ENDED" && room.startedAt && !room.endedAt) {
      updates.endedAt = new Date();
      updates.duration = Math.floor(
        (new Date().getTime() - room.startedAt.getTime()) / 1000
      );

      // Also update appointment status to COMPLETED if it was active
      if (room.appointment.status === "CONFIRMED") {
        await prisma.appointment.update({
          where: { id: room.appointmentId },
          data: { status: "COMPLETED" },
        });
      }
    }

    const updatedRoom = await prisma.videoCallRoom.update({
      where: { roomId },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      data: updatedRoom,
    });
  } catch (error: any) {
    console.error("Error updating video call status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update video call status" },
      { status: 500 }
    );
  }
}
