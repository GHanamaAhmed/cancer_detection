import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, UserCheck } from "lucide-react";
import { VideoCallHistory } from "@/components/video-call-history";
import { AvailableCalls } from "@/components/available-calls";
import { requireAuth } from "@/lib/auth";
import { Suspense } from "react";
import { VideoCallHistorySkeleton } from "@/components/video-call-history-skeleton";
import Link from "next/link";

export default async function VideoPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const user = await requireAuth();
  const tab = searchParams.tab || "active";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight dark:text-white">
            Video Consultations
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Conduct video calls with patients
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" asChild>
          <Link href="/dashboard/appointments/new?type=VIDEO_CONSULTATION">
            <Plus className="mr-2 h-4 w-4" />
            New Video Call
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={tab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="active" asChild>
            <a href="/dashboard/video?tab=active">Available Calls</a>
          </TabsTrigger>
          <TabsTrigger value="history" asChild>
            <a href="/dashboard/video?tab=history">Call History</a>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Card className="dark:bg-gray-950 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">
                Available Video Calls
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Join video consultations with confirmed appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<VideoCallHistorySkeleton />}>
                <AvailableCalls userId={user.id} />
              </Suspense>
            </CardContent>
            <div className="px-6 py-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm border-t dark:border-gray-800">
              <p className="flex items-center">
                <UserCheck className="h-4 w-4 mr-2" />
                Note: You can conduct video consultations with patients at any
                time, even outside of scheduled hours.
              </p>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card className="dark:bg-gray-950 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">
                Video Call History
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Past and upcoming video consultations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<VideoCallHistorySkeleton />}>
                <VideoCallHistory userId={user.id} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
