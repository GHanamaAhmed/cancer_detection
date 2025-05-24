import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getSession } from "@/lib/auth";
import { StreamChat } from 'stream-chat';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { userId } = body;

    // Ensure the requested userId matches the authenticated user
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "User ID mismatch" },
        { status: 403 }
      );
    }

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
    
    // Generate user token
    const token = serverClient.createToken(userId);

    // Return token
    return NextResponse.json({ token });

  } catch (error: any) {
    console.error("Error generating Stream token:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}