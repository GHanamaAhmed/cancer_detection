import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  MessageSquare,
  Video,
  ChevronLeft,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseImages } from "@/components/case-images";
import { CaseTimeline } from "@/components/case-timeline";
import { CaseNotes } from "@/components/case-notes";
import { ConnectionStatus } from "@/components/connection-status";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { requireAuth, getSession } from "@/lib/auth";
import Link from "next/link";
import { Suspense } from "react";
import { formatDistanceToNow } from "date-fns";

// Add these loaders
async function getPatientData(id: string) {
  const session = await getSession();
  await requireAuth();

  // Get the patient with their lesion cases and related data
  const patient = await prisma.user.findUnique({
    where: {
      id: id,
      role: "PATIENT",
    },
    include: {
      profile: true,
      patient: {
        include: {
          lesionCases: {
            include: {
              images: true,
              analysisResults: {
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          ConnectionRequest: {
            where: {
              doctor: {
                userId: session?.user.id,
              },
            },
          },
        },
      },
    },
  });

  return patient;
}

export default async function CaseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Get patient data
  const patient = await getPatientData(params.id);

  // If patient not found, show 404
  if (!patient || !patient.patient) {
    notFound();
  }

  // Get the latest lesion case
  const latestCase = patient.patient.lesionCases[0];

  // Get the latest analysis result
  const latestAnalysis = latestCase?.analysisResults[0];

  // Get connection status
  const connection = patient.patient.ConnectionRequest[0];

  // Format the name
  const name = patient.profile
    ? `${patient.profile.firstName} ${patient.profile.lastName}`
    : patient.name || "Unknown Patient";

  // Format initials
  const initials = patient.profile
    ? `${patient.profile.firstName.charAt(0)}${patient.profile.lastName.charAt(
        0
      )}`
    : patient.name
        ?.split(" ")
        .map((n) => n.charAt(0))
        .join("") || "??";

  // Get risk level color and text
  const getRiskBadge = (risk: string | undefined) => {
    switch (risk?.toUpperCase()) {
      case "LOW":
        return {
          class: "bg-green-100 text-green-700 hover:bg-green-100",
          text: "Low Melanoma Risk",
        };
      case "MEDIUM":
        return {
          class: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
          text: "Medium Melanoma Risk",
        };
      case "HIGH":
        return {
          class: "bg-red-100 text-red-700 hover:bg-red-100",
          text: "High Melanoma Risk",
        };
      case "CRITICAL":
        return {
          class: "bg-red-200 text-red-700 hover:bg-red-200",
          text: "Critical Melanoma Risk",
        };
      default:
        return {
          class: "bg-gray-100 text-gray-700 hover:bg-gray-100",
          text: "Risk Unknown",
        };
    }
  };

  const riskBadge = getRiskBadge(latestAnalysis?.riskLevel);

  // Format exam date
  const examDate = latestCase
    ? formatDistanceToNow(new Date(latestCase.createdAt), { addSuffix: true })
    : "No exam data";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/dashboard/patients">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Case Detail</h2>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={patient.image || "/placeholder.svg?height=48&width=48"}
              alt={name}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-bold">{name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Exam Date: {examDate}</span>
              {latestAnalysis && (
                <Badge className={`ml-2 ${riskBadge.class}`}>
                  {riskBadge.text}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {/* <ConnectionStatus patientId={params.id} /> */}
          <Button variant="outline" asChild>
            <Link href={`/dashboard/chat?patient=${params.id}`}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/video?patient=${params.id}`}>
              <Video className="mr-2 h-4 w-4" />
              Video Call
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="images">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Case Images</CardTitle>
              <CardDescription>
                Original and processed images with analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading images...</div>}>
                <CaseImages patientId={params.id} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Case Timeline</CardTitle>
              <CardDescription>
                History and progress of the case
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading timeline...</div>}>
                <CaseTimeline patientId={params.id} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Notes</CardTitle>
              <CardDescription>Medical notes and chat history</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading notes...</div>}>
                <CaseNotes patientId={params.id} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
