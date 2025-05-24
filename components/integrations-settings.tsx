import { Button } from "@/components/ui/button"
import { Database, Link, Unlink, Smartphone, Server } from "lucide-react"

export function IntegrationsSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Dermatology Electronic Health Records (EHR)</h3>
        <div className="grid gap-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Epic Systems</p>
                <p className="text-sm text-gray-500">Connected since Oct 15, 2023</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Link className="mr-2 h-4 w-4" />
                Configure
              </Button>
              <Button variant="outline" size="sm" className="text-red-600">
                <Unlink className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Cerner</p>
                <p className="text-sm text-gray-500">Not connected</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Link className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Dermoscopy Devices</h3>
        <div className="grid gap-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Apple Health</p>
                <p className="text-sm text-gray-500">Connected since Nov 5, 2023</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Link className="mr-2 h-4 w-4" />
                Configure
              </Button>
              <Button variant="outline" size="sm" className="text-red-600">
                <Unlink className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Fitbit</p>
                <p className="text-sm text-gray-500">Not connected</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Link className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Pathology Lab Connections</h3>
        <div className="grid gap-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">LabCorp API</p>
                <p className="text-sm text-gray-500">Connected since Dec 1, 2023</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Link className="mr-2 h-4 w-4" />
                Configure
              </Button>
              <Button variant="outline" size="sm" className="text-red-600">
                <Unlink className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
