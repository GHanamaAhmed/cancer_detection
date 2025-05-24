"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/pagination-controls";
import { Search, MessageSquare, Calendar, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

type Patient = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    gender: string | null;
  } | null;
  connectionDate: string;
};

export function PatientNetwork() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, [pagination.page, searchQuery]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // This would be a real API call in production
      // For now, we'll simulate a network request with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockPatients: Patient[] = Array.from({ length: 8 }).map((_, i) => ({
        id: `patient-${i + 1}`,
        name: `Patient ${i + 1}`,
        email: `patient${i + 1}@example.com`,
        image: null,
        profile: {
          firstName: `First${i + 1}`,
          lastName: `Last${i + 1}`,
          dateOfBirth: "1990-01-01",
          gender: i % 2 === 0 ? "Male" : "Female",
        },
        connectionDate: new Date(Date.now() - i * 86400000 * 30).toISOString(),
      }));

      // Filter by search query
      const filteredPatients = searchQuery
        ? mockPatients.filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.email.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : mockPatients;

      setPatients(filteredPatients);
      setPagination({
        total: filteredPatients.length,
        pages: Math.ceil(filteredPatients.length / pagination.limit),
        page: pagination.page,
        limit: pagination.limit,
      });
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch patient network",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button>Add Patient</Button>
      </div>

      {patients.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No patients in your network
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="flex flex-col rounded-lg border p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={patient.image || undefined}
                        alt={patient.name}
                      />
                      <AvatarFallback>
                        {getInitials(patient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {patient.email}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>View Medical Records</DropdownMenuItem>
                      <DropdownMenuItem>Remove Connection</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="text-sm">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-muted-foreground">Connected:</div>
                    <div>{formatDate(patient.connectionDate)}</div>
                    {patient.profile?.dateOfBirth && (
                      <>
                        <div className="text-muted-foreground">
                          Date of Birth:
                        </div>
                        <div>{formatDate(patient.profile.dateOfBirth)}</div>
                      </>
                    )}
                    {patient.profile?.gender && (
                      <>
                        <div className="text-muted-foreground">Gender:</div>
                        <div>{patient.profile.gender}</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-auto pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/dashboard/chat?patient=${patient.id}`}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link
                      href={`/dashboard/appointments?patient=${patient.id}`}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <PaginationControls
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, page }))
              }
            />
          )}
        </>
      )}
    </div>
  );
}
