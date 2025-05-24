import { Card, CardContent } from "@/components/ui/card"

export function ProfileStats() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
            <p className="text-3xl font-bold">1,542</p>
            <p className="text-xs text-green-600">↑ 12% from last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-sm font-medium text-gray-500">Melanoma Detected</h3>
            <p className="text-3xl font-bold">87</p>
            <p className="text-xs text-green-600">↑ 8% detection rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="text-sm font-medium text-gray-500">Avg. Detection Time</h3>
            <p className="text-3xl font-bold">14.2</p>
            <p className="text-xs text-green-600">↓ 2.3 days from last year</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Detection Accuracy</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>AI-Assisted Diagnosis</span>
            <span className="font-medium">92%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div className="h-2 w-[92%] rounded-full bg-blue-600"></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Manual Diagnosis</span>
            <span className="font-medium">87%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div className="h-2 w-[87%] rounded-full bg-blue-600"></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Patient Outcomes</h3>
        <div className="h-[200px] rounded-md border p-4">
          <div className="flex h-full items-end gap-4">
            <div className="flex h-full flex-1 flex-col justify-end">
              <div className="h-[80%] w-full rounded-t-md bg-green-500"></div>
              <div className="text-center text-xs text-gray-500">Recovery</div>
            </div>
            <div className="flex h-full flex-1 flex-col justify-end">
              <div className="h-[15%] w-full rounded-t-md bg-yellow-500"></div>
              <div className="text-center text-xs text-gray-500">Ongoing</div>
            </div>
            <div className="flex h-full flex-1 flex-col justify-end">
              <div className="h-[5%] w-full rounded-t-md bg-red-500"></div>
              <div className="text-center text-xs text-gray-500">Referred</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Monthly Screenings</h3>
        <div className="h-[200px] rounded-md border p-4">
          <div className="flex h-full items-end gap-2">
            <div className="flex h-full flex-1 flex-col justify-end">
              <div className="h-[60%] w-full rounded-t-md bg-blue-500"></div>
              <div className="text-center text-xs text-gray-500">Jan</div>
            </div>
            <div className="flex h-full flex-1 flex-col justify-end">
              <div className="h-[70%] w-full rounded-t-md bg-blue-500"></div>
              <div className="text-center text-xs text-gray-500">Feb</div>
            </div>
            <div className="flex h-full flex-1 flex-col justify-end">
              <div className="h-[55%] w-full rounded-t-md bg-blue-500"></div>
              <div className="text-center text-xs text-gray-500">Mar</div>
            </div>
            <div className="flex h-full flex-1 flex-col justify-end">
              <div className="h-[65%] w-full rounded-t-md bg-blue-500"></div>
              <div className="text-center text-xs text-gray-500">Apr</div>
            </div>
            <div className="flex h-full flex-1 flex-col justify-end">
              <div className="h-[80%] w-full rounded-t-md bg-blue-500"></div>
              <div className="text-center text-xs text-gray-500">May</div>
            </div>
            <div className="flex h-full flex-1 flex-col justify-end">
              <div className="h-[75%] w-full rounded-t-md bg-blue-500"></div>
              <div className="text-center text-xs text-gray-500">Jun</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
