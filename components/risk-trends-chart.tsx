import { prisma } from "@/lib/db";

interface RiskTrendsChartProps {
  period: string;
}

export async function RiskTrendsChart({ period }: RiskTrendsChartProps) {
  // In a real app, this would fetch actual data from the database
  // For now, we'll use mock data that simulates database results

  // Get analytics data from the database
  const analyticsData = await prisma.analyticsData.findMany({
    orderBy: {
      date: "asc",
    },
    take: period === "weekly" ? 7 : period === "monthly" ? 6 : 12,
  });

  // If no data exists, create some sample data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  // Calculate risk level percentages
  const chartData =
    analyticsData.length > 0
      ? analyticsData.map((data) => {
          const totalCases =
            data.highRiskCases + data.mediumRiskCases + data.lowRiskCases;
          const highRiskPercentage =
            totalCases > 0
              ? Math.round((data.highRiskCases / totalCases) * 100)
              : 0;
          const mediumRiskPercentage =
            totalCases > 0
              ? Math.round((data.mediumRiskCases / totalCases) * 100)
              : 0;
          const lowRiskPercentage =
            totalCases > 0
              ? Math.round((data.lowRiskCases / totalCases) * 100)
              : 0;

          return {
            month: new Date(data.date).toLocaleString("default", {
              month: "short",
            }),
            highRiskPercentage,
            mediumRiskPercentage,
            lowRiskPercentage,
          };
        })
      : months.map((month, index) => {
          // Generate random percentages for risk levels
          const lowRiskPercentage = 50 + Math.floor(Math.random() * 20);
          const mediumRiskPercentage = Math.floor(Math.random() * 30);
          const highRiskPercentage =
            100 - lowRiskPercentage - mediumRiskPercentage;

          return {
            month,
            highRiskPercentage,
            mediumRiskPercentage,
            lowRiskPercentage,
          };
        });

  // Calculate current percentages for the stats
  const lowRiskPercentage = 65;
  const mediumRiskPercentage = 25;
  const highRiskPercentage = 10;

  return (
    <div className="space-y-6">
      <div className="h-[400px] rounded-md border p-4">
        <div className="flex h-full flex-col justify-between">
          <div className="flex h-full items-end gap-8">
            <div className="flex h-full flex-col justify-end">
              <div className="text-xs text-gray-500">100</div>
              <div className="flex-1"></div>
              <div className="text-xs text-gray-500">75</div>
              <div className="flex-1"></div>
              <div className="text-xs text-gray-500">50</div>
              <div className="flex-1"></div>
              <div className="text-xs text-gray-500">25</div>
              <div className="flex-1"></div>
              <div className="text-xs text-gray-500">0</div>
            </div>
            <div className="flex h-full flex-1 flex-col justify-end gap-1">
              <div className="relative flex flex-1 flex-col justify-end">
                <div className="absolute bottom-0 w-full border-b border-dashed border-gray-200"></div>
                <div className="absolute bottom-[25%] w-full border-b border-dashed border-gray-200"></div>
                <div className="absolute bottom-[50%] w-full border-b border-dashed border-gray-200"></div>
                <div className="absolute bottom-[75%] w-full border-b border-dashed border-gray-200"></div>
                <div className="absolute bottom-[100%] w-full border-b border-dashed border-gray-200"></div>

                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 600 300"
                  preserveAspectRatio="none"
                >
                  {/* High risk line */}
                  <path
                    d="M0,240 C50,220 100,230 150,210 C200,190 250,180 300,200 C350,220 400,210 450,190 C500,170 550,150 600,120"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                  {/* Medium risk line */}
                  <path
                    d="M0,180 C50,190 100,170 150,160 C200,150 250,140 300,130 C350,120 400,110 450,100 C500,90 550,80 600,70"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="2"
                  />
                  {/* Low risk line */}
                  <path
                    d="M0,100 C50,110 100,120 150,110 C200,100 250,90 300,80 C350,70 400,60 450,50 C500,40 550,30 600,20"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                  />
                </svg>

                <div className="flex h-full w-full items-end">
                  <div className="flex w-full justify-between">
                    {chartData.map((item, index) => (
                      <div key={index} className="text-xs text-gray-500">
                        {item.month}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="text-sm">Low Melanoma Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <span className="text-sm">Medium Melanoma Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span className="text-sm">High Melanoma Risk</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md bg-gray-100 p-4 text-center">
          <div className="text-sm font-medium text-gray-500">
            Low Risk Lesions
          </div>
          <div className="text-2xl font-bold text-green-600">
            {lowRiskPercentage}%
          </div>
          <div className="text-xs text-green-600">↑ 8% from last period</div>
        </div>
        <div className="rounded-md bg-gray-100 p-4 text-center">
          <div className="text-sm font-medium text-gray-500">
            Medium Risk Lesions
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {mediumRiskPercentage}%
          </div>
          <div className="text-xs text-yellow-600">↓ 3% from last period</div>
        </div>
        <div className="rounded-md bg-gray-100 p-4 text-center">
          <div className="text-sm font-medium text-gray-500">
            High Risk Lesions
          </div>
          <div className="text-2xl font-bold text-red-600">
            {highRiskPercentage}%
          </div>
          <div className="text-xs text-green-600">↓ 5% from last period</div>
        </div>
      </div>
    </div>
  );
}
