"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface AnalyticsFilterButtonsProps {
  currentPeriod: string;
}

export function AnalyticsFilterButtons({
  currentPeriod,
}: AnalyticsFilterButtonsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  const handlePeriodChange = (period: string) => {
    router.push(`${pathname}?${createQueryString("period", period)}`);
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Button
        variant="outline"
        className={`rounded-full ${
          currentPeriod === "weekly" ? "bg-blue-50 text-blue-600" : ""
        }`}
        onClick={() => handlePeriodChange("weekly")}
      >
        Weekly
      </Button>
      <Button
        variant="outline"
        className={`rounded-full ${
          currentPeriod === "monthly" ? "bg-blue-50 text-blue-600" : ""
        }`}
        onClick={() => handlePeriodChange("monthly")}
      >
        Monthly
      </Button>
      <Button
        variant="outline"
        className={`rounded-full ${
          currentPeriod === "yearly" ? "bg-blue-50 text-blue-600" : ""
        }`}
        onClick={() => handlePeriodChange("yearly")}
      >
        Yearly
      </Button>
      <Button
        variant="outline"
        className={`rounded-full ${
          currentPeriod === "custom" ? "bg-blue-50 text-blue-600" : ""
        }`}
        onClick={() => handlePeriodChange("custom")}
      >
        Custom Range
      </Button>
    </div>
  );
}
