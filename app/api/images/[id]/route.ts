import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bodyLocation, lesionSize, notes } = await req.json();

    const updatedImage = await prisma.imageUpload.update({
      where: {
        id: params.id,
      },
      data: {
        bodyLocation: bodyLocation,
        lesionSize: lesionSize,
        notes: notes,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedImage,
    });
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}
