import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMobileAuth } from "@/lib/mobile-auth";

export async function GET(
  req: NextRequest,
  { params: p }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const params = await p;
    const caseId = params.id;
    if (!caseId) {
      return NextResponse.json(
        { error: "Case ID is required" },
        { status: 400 }
      );
    }

    // Fetch the lesion case with all details
    const lesionCase = await prisma.lesionCase.findUnique({
      where: { id: caseId },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                profile: true,
              },
            },
          },
        },
        images: {
          orderBy: {
            createdAt: "desc",
          },
        },
        analysisResults: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            abcdeResults: true,
            similarCases: true,
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        appointments: {
          where: {
            date: { gt: new Date() },
          },
          orderBy: {
            date: "asc",
          },
          take: 1,
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                role: true,
                image: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        notes: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesionCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Check if this case belongs to the authenticated user
    if (lesionCase.patient.user.id !== userId) {
      return NextResponse.json(
        { error: "You do not have permission to view this case" },
        { status: 403 }
      );
    }

    // Format data for mobile app
    const latestAnalysis = lesionCase.analysisResults[0];
    const latestImage = lesionCase.images[0];

    // Find the next appointment if any
    const nextAppointment = lesionCase.appointments[0];

    // Format the response
    const caseDetail = {
      id: lesionCase.id,
      caseNumber: lesionCase.caseNumber,
      createdAt: lesionCase.createdAt.toISOString(),
      updatedAt: lesionCase.updatedAt.toISOString(),
      formattedDate: new Date(lesionCase.createdAt).toLocaleDateString(),
      status: lesionCase.status,
      riskLevel: lesionCase.riskLevel,
      lesionType: lesionCase.lesionType,
      bodyLocation: lesionCase.bodyLocation,
      firstNoticed: lesionCase.firstNoticed
        ? new Date(lesionCase.firstNoticed).toLocaleDateString()
        : null,
      symptoms: lesionCase.symptoms,
      diagnosis: lesionCase.diagnosis,
      treatmentPlan: lesionCase.treatmentPlan,

      // Images
      images: lesionCase.images.map((img) => ({
        id: img.id,
        url: img.imageUrl,
        thumbnailUrl: img.thumbnailUrl,
        captureDate: new Date(img.captureDate).toLocaleDateString(),
        bodyLocation: img.bodyLocation,
        lesionSize: img.lesionSize,
        notes: img.notes,
        createdAt: img.createdAt.toISOString(),
      })),

      // Analysis
      latestAnalysis: latestAnalysis
        ? {
            id: latestAnalysis.id,
            riskLevel: latestAnalysis.riskLevel,
            confidence: latestAnalysis.confidence,
            lesionType: latestAnalysis.lesionType,
            observations: latestAnalysis.observations,
            recommendations: latestAnalysis.recommendations,
            reviewedByDoctor: latestAnalysis.reviewedByDoctor,
            doctorNotes: latestAnalysis.doctorNotes,
            createdAt: latestAnalysis.createdAt.toISOString(),
            formattedDate: new Date(
              latestAnalysis.createdAt
            ).toLocaleDateString(),
            analyst:
              latestAnalysis.reviewedByDoctor && latestAnalysis.user
                ? {
                    name: latestAnalysis.user.profile
                      ? `Dr. ${latestAnalysis.user.profile.firstName} ${latestAnalysis.user.profile.lastName}`
                      : latestAnalysis.user.name,
                    role: latestAnalysis.user.role,
                  }
                : { name: "AI Analysis", role: "SYSTEM" },

            // ABCDE criteria
            abcdeResults: latestAnalysis.abcdeResults
              ? {
                  asymmetry: latestAnalysis.abcdeResults.asymmetry,
                  asymmetryScore: latestAnalysis.abcdeResults.asymmetryScore,
                  border: latestAnalysis.abcdeResults.border,
                  borderScore: latestAnalysis.abcdeResults.borderScore,
                  color: latestAnalysis.abcdeResults.color,
                  colorScore: latestAnalysis.abcdeResults.colorScore,
                  diameter: latestAnalysis.abcdeResults.diameter,
                  diameterValue: latestAnalysis.abcdeResults.diameterValue,
                  evolution: latestAnalysis.abcdeResults.evolution,
                  evolutionNotes: latestAnalysis.abcdeResults.evolutionNotes,
                  totalFlags: latestAnalysis.abcdeResults.totalFlags,
                }
              : null,

            // Similar cases
            similarCases: latestAnalysis.similarCases.map((similar) => ({
              id: similar.id,
              caseNumber: similar.caseNumber,
              imageUrl: similar.imageUrl,
              diagnosis: similar.diagnosis,
              riskLevel: similar.riskLevel,
              similarityScore: similar.similarityScore,
            })),
          }
        : null,

      // Next appointment
      nextAppointment: nextAppointment
        ? {
            id: nextAppointment.id,
            date: nextAppointment.date.toISOString(),
            formattedDate: new Date(nextAppointment.date).toLocaleDateString(),
            formattedTime: new Date(nextAppointment.date).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
            type: nextAppointment.type,
            location: nextAppointment.location,
            doctor: {
              id: nextAppointment.doctor.id,
              name: nextAppointment.doctor.profile
                ? `Dr. ${nextAppointment.doctor.profile.firstName} ${nextAppointment.doctor.profile.lastName}`
                : nextAppointment.doctor.name,
              image: nextAppointment.doctor.image,
            },
          }
        : null,

      // Notes
      notes: lesionCase.notes
        .filter((note) => !note.isPrivate || note.user.role !== "PATIENT")
        .map((note) => ({
          id: note.id,
          content: note.content,
          createdAt: note.createdAt.toISOString(),
          formattedDate: new Date(note.createdAt).toLocaleDateString(),
          author: {
            id: note.user.id,
            name: note.user.profile
              ? `${note.user.profile.firstName} ${note.user.profile.lastName}`
              : note.user.name,
            role: note.user.role,
          },
        })),
    };

    // Return success response
    return NextResponse.json({
      success: true,
      data: caseDetail,
    });
  } catch (error: any) {
    console.error("Error fetching case detail:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch case detail" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params:p }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const params = await p;
    // Find the case and check if it belongs to the user
    const lesionCase = await prisma.lesionCase.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!lesionCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Check if the user has permission to delete this case
    if (lesionCase.patient.userId !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this case" },
        { status: 403 }
      );
    }

    // Delete the case and all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete appointments associated with the case
      await tx.appointment.deleteMany({
        where: { lesionCaseId: params.id },
      });

      // Delete case notes
      await tx.caseNote.deleteMany({
        where: { lesionCaseId: params.id },
      });

      // Find analysis results to delete related ABCDE criteria and similar cases
      const analysisResults = await tx.analysisResult.findMany({
        where: { lesionCaseId: params.id },
        select: { id: true },
      });

      const analysisIds = analysisResults.map((a) => a.id);

      // Delete ABCDE criteria
      if (analysisIds.length > 0) {
        await tx.aBCDECriteria.deleteMany({
          where: { analysisResultId: { in: analysisIds } },
        });

        // Delete similar cases
        await tx.similarCase.deleteMany({
          where: { analysisResultId: { in: analysisIds } },
        });
      }

      // Delete analysis results
      await tx.analysisResult.deleteMany({
        where: { lesionCaseId: params.id },
      });

      // Delete images
      await tx.imageUpload.deleteMany({
        where: { lesionCaseId: params.id },
      });

      // Finally delete the case itself
      await tx.lesionCase.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Case and all related data deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting case:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete case" },
      { status: 500 }
    );
  }
}
