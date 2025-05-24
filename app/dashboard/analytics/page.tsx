import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileDown } from "lucide-react";
import { PatientDistributionChart } from "@/components/patient-distribution-chart";
import { DetectionRatesChart } from "@/components/detection-rates-chart";
import { RiskTrendsChart } from "@/components/risk-trends-chart";
import { requireAuth } from "@/lib/auth";
import { Suspense } from "react";
import { AnalyticsFilterButtons } from "@/components/analytics-filter-buttons";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { period?: string; tab?: string };
}) {
  await requireAuth();

  const period = searchParams.period || "monthly";
  const tab = searchParams.tab || "distribution";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Skin Cancer Analytics
          </h2>
          <p className="text-gray-500">
            View and export skin lesion data and melanoma statistics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <AnalyticsFilterButtons currentPeriod={period} />

      <Tabs defaultValue={tab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="distribution" asChild>
            <a href={`/dashboard/analytics?period=${period}&tab=distribution`}>
              Patient Distribution
            </a>
          </TabsTrigger>
          <TabsTrigger value="detection" asChild>
            <a href={`/dashboard/analytics?period=${period}&tab=detection`}>
              Melanoma Detection
            </a>
          </TabsTrigger>
          <TabsTrigger value="trends" asChild>
            <a href={`/dashboard/analytics?period=${period}&tab=trends`}>
              Risk Trends
            </a>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Patient Distribution</CardTitle>
              <CardDescription>
                Distribution of skin cancer patients by age, gender, and
                geography
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="h-[400px] flex items-center justify-center">
                    Loading chart data...
                  </div>
                }
              >
                <PatientDistributionChart period={period} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="detection">
          <Card>
            <CardHeader>
              <CardTitle>Melanoma Detection Rates</CardTitle>
              <CardDescription>
                Early vs. late melanoma detection rates over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="h-[400px] flex items-center justify-center">
                    Loading chart data...
                  </div>
                }
              >
                <DetectionRatesChart period={period} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Lesion Risk Trends</CardTitle>
              <CardDescription>
                Changes in skin cancer risk levels over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="h-[400px] flex items-center justify-center">
                    Loading chart data...
                  </div>
                }
              >
                <RiskTrendsChart period={period} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
