import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession, requireAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit2, FileEdit, Save } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ABCDEDetails } from "@/components/abcde-details";
import { ImageEditForm } from "@/components/image-edit-form";
import { Suspense } from "react";
import { AnalysisEditForm } from "@/components/AnalysisEditForm";

interface ImageDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: {
    edit?: string;
    editAnalysis?: string; // New query param for editing analysis
  };
}

async function getImageDetails(imageId: string) {
  await requireAuth();

  const image = await prisma.imageUpload.findUnique({
    where: { id: imageId },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      lesionCase: {
        include: {
          analysisResults: {
            include: {
              abcdeResults: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
      analysisResults: {
        include: {
          abcdeResults: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return image;
}

export default async function ImageDetailPage({
  params: p,
  searchParams,
}: ImageDetailPageProps) {
  const isEditMode = searchParams.edit === "true";
  const isAnalysisEditMode = searchParams.editAnalysis === "true"; // New state
  const params = await p;
  const image = await getImageDetails(params.id);
  const session = await getSession(); // Get current user session

  if (!image) {
    notFound();
  }

  // Find the latest analysis result (either from lesionCase or directly related to the image)
  const analysisResult =
    image.lesionCase?.analysisResults?.[0] || image.analysisResults?.[0];

  const patientName = image.user.profile
    ? `${image.user.profile.firstName} ${image.user.profile.lastName}`
    : image.user.name || "Unknown Patient";

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "bg-green-100 text-green-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "HIGH":
        return "bg-red-100 text-red-700";
      case "CRITICAL":
        return "bg-red-200 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/dashboard/patients/${image.user.id}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Image Details</h2>
        </div>

        <Button
          variant={isEditMode ? "default" : "outline"}
          asChild={!isEditMode}
        >
          {isEditMode ? (
            <span>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </span>
          ) : (
            <Link href={`/dashboard/images/${params.id}?edit=true`}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Details
            </Link>
          )}
        </Button>
        {!isAnalysisEditMode && (
          <Button
            variant={isEditMode ? "default" : "outline"}
            asChild={!isEditMode}
          >
            {/* ... existing edit image button code ... */}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Image */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Lesion Image</CardTitle>
            <CardDescription>
              Captured on {new Date(image.captureDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square relative rounded-lg overflow-hidden">
              <Image
                src={image.imageUrl}
                alt="Lesion image"
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Image Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Patient:</span>
                  <span className="font-medium">{patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Case Number:</span>
                  <span className="font-medium">
                    {image.lesionCase?.caseNumber || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Body Location:</span>
                  <span className="font-medium">
                    {image.bodyLocation?.replace("_", " ") || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lesion Size:</span>
                  <span className="font-medium">
                    {image.lesionSize ? `${image.lesionSize} mm` : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Uploaded:</span>
                  <span className="font-medium">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Middle column - Analysis Results */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                AI-based assessment of the lesion
              </CardDescription>
            </div>
            {!isEditMode && (
              <Button
                variant={isAnalysisEditMode ? "default" : "outline"}
                size="sm"
                asChild={!isAnalysisEditMode}
              >
                {isAnalysisEditMode ? (
                  <span>
                    <Save className="mr-2 h-4 w-4" />
                    Save Analysis
                  </span>
                ) : (
                  <Link
                    href={`/dashboard/images/${params.id}?editAnalysis=true`}
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    {analysisResult ? "Edit Analysis" : "Add Analysis"}
                  </Link>
                )}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isAnalysisEditMode ? (
              <AnalysisEditForm
                image={image}
                existingAnalysis={analysisResult}
              />
            ) : analysisResult ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Risk Level:</span>
                    <Badge className={getRiskBadge(analysisResult.riskLevel)}>
                      {analysisResult.riskLevel} Risk
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Lesion Type:</span>
                    <span>{analysisResult.lesionType.replace("_", " ")}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Confidence:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${analysisResult.confidence}%` }}
                        />
                      </div>
                      <span>{analysisResult.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Observations</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {analysisResult.observations || "No observations recorded"}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {analysisResult.recommendations ||
                      "No recommendations provided"}
                  </p>
                </div>

                {analysisResult.abcdeResults && (
                  <Suspense fallback={<div>Loading ABCDE analysis...</div>}>
                    <ABCDEDetails abcdeResults={analysisResult.abcdeResults} />
                  </Suspense>
                )}

                {analysisResult.reviewedByDoctor && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg">
                    <h4 className="font-medium text-green-800">
                      Doctor Reviewed
                    </h4>
                    <p className="text-sm text-green-700">
                      This analysis has been reviewed by a doctor.
                    </p>
                    {analysisResult.doctorNotes && (
                      <div className="mt-2">
                        <h5 className="text-sm font-medium text-green-800">
                          Doctor Notes:
                        </h5>
                        <p className="text-sm text-green-700">
                          {analysisResult.doctorNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No analysis results available for this image</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column - Edit form or Notes */}
        {!isAnalysisEditMode && (
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>
                {isEditMode ? "Edit Image Details" : "Notes & Additional Info"}
              </CardTitle>
              <CardDescription>
                {isEditMode
                  ? "Update information about this image"
                  : "Additional information about this image"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditMode ? (
                <ImageEditForm image={image} />
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Patient Notes</h4>
                    <div className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {image.notes || "No notes provided for this image"}
                      </p>
                    </div>
                  </div>

                  {image.lesionCase && (
                    <div>
                      <h4 className="font-medium mb-2">Case Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <Badge variant="outline">
                            {image.lesionCase.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">First Noticed:</span>
                          <span>
                            {image.lesionCase.firstNoticed
                              ? new Date(
                                  image.lesionCase.firstNoticed
                                ).toLocaleDateString()
                              : "Unknown"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Symptoms:</span>
                          <span className="text-right">
                            {image.lesionCase.symptoms || "None reported"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Diagnosis:</span>
                          <span className="text-right">
                            {image.lesionCase.diagnosis || "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {/* When in analysis edit mode, we can show reference data or guidelines here */}
        {isAnalysisEditMode && (
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Analysis Guidelines</CardTitle>
              <CardDescription>
                Reference information for skin lesion assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">ABCDE Rule</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
                    <li>
                      <strong>A</strong>symmetry: One half is unlike the other
                      half
                    </li>
                    <li>
                      <strong>B</strong>order: Irregular, ragged, notched, or
                      blurred edges
                    </li>
                    <li>
                      <strong>C</strong>olor: Variety of colors or uneven
                      distribution
                    </li>
                    <li>
                      <strong>D</strong>iameter: Larger than 6mm (pencil eraser)
                    </li>
                    <li>
                      <strong>E</strong>volving: Changing in size, shape, color
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Risk Level Guidelines</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
                    <li>
                      <strong>Low</strong>: 0-1 ABCDE criteria, benign
                      appearance
                    </li>
                    <li>
                      <strong>Medium</strong>: 2 ABCDE criteria, requires
                      monitoring
                    </li>
                    <li>
                      <strong>High</strong>: 3+ ABCDE criteria, suspicious
                      features
                    </li>
                    <li>
                      <strong>Critical</strong>: Clear malignant features,
                      immediate action needed
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
