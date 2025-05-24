import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { HelpCircle, MessageSquare, FileText, Send } from "lucide-react"

export function SupportHelp() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Help Center</h3>
              <p className="text-sm text-gray-500">Browse our knowledge base</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Dermoscopy Guide
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Melanoma FAQs
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              AI Detection Troubleshooting
            </Button>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Contact Support</h3>
              <p className="text-sm text-gray-500">Get in touch with our support team</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Live Chat
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Send className="mr-2 h-4 w-4" />
              Email Support
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="font-medium">Submit a Support Ticket</h3>
        <p className="text-sm text-gray-500">Fill out the form below to submit a support ticket</p>

        <form className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Your email" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue-type">Issue Type</Label>
            <Select>
              <SelectTrigger id="issue-type">
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Issue</SelectItem>
                <SelectItem value="billing">Billing Question</SelectItem>
                <SelectItem value="account">Account Management</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Brief description of your issue" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Detailed description of your issue" rows={5} />
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700">Submit Ticket</Button>
        </form>
      </div>
    </div>
  )
}
