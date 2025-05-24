import { NextRequest, NextResponse } from "next/server";
import { verifyMobileAuth } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { StreamChat } from 'stream-chat';

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyMobileAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { roomId } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    // Find the room in the database to verify access
    const room = await prisma.videoCallRoom.findUnique({
      where: { roomId },
      include: {
        appointment: {
          select: {
            userId: true,
            doctorId: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this room (either doctor or patient)
    if (room.appointment.userId !== userId && room.appointment.doctorId !== userId) {
      return NextResponse.json(
        { error: "You don't have access to this room" },
        { status: 403 }
      );
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate Stream token
    // Get Stream API credentials
    const apiKey = process.env.GETSTREAM_API_KEY;
    const apiSecret = process.env.GETSTREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("Stream API credentials not configured");
      return NextResponse.json(
        { error: "Video service not properly configured" },
        { status: 500 }
      );
    }

    // Create Stream server client
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    
    // Generate user token with appropriate permissions
    const token = serverClient.createToken(userId);

    // Return token and user data
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        image: user.image
      }
    });

  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}