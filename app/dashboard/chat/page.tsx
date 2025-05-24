import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, UserCheck } from "lucide-react";
import { ChatList } from "@/components/chat-list";
import { ChatWindow } from "@/components/chat-window";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Suspense } from "react";
import { ChatListSkeleton } from "@/components/chat-list-skeleton";
import { ChatWindowSkeleton } from "@/components/chat-window-skeleton";
import ChatSearch from "@/components/chatSearch";

export default async function ChatPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ conversationId?: string; query?: string }>;
}) {
  const user = await requireAuth();

  // Get the selected conversation ID from the URL or use the first conversation
  const searchParams = await searchParamsPromise;
  const conversationId = searchParams.conversationId;
  const searchQuery = searchParams.query || "";

  // Fetch the selected conversation if it exists
  let selectedConversation = null;
  if (conversationId) {
    selectedConversation = await prisma.message.findFirst({
      where: {
        OR: [
          { senderId: conversationId, receiverId: user.id },
          { senderId: user.id, receiverId: conversationId },
        ],
      },
      include: {
        receiver: {
          include: {
            profile: true,
          },
        },
        sender: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // If no conversation is selected, we'll show a placeholder
  const selectedUser = selectedConversation
    ? selectedConversation.senderId === user.id
      ? selectedConversation.receiver
      : selectedConversation.sender
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Chat Consultations
          </h2>
          <p className="text-gray-500">
            Manage text-based consultations with patients
          </p>
        </div>
        {/* <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Conversation
        </Button> */}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <CardTitle>Conversations</CardTitle>
              <ChatSearch />
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChatListSkeleton />}>
              <ChatList userId={user.id} searchQuery={searchQuery} />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedUser
                ? `${selectedUser.profile?.firstName || ""} ${
                    selectedUser.profile?.lastName || selectedUser.email
                  }`
                : "Select a conversation"}
            </CardTitle>
            <CardDescription>
              {selectedUser
                ? `Last active: ${new Date(
                    selectedUser.updatedAt
                  ).toLocaleString()}`
                : "Click on a conversation to start chatting"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChatWindowSkeleton />}>
              {conversationId ? (
                <ChatWindow userId={user.id} recipientId={conversationId} />
              ) : (
                <div className="flex h-[400px] items-center justify-center text-gray-500">
                  Select a conversation to start chatting
                </div>
              )}
            </Suspense>
          </CardContent>
          <div className="px-6 py-3 bg-blue-50 text-blue-700 text-sm border-t">
            <p className="flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              Note: You can only chat with patients who have approved your
              connection request.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
