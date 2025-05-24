"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FilterIcon, UserCheck } from "lucide-react";
import Link from "next/link";

interface PatientFiltersProps {
  currentRisk: string;
  currentSort: string;
  currentConnection?: string;
}

export function PatientFilters({
  currentRisk,
  currentSort,
  currentConnection = "all",
}: PatientFiltersProps) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <FilterIcon className="h-3.5 w-3.5" />
            <span>Risk: {currentRisk === "all" ? "All" : currentRisk}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/patients?risk=all&sort=${currentSort}&connection=${currentConnection}`}
            >
              All
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/patients?risk=low&sort=${currentSort}&connection=${currentConnection}`}
            >
              Low
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/patients?risk=medium&sort=${currentSort}&connection=${currentConnection}`}
            >
              Medium
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/patients?risk=high&sort=${currentSort}&connection=${currentConnection}`}
            >
              High
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
