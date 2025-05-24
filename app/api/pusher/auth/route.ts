import { pusher } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.text(); // get raw body
  const params = new URLSearchParams(formData); // parse form body

  const socket_id = params.get("socket_id")!;
  const channel_name = params.get("channel_name")!;

  const authResponse = pusher.authenticate(socket_id, channel_name);
  return NextResponse.json(authResponse);
}
