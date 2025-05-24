import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send } from "lucide-react";
import { prisma } from "@/lib/db";
import { sendMessage } from "@/actions/chat-actions";
import ChatContent from "./chatContent";

interface ChatWindowProps {
  userId: string;
  recipientId: string;
}

export async function ChatWindow({ userId, recipientId }: ChatWindowProps) {
  // Fetch messages between the current user and the recipient
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: recipientId },
        { senderId: recipientId, receiverId: userId },
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
      createdAt: "asc",
    },
  });

  // Mark unread messages as read
  if (messages.some((m) => !m.isRead && m.receiverId === userId)) {
    await prisma.message.updateMany({
      where: {
        senderId: recipientId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  // Get recipient info
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    include: { profile: true },
  });

  const recipientName = recipient?.profile
    ? `${recipient.profile.firstName} ${recipient.profile.lastName}`
    : recipient?.email?.split("@")[0] || "User";

  const recipientInitials = recipient?.profile
    ? `${recipient.profile.firstName.charAt(
        0
      )}${recipient.profile.lastName.charAt(0)}`
    : recipient?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <div className="flex h-[500px] flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <ChatContent
          messages={messages}
          userId={userId}
          recipientId={recipientId}
          recipientName={recipientName}
          recipientInitials={recipientInitials}
          recipient={recipient}
        />
      </div>

      <form action={sendMessage} className="border-t p-4">
        <input type="hidden" name="recipientId" value={recipientId} />
        <div className="flex gap-2">
          <Textarea
            name="message"
            placeholder="Type your message..."
            className="min-h-[40px] flex-1 resize-none"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
