"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { pusher } from "@/lib/pusher";

export async function sendMessage(formData: FormData) {
  const user = await requireAuth();

  const recipientId = formData.get("recipientId") as string;
  const messageContent = formData.get("message") as string;

  if (!recipientId || !messageContent?.trim()) {
    throw new Error("Recipient ID and message content are required");
  }
  const channelName = `private-chat-${recipientId}-${user.id}`;
  console.log("channelName", channelName);

  // Create the message
  await pusher.trigger(channelName, "message", {
    senderId: user.id,
    receiverId: recipientId,
    content: messageContent.trim(),
    isRead: false,
  });
  await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId: recipientId,
      content: messageContent.trim(),
      isRead: false,
    },
  });

  // Create a notification
  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: "DOCTOR_MESSAGE",
      message: `New message from ${user.email}`,
      isRead: false,
      senderId: user.id,
      title: "New Message",
    },
  });
}

export async function markMessagesAsRead(senderId: string) {
  const user = await requireAuth();

  await prisma.message.updateMany({
    where: {
      senderId: senderId,
      receiverId: user.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath("/dashboard/chat");
}

export async function fetchConversations(
  userId: string,
  searchQuery: string = ""
) {
  // Fetch all unique conversations for the current user
  const conversations = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
      AND: [
        {
          OR: [
            {
              sender: {
                OR: [
                  { email: { contains: searchQuery, mode: "insensitive" } },
                  {
                    profile: {
                      firstName: { contains: searchQuery, mode: "insensitive" },
                    },
                  },
                  {
                    profile: {
                      lastName: { contains: searchQuery, mode: "insensitive" },
                    },
                  },
                ],
              },
            },
            {
              receiver: {
                OR: [
                  { email: { contains: searchQuery, mode: "insensitive" } },
                  {
                    profile: {
                      firstName: { contains: searchQuery, mode: "insensitive" },
                    },
                  },
                  {
                    profile: {
                      lastName: { contains: searchQuery, mode: "insensitive" },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    include: {
      sender: {
        include: {
          profile: true,
        },
      },
      receiver: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    distinct: ["senderId", "receiverId"],
  });

  const processedConversations = conversations.map((message) => {
    const otherUser =
      message.senderId === userId ? message.receiver : message.sender;

    const name = otherUser.profile
      ? `${otherUser.profile.firstName} ${otherUser.profile.lastName}`
      : otherUser.email?.split("@")[0];

    const initials = otherUser.profile
      ? `${otherUser.profile.firstName.charAt(
          0
        )}${otherUser.profile.lastName.charAt(0)}`
      : otherUser.email?.substring(0, 2).toUpperCase();

    const isUnread = !message.isRead && message.receiverId === userId;

    return {
      userId: otherUser.id,
      name,
      initials,
      avatarUrl: otherUser.profile?.avatarUrl || null,
      lastMessage: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        isUnread,
      },
    };
  });

  // Get the latest message for each unique user
  const uniqueConversationsMap = new Map();

  // Loop through conversations (which should already be sorted by createdAt desc)
  for (const conv of processedConversations) {
    const existingConv = uniqueConversationsMap.get(conv.userId);

    // If we don't have this user yet, or this message is newer than what we have
    if (
      !existingConv ||
      new Date(conv.lastMessage.createdAt) >
        new Date(existingConv.lastMessage.createdAt)
    ) {
      uniqueConversationsMap.set(conv.userId, conv);
    }
  }

  // Convert back to array
  const uniqueConversations = Array.from(uniqueConversationsMap.values());

  // Sort by most recent message
  return uniqueConversations.sort(
    (a, b) =>
      new Date(b.lastMessage.createdAt).getTime() -
      new Date(a.lastMessage.createdAt).getTime()
  );
}
