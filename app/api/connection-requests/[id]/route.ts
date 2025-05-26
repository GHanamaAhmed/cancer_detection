import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "../../auth/[...nextauth]/authOption";
import { pusher } from "@/lib/pusher";

export async function PATCH(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const params = await paramsPromise;
    const { id } = params;
    const { status } = await req.json();

    if (!status || !["APPROVED", "DECLINED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Find the connection request
    const connectionRequest = await prisma.connectionRequest.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: {
          select: { userId: true },
        },
      },
    });

    if (!connectionRequest) {
      return NextResponse.json(
        { error: "Connection request not found" },
        { status: 404 }
      );
    }

    // Verify that the current user is the doctor for this request
    if (connectionRequest.doctor.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the connection request
    const updatedRequest = await prisma.connectionRequest.update({
      where: { id },
      data: { status },
    });

    // Create a notification for the patient
    const n = await prisma.notification.create({
      data: {
        userId: connectionRequest.patientId,
        type:
          status === "APPROVED" ? "CONNECTION_APPROVED" : "CONNECTION_DECLINED",
        title:
          status === "APPROVED"
            ? "Connection Request Approved"
            : "Connection Request Declined",
        message:
          status === "APPROVED"
            ? `${session.user.name} has approved your connection request.`
            : `${session.user.name} has declined your connection request.`,
      },
    });
    await pusher.trigger(
      `private-notifications-${connectionRequest.patientId}`,
      "new-notification",
      n
    );
    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating connection request:", error);
    return NextResponse.json(
      { error: "Failed to update connection request" },
      { status: 500 }
    );
  }
}
