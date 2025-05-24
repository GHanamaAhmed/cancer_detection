"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserCheck, UserPlus, UserX, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ConnectionStatusProps {
  patientId: string;
}

export function ConnectionStatus({ patientId }: ConnectionStatusProps) {
  const [status, setStatus] = useState<
    "connected" | "pending" | "not_connected" | "loading"
  >("loading");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch the current connection status on component mount
  useState(() => {
    fetchConnectionStatus();
  });

  async function fetchConnectionStatus() {
    try {
      const response = await fetch(
        `/api/connection-requests?patientId=${patientId}`
      );
      const data = await response.json();

      if (data.connection && data.connection.status === "APPROVED") {
        setStatus("connected");
      } else if (data.connection && data.connection.status === "PENDING") {
        setStatus("pending");
      } else {
        setStatus("not_connected");
      }
    } catch (error) {
      console.error("Error fetching connection status:", error);
      setStatus("not_connected");
    }
  }

  async function sendConnectionRequest() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/connection-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId }),
      });

      if (response.ok) {
        setStatus("pending");
        toast({
          title: "Connection request sent",
          description: "The patient will be notified of your request.",
        });
      } else {
        throw new Error("Failed to send connection request");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function updateConnectionStatus(newStatus: "APPROVED" | "DECLINED") {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/connection-requests/${patientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        if (newStatus === "APPROVED") {
          setStatus("connected");
          toast({
            title: "Connection approved",
            description: "You are now connected with this patient.",
          });
        } else {
          setStatus("not_connected");
          toast({
            title: "Connection declined",
            description: "The connection request has been declined.",
          });
        }
      } else {
        throw new Error(
          `Failed to ${newStatus.toLowerCase()} connection request`
        );
      }
    } catch (error) {
      console.error(`Error ${newStatus.toLowerCase()}ing connection:`, error);
      toast({
        title: "Error",
        description: `Failed to ${newStatus.toLowerCase()} connection. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (status === "connected") {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1 px-3 py-1 h-9">
        <UserCheck className="h-4 w-4" />
        Connected
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateConnectionStatus("APPROVED")}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserCheck className="mr-2 h-4 w-4" />
          )}
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateConnectionStatus("DECLINED")}
          disabled={isLoading}
          className="text-red-600 hover:text-red-700"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserX className="mr-2 h-4 w-4" />
          )}
          Decline
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={sendConnectionRequest}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      Connect
    </Button>
  );
}
