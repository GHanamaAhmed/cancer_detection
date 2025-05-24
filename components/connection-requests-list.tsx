"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/pagination-controls";
import { Prisma } from "@prisma/client";

export function ConnectionRequestsList() {
  const [requests, setRequests] = useState<
    Prisma.ConnectionRequestGetPayload<{
      include: {
        patient: {
          include: {
            user: {
              include: {
                profile: true;
              };
            };
          };
        };
      };
    }>[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "DECLINED">(
    "PENDING"
  );
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [status, pagination.page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/connection-requests?status=${status}&page=${pagination.page}&limit=${pagination.limit}`
      );
      const data = await response.json();
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching connection requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch connection requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: "APPROVED" | "DECLINED"
  ) => {
    try {
      const response = await fetch(`/api/connection-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update request status");
      }

      toast({
        title: `Request ${newStatus.toLowerCase()}`,
        description: `You have ${newStatus.toLowerCase()} the connection request.`,
      });

      // Refresh the list
      fetchRequests();
    } catch (error) {
      console.error("Error updating connection request:", error);
      toast({
        title: "Error",
        description: "Failed to update connection request",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <div className="ml-auto flex space-x-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="PENDING"
        onValueChange={(value) => setStatus(value as any)}
      >
        <TabsList>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="DECLINED">Declined</TabsTrigger>
        </TabsList>
      </Tabs>

      {requests.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No {status.toLowerCase()} connection requests
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 p-4 rounded-lg border"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={request.patient.user.image || undefined}
                    alt={request.patient.user.name || "User Avatar"}
                  />
                  <AvatarFallback>
                    {getInitials(request.patient.user.name || "User")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{request.patient.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {request.patient.user.email}
                  </div>
                  {request.message && (
                    <div className="mt-1 text-sm italic">
                      "{request.message}"
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto">
                {status === "PENDING" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(request.id, "DECLINED")}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(request.id, "APPROVED")}
                    >
                      Approve
                    </Button>
                  </>
                ) : (
                  <Badge
                    variant={status === "APPROVED" ? "default" : "destructive"}
                  >
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </Badge>
                )}
              </div>
            </div>
          ))}

          {pagination.pages > 1 && (
            <PaginationControls
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, page }))
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
