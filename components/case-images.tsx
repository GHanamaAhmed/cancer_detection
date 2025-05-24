import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";

interface CaseImagesProps {
  patientId: string;
}

export async function CaseImages({ patientId }: CaseImagesProps) {
  // Fetch the patient's lesion cases and images
  const patient = await prisma.user.findUnique({
    where: {
      id: patientId,
      role: "PATIENT",
    },
    include: {
      patient: {
        include: {
          lesionCases: {
            include: {
              images: true,
              analysisResults: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  // Get all images from all lesion cases
  const allImages =
    patient?.patient?.lesionCases.flatMap(
      (lesionCase) => lesionCase.images || []
    ) || [];

  if (allImages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No images available for this patient</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allImages.map((image, index) => {
        // Find the lesion case this image belongs to
        const lesionCase = patient?.patient?.lesionCases.find((c) =>
          c.images.some((img) => img.id === image.id)
        );

        // Find the corresponding analysis result
        const analysis = lesionCase?.analysisResults[0];

        return (
          <Card key={image.id} className="overflow-hidden group relative">
            <Link href={`/dashboard/images/${image.id}`} className="block">
              <div className="aspect-square relative">
                <Image
                  src={image.imageUrl || "/placeholder.svg"}
                  alt={`Lesion image ${index + 1}`}
                  fill
                  className="object-cover transition-opacity group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button className="bg-white text-gray-800">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            </Link>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  {image.bodyLocation?.replace("_", " ") || "Location Unknown"}
                </Badge>
                {analysis && (
                  <Badge
                    className={
                      analysis.riskLevel === "LOW"
                        ? "bg-green-100 text-green-700"
                        : analysis.riskLevel === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {analysis.riskLevel} Risk
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(image.createdAt).toLocaleDateString()}
              </p>
              {image.notes && (
                <p className="text-sm mt-1 text-gray-700 line-clamp-2">
                  {image.notes}
                </p>
              )}
              <div className="mt-3 flex justify-end">
                <Link href={`/dashboard/images/${image.id}`}>
                  <Button variant="outline" size="sm">
                    View & Edit
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
