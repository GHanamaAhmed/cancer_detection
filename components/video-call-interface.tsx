"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
// Replace ZegoCloud imports with GetStream imports
import {
  StreamVideo,
  StreamVideoClient,
  Call,
  CallControls,
  SpeakerLayout,
  useCall,
  StreamCall,
  StreamTheme,
} from "@stream-io/video-react-sdk";
// Import styles
import "@stream-io/video-react-sdk/dist/css/styles.css";

interface VideoCallInterfaceProps {
  patientId: string;
  appointmentId: string;
  patientName: string;
}

// Let's create a client reference outside the component to avoid recreating it
let streamClient: StreamVideoClient | null = null;

export function VideoCallInterface({
  patientId,
  appointmentId,
  patientName,
}: VideoCallInterfaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [callStarted, setCallStarted] = useState(false);
  const [call, setCall] = useState<Call | null>(null);
  const [callEnding, setCallEnding] = useState(false);

  const session = useSession();
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [isPastAppointment, setIsPastAppointment] = useState(false);

  // Custom call UI component
  const CallUI = ({ call }: { call: Call }) => {
    // Use the useCall hook to access call state and methods
    const callObject = useCall();

    const handleEndCall = async () => {
      if (callObject) {
        try {
          setCallEnding(true);
          await callObject.leave();
          router.push("/dashboard/video?tab=active");
        } catch (e) {
          console.error("Error ending call:", e);
          router.push("/dashboard/video?tab=active");
        } finally {
          setCallEnding(false);
        }
      }
    };

    return (
      <div className="relative h-full w-full overflow-hidden">
        {/* Display the video view */}
        <SpeakerLayout />

        {/* Custom header with patient info */}
        <div className="absolute top-0 left-0 right-0 bg-black/70 p-4 z-10">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{patientName.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="text-white font-medium">{patientName}</span>
            <div className="ml-auto">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndCall}
                disabled={callEnding}
              >
                {callEnding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PhoneOff className="h-4 w-4" />
                )}
                <span className="ml-2">End Call</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Custom controls at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 z-10">
          <CallControls onLeave={handleEndCall} />
        </div>
      </div>
    );
  };

  // Helper function to update room status
  const updateRoomStatus = async (status: "ACTIVE") => {
    if (!roomId) return;

    try {
      await fetch("/api/video-calls", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId, status }),
      });
    } catch (e) {
      console.error(`Error updating room status to ${status}:`, e);
    }
  };

  // Check appointment date
  useEffect(() => {
    async function checkAppointmentDate() {
      try {
        const response = await fetch(`/api/appointments/${appointmentId}`);
        if (response.ok) {
          const data = await response.json();
          const date = new Date(data.date);
          setAppointmentDate(date);
          setIsPastAppointment(date < new Date());
        }
      } catch (error) {
        console.error("Error checking appointment date:", error);
      }
    }

    checkAppointmentDate();
  }, [appointmentId]);

  // Initialize the video call with GetStream
  useEffect(() => {
    if (!appointmentId || !session.data?.user) return;

    async function initializeCall() {
      try {
        setIsLoading(true);
        setError(null);

        // First, create or get an existing room
        const response = await fetch("/api/video-calls", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ appointmentId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create video call room");
        }

        const { roomId } = await response.json();
        setRoomId(roomId);

        // Get Stream token for authentication
        const tokenResponse = await fetch("/api/video-calls/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: session.data?.user.id,
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          throw new Error(errorData.error || "Failed to get video token");
        }

        const { token } = await tokenResponse.json();

        if (!token) {
          throw new Error("Invalid token response from server");
        }

        // Initialize GetStream client
        const apiKey = process.env.GETSTREAM_API_KEY;
        if (!apiKey) {
          throw new Error("GetStream API key not configured");
        }
        if (!session.data) {
          throw new Error("User session not found");
        }
        // Create user object for Stream
        const streamUser = {
          id: session.data?.user.id,
          name: session.data?.user.name || "Doctor",
          image: session.data?.user.image || "",
        };

        // Initialize client if not already created
        if (!streamClient) {
          streamClient = new StreamVideoClient({
            apiKey,
            user: streamUser,
            token,
          });
        }

        // Get or create the call
        const callType = "default";
        const callId = roomId;

        const newCall = streamClient.call(callType, callId);
        // Join the call
        await newCall.join({ create: true });
        setCall(newCall);

        // Update room status to active
        await updateRoomStatus("ACTIVE");

        setCallStarted(true);
        setIsLoading(false);
      } catch (e: any) {
        console.error("Error initializing video call:", e);
        setError(e.message || "Failed to initialize video call");
        setIsLoading(false);
        toast({
          title: "Error",
          description: e.message || "Failed to initialize video call",
          variant: "destructive",
        });
      }
    }

    initializeCall();

    // Cleanup function
    return () => {
      if (streamClient && call && callStarted) {
        try {
          // Leave the call
          call.leave().catch((e) => {
            console.error("Error leaving call during cleanup:", e);
          });

          // Disconnect user
          streamClient.disconnectUser().catch((e) => {
            console.error("Error disconnecting user:", e);
          });
        } catch (e) {
          console.error("Error during cleanup:", e);
        }
      }
    };
  }, [appointmentId, session]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-500 dark:text-gray-400">
          Initializing video call...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => router.push("/dashboard/video?tab=history")}>
          Return to Video Calls
        </Button>
      </div>
    );
  }

  if (!call || !streamClient) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          Failed to initialize call. Please try again.
        </p>
        <Button onClick={() => router.refresh()}>Retry</Button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[400px] rounded-lg overflow-hidden"
    >
      <StreamVideo client={streamClient}>
        {/* Wrap CallUI with StreamCall */}
        <StreamCall call={call}>
          <StreamTheme>
            <CallUI call={call} />
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </div>
  );
}
