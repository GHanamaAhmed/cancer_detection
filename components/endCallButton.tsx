"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
export default function EndCallButton({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const router = useRouter();
  // Helper function to update room status
  const updateRoomStatus = async (status: "ENDED") => {
    try {
      const res = await fetch("/api/appointments/" + appointmentId, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to update room status");
      }
      router.refresh();
    } catch (e) {
      console.error(`Error updating room status to ${status}:`, e);
    }
  };
  return (
    <Button
      onClick={async () => await updateRoomStatus("ENDED")}
      size="default"
      variant="destructive"
    >
      End Call
    </Button>
  );
}
