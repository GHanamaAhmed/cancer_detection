"use client";
import React, { use, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { pusherClient } from "@/lib/pusher-client";
import { useSession } from "next-auth/react";
import { Prisma } from "@prisma/client";
type Message = Prisma.MessageGetPayload<{
  include: {
    sender: {
      include: {
        profile: true;
      };
    };
    receiver: {
      include: {
        profile: true;
      };
    };
  };
}>;
export default function ChatContent({
  messages: m,
  userId,
  recipientId,
  recipientName,
  recipientInitials,
  recipient,
}: {
  messages: Message[];
  userId: string;
  recipientId: string;
  recipientName: string;
  recipientInitials: string;
  recipient?: Prisma.UserGetPayload<{ include: { profile: true } }>;
}) {
  const [messages, setMessages] = React.useState(m);
  const session = useSession();
  const channelName = `private-chat-${recipientId}-${userId}`;
  console.log("channelName", channelName);

  useEffect(() => {
    if (!session.data?.user.id || !pusherClient) return;
    const channel = pusherClient.subscribe(channelName);
    channel.bind("message", (message: Message) => {
      console.log("Received message:", message);

      setMessages((prevMessages) => [...prevMessages, message]);
    });
    return () => { 
      console.log("Unsubscribing from channel");
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [session, pusherClient]);
  return (
    <>
      {messages.length > 0 ? (
        messages.map((message, i) => {
          const isCurrentUser = message.senderId === userId;
          const senderName = isCurrentUser ? "You" : recipientName;

          return (
            <div
              key={i}
              className={`flex ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex max-w-[80%] gap-2">
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        recipient?.profile?.avatarUrl ||
                        `/placeholder.svg?height=32&width=32`
                      }
                    />
                    <AvatarFallback>{recipientInitials}</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <div
                    className={`rounded-lg p-3 ${
                      isCurrentUser ? "bg-blue-600 text-white" : "bg-gray-100"
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {senderName} •{" "}
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500">
          No messages yet. Start the conversation!
        </div>
      )}
    </>
  );
}
