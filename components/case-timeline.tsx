import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface CaseTimelineProps {
  patientId: string;
}

export async function CaseTimeline({ patientId }: CaseTimelineProps) {
  // Fetch the patient's lesion cases with analysis
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
              analysisResults: {
                orderBy: {
                  createdAt: "asc",
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });

  // Create a timeline with all events (case creations, analyses, etc)
  const timeline = [];

  // Add all lesion cases
  if (patient?.patient?.lesionCases) {
    for (const lesionCase of patient.patient.lesionCases) {
      // Add the case creation event
      timeline.push({
        date: lesionCase.createdAt,
        type: "CASE_CREATED",
        title: `Case ${lesionCase.caseNumber} Created`,
        description: `New skin lesion case created${
          lesionCase.bodyLocation
            ? ` for ${lesionCase.bodyLocation.toLowerCase()}`
            : ""
        }`,
        data: lesionCase,
      });

      // Add analysis results
      for (const analysis of lesionCase.analysisResults) {
        timeline.push({
          date: analysis.createdAt,
          type: "ANALYSIS",
          title: `Analysis Completed`,
          description:
            analysis.observations || `Risk level: ${analysis.riskLevel}`,
          data: analysis,
        });
      }
    }
  }

  // Sort the timeline by date, newest first
  timeline.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (timeline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No timeline events available for this patient</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timeline.map((event, index) => (
        <div
          key={index}
          className="relative pl-6 pb-6 border-l border-gray-200"
        >
          <div className="absolute left-0 top-0 -ml-[5px] h-[10px] w-[10px] rounded-full bg-blue-500"></div>
          <div className="mb-1 text-xs text-gray-500">
            {format(new Date(event.date), "PPpp")}
          </div>
          <h4 className="font-medium flex items-center gap-2">
            {event.title}
            {event.type === "ANALYSIS" && event.data.riskLevel && (
              <Badge
                className={
                  event.data.riskLevel === "LOW"
                    ? "bg-green-100 text-green-700"
                    : event.data.riskLevel === "MEDIUM"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }
              >
                {event.data.riskLevel}
              </Badge>
            )}
          </h4>
          <p className="text-sm text-gray-600">{event.description}</p>
        </div>
      ))}
    </div>
  );
}
