import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMobileAuth } from "@/lib/mobile-auth";

export async function GET({ request }: { request: NextRequest }) {
  try {
    const userId = await verifyMobileAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
