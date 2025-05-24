import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { format } from "date-fns";

interface CaseNotesProps {
  patientId: string;
}

export async function CaseNotes({ patientId }: CaseNotesProps) {
  const session = await getSession();

  // Fetch messages between the doctor and patient
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        {
          senderId: session?.user.id,
          receiverId: patientId,
        },
        {
          senderId: patientId,
          receiverId: session?.user.id,
        },
      ],
    },
    orderBy: {
      createdAt: "asc",
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
  });

  // Fetch case notes instead of doctor notes
  const notes = await prisma.caseNote.findMany({
    where: {
      userId: session?.user.id,
      lesionCase: {
        patientId: {
          equals: patientId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      lesionCase: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Case Notes</h3>
        <div className="space-y-4">
          {notes.length === 0 ? (
            <p className="text-gray-500">
              No notes yet. Add your first note below.
            </p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="text-xs text-gray-500 mb-1">
                  {format(new Date(note.createdAt), "PPp")}
                  {note.lesionCase && (
                    <span className="ml-2 text-blue-600">
                      Case #{note.lesionCase.caseNumber}
                    </span>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="mt-4">
          <form action="/api/case-notes" method="POST" className="space-y-3">
            <input type="hidden" name="patientId" value={patientId} />
            <Textarea
              placeholder="Add a new note about this patient..."
              name="content"
              className="min-h-[100px]"
              required
            />
            <Button type="submit">Save Note</Button>
          </form>
        </div>
      </div>

      {/* Message history section remains unchanged */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-medium mb-3">Message History</h3>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet with this patient.</p>
          ) : (
            messages.map((message) => {
              const isFromDoctor = message.senderId === session?.user.id;
              const sender = isFromDoctor
                ? "You"
                : message.sender.profile
                ? `${message.sender.profile.firstName} ${message.sender.profile.lastName}`
                : message.sender.name || "Patient";

              return (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    isFromDoctor
                      ? "ml-auto bg-blue-100 text-blue-900"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="text-xs font-medium mb-1">
                    {sender} • {format(new Date(message.createdAt), "p")}
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
