import { prisma } from "@/lib/db";
import { verifyMobileAuth } from "@/lib/mobile-auth";
import { pusher } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const userId = await verifyMobileAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only patients can initiate connections
    if (currentUser.role !== "PATIENT") {
      return NextResponse.json(
        { error: "Only patients can initiate connections" },
        { status: 403 }
      );
    }

    // Get request body
    const body = await req.json();
    const { doctorId, message } = body;

    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    // Verify doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    const patient = await prisma.patient.findUnique({
      where: {
        userId: currentUser.id,
      },
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    // Check if a connection already exists
    const existingConnection = await prisma.connectionRequest.findFirst({
      where: {
        patientId: patient.id,
        doctorId: doctorId,
      },
    });

    if (existingConnection) {
      return NextResponse.json(
        {
          error: "Connection request already exists",
          status: existingConnection.status,
        },
        { status: 409 }
      );
    }

    // Create new connection request
    const connectionRequest = await prisma.connectionRequest.create({
      data: {
        patientId: patient.id,
        doctorId: doctorId,
        status: "PENDING",
        message: message || undefined,
      },
    });

    // Create a notification for the doctor
    const n = await prisma.notification.create({
      data: {
        userId: doctor.userId,
        type: "CONNECTION_REQUEST",
        message: `New connection request from ${currentUser.name}`,
        isRead: false,
        senderId: currentUser.id,
        title: "New Connection Request",
      },
    });
    await pusher.trigger(
      `private-notifications-${doctor.userId}`,
      "new-notification",
      n
    );
    return NextResponse.json(
      { success: true, data: connectionRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating connection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const userId = await verifyMobileAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract doctorId from search params
    const searchParams = req.nextUrl.searchParams;
    const doctorId = searchParams.get("doctorId");

    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }
    const patient = await prisma.patient.findUnique({
      where: {
        userId: currentUser.id,
      },
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    // Check if a connection already exists
    const existingConnection = await prisma.connectionRequest.findFirst({
      where: {
        patientId: patient.id,
        doctorId: doctorId,
      },
    });

    return NextResponse.json({
      exists: !!existingConnection,
      data: existingConnection || null,
    });
  } catch (error) {
    console.error("Error checking connection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
