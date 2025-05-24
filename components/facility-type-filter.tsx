"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface FacilityTypeFilterProps {
  currentType: string;
}

export function FacilityTypeFilter({ currentType }: FacilityTypeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  const handleTypeChange = (type: string) => {
    router.push(`${pathname}?${createQueryString("type", type)}`);
  };

  const facilityTypes = [
    { value: "ALL", label: "All Types" },
    { value: "DERMATOLOGY_CLINIC", label: "Dermatology Clinic" },
    { value: "CANCER_CENTER", label: "Cancer Center" },
    { value: "HOSPITAL", label: "Hospital" },
    { value: "LABORATORY", label: "Laboratory" },
    { value: "RESEARCH_CENTER", label: "Research Center" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {facilityTypes.map((type) => (
        <Button
          key={type.value}
          variant="outline"
          size="sm"
          className={
            currentType === type.value ? "bg-blue-50 text-blue-600" : ""
          }
          onClick={() => handleTypeChange(type.value)}
        >
          {type.label}
        </Button>
      ))}
    </div>
  );
}
