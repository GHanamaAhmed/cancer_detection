import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { PaginationControls } from "@/components/pagination-controls";
import { getSession, requireAuth } from "@/lib/auth";

interface PatientCasesListProps {
  search: string;
  risk: string;
  sort: string;
  connection?: string;
  page: number;
  pageSize: number;
}

export async function PatientCasesList({
  search,
  risk,
  sort,
  connection = "all",
  page,
  pageSize,
}: PatientCasesListProps) {
  const session = await getSession();
  await requireAuth();
  // Build the query
  const where: any = {
    role: "PATIENT",
    patient: {
      ConnectionRequest: {
        some: {
          doctor: {
            userId: session?.user.id,
          },
          status: "APPROVED",
        },
      },
    },
  };

  // Add search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { profile: { firstName: { contains: search, mode: "insensitive" } } },
      { profile: { lastName: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Add risk filter
  if (risk !== "all") {
    where.patient = {
      lesionCases: {
        some: {
          riskLevel: risk.toUpperCase(),
        },
      },
    };
  }

  // Add connection filter
  if (connection !== "all") {
    if (connection === "connected") {
      where.patient = {
        ...where.patient,
        connections: {
          some: {
            status: "APPROVED",
          },
        },
      };
    } else if (connection === "pending") {
      where.patient = {
        ...where.patient,
        connectionRequests: {
          some: {
            status: "PENDING",
          },
        },
      };
    } else if (connection === "not_connected") {
      where.patient = {
        ...where.patient,
        connections: {
          none: {},
        },
        connectionRequests: {
          none: {},
        },
      };
    }
  }

  // Determine sort order
  let orderBy: any = { createdAt: "desc" };
  if (sort === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (sort === "risk-high") {
    // This is a simplification - in a real app, you'd need a more complex query
    orderBy = { patient: { lesionCases: { riskLevel: "desc" } } };
  } else if (sort === "risk-low") {
    orderBy = { patient: { lesionCases: { riskLevel: "asc" } } };
  }

  // Get total count for pagination
  const totalPatients = await prisma.user.count({
    where,
  });
  const totalPages = Math.ceil(totalPatients / pageSize);

  // Get patients
  const patients = await prisma.user.findMany({
    where,
    include: {
      profile: true,
      patient: {
        include: {
          lesionCases: {
            include: {
              analysisResults: true,
              images: true, // Include the images relation
            },
          },
        },
      },
    },
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  if (patients.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center text-gray-500">
        <p>No patients found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Lesion
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Patient
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Exam Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Risk Level
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => {
              // Determine risk level from lesion cases
              let riskLevel = "low";
              if (
                patient.patient?.lesionCases.some((c) =>
                  c.analysisResults.some(
                    (r) => r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL"
                  )
                )
              ) {
                riskLevel = "high";
              } else if (
                patient.patient?.lesionCases.some((c) =>
                  c.analysisResults.some((r) => r.riskLevel === "MEDIUM")
                )
              ) {
                riskLevel = "medium";
              }

              // Get the latest lesion image if available
              const latestCase = patient.patient?.lesionCases[0];
              const lesionImage =
                latestCase?.images && latestCase.images.length > 0
                  ? latestCase.images[0].imageUrl
                  : "/placeholder.svg?height=60&width=60";

              // Format the name
              const name = patient.profile
                ? `${patient.profile.firstName} ${patient.profile.lastName}`
                : patient.name || "Unknown Patient";

              // Format initials
              const initials = patient.profile
                ? `${patient.profile.firstName.charAt(
                    0
                  )}${patient.profile.lastName.charAt(0)}`
                : patient.name
                    ?.split(" ")
                    .map((n) => n.charAt(0))
                    .join("") || "??";

              // Format exam date
              const examDate = patient.patient?.lastExamDate
                ? new Date(patient.patient.lastExamDate).toLocaleDateString()
                : "No exam";

              return (
                <tr key={patient.id} className="border-b">
                  <td className="px-4 py-3">
                    <div className="h-[60px] w-[60px] rounded-md overflow-hidden">
                      <img
                        src={
                          lesionImage || "/placeholder.svg?height=60&width=60"
                        }
                        alt="Lesion"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={patient.image || "/placeholder.svg"}
                          alt={name}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{name}</p>
                        <p className="text-sm text-gray-500">
                          Patient #{patient.id.substring(0, 8)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{examDate}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={cn(
                        riskLevel === "low" &&
                          "bg-green-100 text-green-700 hover:bg-green-100",
                        riskLevel === "medium" &&
                          "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
                        riskLevel === "high" &&
                          "bg-red-100 text-red-700 hover:bg-red-100"
                      )}
                    >
                      {riskLevel}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        title="Chat"
                        asChild
                      >
                        <Link href={`/dashboard/chat?patient=${patient.id}`}>
                          <MessageSquare className="h-4 w-4" />
                          <span className="sr-only">Chat</span>
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Video Call"
                        asChild
                      >
                        <Link href={`/dashboard/video?patient=${patient.id}`}>
                          <Video className="h-4 w-4" />
                          <span className="sr-only">Video Call</span>
                        </Link>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        asChild
                      >
                        <Link href={`/dashboard/patients/${patient.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/dashboard/patients"
          searchParams={{ search, risk, sort, connection }}
        />
      )}
    </div>
  );
}
