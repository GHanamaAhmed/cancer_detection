// app/api/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { BodyLocation, PrismaClient } from "@prisma/client";
import { verifyMobileAuth } from "@/lib/mobile-auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const userId = await verifyMobileAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const {
      publicId,
      imageUrl,
      bodyLocation,
      lesionSize,
      notes,
    }: {
      publicId: string;
      imageUrl: string;
      bodyLocation: BodyLocation;
      lesionSize: number;
      notes: string;
    } = await req.json();

    const record = await prisma.imageUpload.create({
      data: {
        userId,
        imageUrl,
        captureDate: new Date(),
        bodyLocation,
        lesionSize,
        notes,
      },
    });
    
    return NextResponse.json(record, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
