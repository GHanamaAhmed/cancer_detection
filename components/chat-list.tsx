"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { pusherClient } from "@/lib/pusher-client";
import { fetchConversations } from "@/actions/chat-actions";

interface ChatListProps {
  userId: string;
  initialConversations: any[];
  searchQuery?: string;
}

export function ChatList({
  userId,
  initialConversations,
  searchQuery = "",
}: ChatListProps) {
  const [conversations, setConversations] = useState(initialConversations);

  // Update conversations when search query changes
  useEffect(() => {
    const updateConversations = async () => {
      const updated = await fetchConversations(userId, searchQuery);
      setConversations(updated);
    };

    updateConversations();
  }, [userId, searchQuery]);

  // Subscribe to Pusher channels for real-time updates
  useEffect(() => {
    if (!userId || !pusherClient) return;

    // Channel for new messages
    const newMessageChannel = pusherClient.subscribe("private-new-messages");

    // Channel for read status updates
    const readStatusChannel = pusherClient.subscribe("private-read-status");

    // Handle new messages
    newMessageChannel.bind("new-message", async (data: any) => {
      console.log("New message received:", data);

      // If the message involves the current user, update conversations
      if (data.senderId === userId || data.receiverId === userId) {
        const updated = await fetchConversations(userId, searchQuery);
        setConversations(updated);
      }
    });

    // Handle read status updates
    readStatusChannel.bind("message-read", async (data: any) => {
      console.log("Message read status updated:", data);

      // If the message involves the current user, update conversations
      if (data.senderId === userId || data.receiverId === userId) {
        const updated = await fetchConversations(userId, searchQuery);
        setConversations(updated);
      }
    });

    // Cleanup on unmount
    return () => {
      newMessageChannel.unbind_all();
      readStatusChannel.unbind_all();
      pusherClient.unsubscribe("private-new-messages");
      pusherClient.unsubscribe("private-read-status");
    };
  }, [userId, searchQuery]);

  return (
    <div className="space-y-4">
      {conversations?.length > 0 ? (
        conversations?.map((conversation) => (
          <Link
            // Use a combination of userId and message ID to ensure uniqueness
            key={`${conversation.userId}-${conversation.lastMessage.id}`}
            href={`/dashboard/chat?conversationId=${conversation.userId}`}
            className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-gray-100"
          >
            <Avatar>
              <AvatarImage
                src={
                  conversation.avatarUrl ||
                  `/placeholder.svg?height=40&width=40`
                }
              />
              <AvatarFallback>{conversation.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p
                  className={`font-medium ${
                    conversation.lastMessage.isUnread ? "text-blue-600" : ""
                  }`}
                >
                  {conversation.name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(
                    conversation.lastMessage.createdAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {conversation.lastMessage.content.length > 40
                  ? `${conversation.lastMessage.content.substring(0, 40)}...`
                  : conversation.lastMessage.content}
              </p>
            </div>
            {conversation.lastMessage.isUnread && (
              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
            )}
          </Link>
        ))
      ) : (
        <div className="flex h-40 items-center justify-center text-gray-500">
          No conversations found
        </div>
      )}
    </div>
  );
}
