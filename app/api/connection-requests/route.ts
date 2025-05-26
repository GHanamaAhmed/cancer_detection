import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/authOption";
import { pusher } from "@/lib/pusher";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || "PENDING";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Different queries based on user role
    if (
      session.user.role === "DOCTOR" ||
      session.user.role === "DERMATOLOGIST" ||
      session.user.role === "ONCOLOGIST"
    ) {
      // Doctors see requests from patients
      const requests = await prisma.connectionRequest.findMany({
        where: {
          doctor: {
            userId: session.user.id,
          },
          status: status as any,
        },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  profile: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      });

      const total = await prisma.connectionRequest.count({
        where: {
          doctorId: session.user.id,
          status: status as any,
        },
      });

      return NextResponse.json({
        requests,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit,
        },
      });
    } else {
      // Patients see their requests to doctors
      const requests = await prisma.connectionRequest.findMany({
        where: {
          patient: {
            userId: session.user.id,
          },
          status: status as any,
        },
        include: {
          patient: {
            include: {
              user: { include: { profile: true } },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      });

      const total = await prisma.connectionRequest.count({
        where: {
          patientId: session.user.id,
          status: status as any,
        },
      });

      return NextResponse.json({
        requests,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch connection requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { doctorId, message } = await req.json();

    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    // Check if the doctor exists
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Check if a connection request already exists
    const existingRequest = await prisma.connectionRequest.findFirst({
      where: {
        patientId: session.user.id,
        doctorId,
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "A connection request already exists with this doctor" },
        { status: 400 }
      );
    }

    // Create the connection request
    const connectionRequest = await prisma.connectionRequest.create({
      data: {
        patientId: session.user.id,
        doctorId,
        message: message || "",
        status: "PENDING",
      },
    });

    // Create a notification for the doctor
    const n = await prisma.notification.create({
      data: {
        userId: doctorId,
        type: "CONNECTION_REQUEST",
        title: "New Connection Request",
        message: `${session.user.name} has requested to connect with you.`,
        senderId: session.user.id,
      },
    });
    await pusher.trigger(
      `private-notifications-${doctorId}`,
      "new-notification",
      n
    );
    return NextResponse.json(connectionRequest);
  } catch (error) {
    console.error("Error creating connection request:", error);
    return NextResponse.json(
      { error: "Failed to create connection request" },
      { status: 500 }
    );
  }
}
