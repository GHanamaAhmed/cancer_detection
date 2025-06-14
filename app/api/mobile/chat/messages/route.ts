import { prisma } from "@/lib/db";
import { verifyMobileAuth } from "@/lib/mobile-auth";
import { pusher } from "@/lib/pusher";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch chat messages for a specific doctor conversation
export async function GET(request: NextRequest) {
  // Verify the current user
  const currentUserId = await verifyMobileAuth(request);
  if (!currentUserId) {
    return new NextResponse(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  // Get doctorId from query parameters
  const doctorId = url.searchParams.get("doctorId");
  if (!doctorId) {
    return NextResponse.json({ success: false, error: "doctorId is required" });
  }

  try {
    // First, get the doctor's user ID since messages are between users
    const doctorUser = await prisma.user.findFirst({
      where: {
        doctor: {
          id: doctorId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!doctorUser) {
      return NextResponse.json({
        success: false,
        error: "Doctor not found",
      });
    }

    // Now fetch messages between the current user and the doctor's user account
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: doctorUser.id },
          { senderId: doctorUser.id, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch messages",
    });
  }
}

// POST: Send a new chat message (this part is mostly correct)
export async function POST(request: NextRequest) {
  const senderId = await verifyMobileAuth(request);
  if (!senderId) {
    return new NextResponse(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401 }
    );
  }

  const body = await request.json();
  const { doctorId, content } = body;
  if (!doctorId || !content) {
    return NextResponse.json({
      success: false,
      error: "Missing doctorId or content",
    });
  }

  try {
    // Get the doctor's user ID
    const doctorUser = await prisma.user.findFirst({
      where: {
        doctor: {
          id: doctorId,
        },
      },
    });

    if (!doctorUser) {
      return NextResponse.json({
        success: false,
        error: "Doctor not found",
      });
    }

    const receiverId = doctorUser.id;
    const channelName = `private-chat-${senderId}-${receiverId}`;
    console.log("channelName", channelName);

    // Create the message
    pusher.trigger(channelName, "message", {
      id: randomUUID().toString(),
      senderId,
      receiverId,
      content,
      isRead: false,
    });
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });
    // Create a notification for the doctor
    const n = await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "DOCTOR_MESSAGE",
        message: `New message from ${sender?.name}`,
        isRead: false,
        senderId,
        title: "New Message",
      },
    });
    await pusher.trigger(
      `private-notifications-${receiverId}`,
      "new-notification",
      n
    );
    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to send message",
    });
  }
}
