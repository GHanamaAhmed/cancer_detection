import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash } from "lucide-react"

const users = [
  {
    id: 1,
    name: "Dr. Sarah Smith",
    email: "sarah.smith@example.com",
    image: "/placeholder.svg?height=40&width=40",
    initials: "SS",
    role: "Admin",
    department: "Dermatology",
  },
  {
    id: 2,
    name: "Dr. John Davis",
    email: "john.davis@example.com",
    image: "/placeholder.svg?height=40&width=40",
    initials: "JD",
    role: "Dermatologist",
    department: "Skin Cancer",
  },
  {
    id: 3,
    name: "Nurse Emily Wilson",
    email: "emily.wilson@example.com",
    image: "/placeholder.svg?height=40&width=40",
    initials: "EW",
    role: "Nurse",
    department: "Dermatology",
  },
  {
    id: 4,
    name: "Dr. Michael Brown",
    email: "michael.brown@example.com",
    image: "/placeholder.svg?height=40&width=40",
    initials: "MB",
    role: "Dermatologist",
    department: "Melanoma",
  },
  {
    id: 5,
    name: "Admin Jessica Lee",
    email: "jessica.lee@example.com",
    image: "/placeholder.svg?height=40&width=40",
    initials: "JL",
    role: "Receptionist",
    department: "Administration",
  },
]

export function UserManagement() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-12 gap-4 border-b bg-gray-50 p-4 font-medium">
          <div className="col-span-5">User</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-2">Department</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {users.map((user) => (
          <div key={user.id} className="grid grid-cols-12 gap-4 border-b p-4 last:border-0">
            <div className="col-span-5">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="col-span-3 flex items-center">
              <Badge
                className={
                  user.role === "Admin"
                    ? "bg-purple-100 text-purple-700 hover:bg-purple-100"
                    : user.role === "Doctor" || user.role === "Dermatologist"
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                      : user.role === "Nurse"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                }
              >
                {user.role}
              </Badge>
            </div>
            <div className="col-span-2 flex items-center">{user.department}</div>
            <div className="col-span-2 flex items-center justify-end gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
