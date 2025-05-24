import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserManagement } from "@/components/user-management"
import { IntegrationsSettings } from "@/components/integrations-settings"
import { NotificationSettings } from "@/components/notification-settings"
import { SupportHelp } from "@/components/support-help"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings & User Management</h2>
        <p className="text-gray-500">Configure your dermatology practice and application settings</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Accounts & Roles</CardTitle>
              <CardDescription>Manage user accounts and assign roles</CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect with external systems and services</CardDescription>
            </CardHeader>
            <CardContent>
              <IntegrationsSettings />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support & Help</CardTitle>
              <CardDescription>Get help and submit support tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <SupportHelp />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
