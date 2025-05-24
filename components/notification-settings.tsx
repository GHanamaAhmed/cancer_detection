import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Push Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="new-appointment" className="flex flex-col gap-1">
              <span>New Appointment</span>
              <span className="font-normal text-sm text-gray-500">Receive notifications for new appointments</span>
            </Label>
            <Switch id="new-appointment" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="appointment-reminder" className="flex flex-col gap-1">
              <span>Appointment Reminders</span>
              <span className="font-normal text-sm text-gray-500">Receive reminders before scheduled appointments</span>
            </Label>
            <Switch id="appointment-reminder" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="high-risk" className="flex flex-col gap-1">
              <span>High Risk Melanoma Cases</span>
              <span className="font-normal text-sm text-gray-500">Receive alerts for high risk melanoma cases</span>
            </Label>
            <Switch id="high-risk" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="new-message" className="flex flex-col gap-1">
              <span>New Messages</span>
              <span className="font-normal text-sm text-gray-500">Receive notifications for new patient messages</span>
            </Label>
            <Switch id="new-message" defaultChecked />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="daily-summary" className="flex flex-col gap-1">
              <span>Daily Skin Cancer Summary</span>
              <span className="font-normal text-sm text-gray-500">Receive a daily summary of screenings and cases</span>
            </Label>
            <Switch id="daily-summary" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="weekly-report" className="flex flex-col gap-1">
              <span>Weekly Melanoma Report</span>
              <span className="font-normal text-sm text-gray-500">Receive a weekly report of melanoma statistics</span>
            </Label>
            <Switch id="weekly-report" defaultChecked />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">SMS Alerts</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emergency-alerts" className="flex flex-col gap-1">
              <span>Emergency Alerts</span>
              <span className="font-normal text-sm text-gray-500">Receive SMS alerts for emergency situations</span>
            </Label>
            <Switch id="emergency-alerts" defaultChecked />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Notification Frequency</h3>
        <RadioGroup defaultValue="all">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all">All notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="important" id="important" />
            <Label htmlFor="important">Important only</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none">None</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Quiet Hours</h3>
          <Switch id="quiet-hours" defaultChecked />
        </div>
        <div className="space-y-2">
          <Label>From 10:00 PM to 7:00 AM</Label>
          <Slider defaultValue={[22, 7]} max={24} step={1} />
          <div className="flex justify-between text-xs text-gray-500">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>12 AM</span>
          </div>
        </div>
      </div>
    </div>
  )
}
