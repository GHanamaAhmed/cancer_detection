import { prisma } from "@/lib/db";

export async function LesionRiskDistribution() {
  // Fetch risk distribution data from the database
  const analysisResults = await prisma.analysisResult.findMany();

  // Count the number of cases in each risk category
  const riskCounts = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
    UNKNOWN: 0,
  };

  analysisResults.forEach((result) => {
    riskCounts[result.riskLevel]++;
  });

  // Calculate percentages
  const totalCases = analysisResults.length;
  const lowRiskPercentage =
    totalCases > 0 ? Math.round((riskCounts.LOW / totalCases) * 100) : 0;
  const mediumRiskPercentage =
    totalCases > 0 ? Math.round((riskCounts.MEDIUM / totalCases) * 100) : 0;
  const highRiskPercentage =
    totalCases > 0
      ? Math.round(((riskCounts.HIGH + riskCounts.CRITICAL) / totalCases) * 100)
      : 0;

  // If no data exists, use sample data
  const displayData = {
    lowRisk: totalCases > 0 ? lowRiskPercentage : 65,
    mediumRisk: totalCases > 0 ? mediumRiskPercentage : 25,
    highRisk: totalCases > 0 ? highRiskPercentage : 10,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span>Low Risk</span>
        </div>
        <div className="font-medium">{displayData.lowRisk}%</div>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-green-500"
          style={{ width: `${displayData.lowRisk}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <span>Medium Risk</span>
        </div>
        <div className="font-medium">{displayData.mediumRisk}%</div>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-yellow-500"
          style={{ width: `${displayData.mediumRisk}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span>High Risk</span>
        </div>
        <div className="font-medium">{displayData.highRisk}%</div>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-red-500"
          style={{ width: `${displayData.highRisk}%` }}
        ></div>
      </div>
    </div>
  );
}
