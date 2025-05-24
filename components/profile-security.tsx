"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Key } from "lucide-react";
import {
  updatePassword,
  updateSecuritySettings,
} from "@/actions/security-actions";
import { toast } from "sonner";

interface SecuritySettings {
  sessionTimeout?: number;
  loginNotifications?: boolean;
}

interface ProfileSecurityProps {
  userId: string;
}

export function ProfileSecurity({ userId }: ProfileSecurityProps) {
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(false);

  async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordLoading(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      setPasswordLoading(false);
      return;
    }

    try {
      await updatePassword(userId, currentPassword, newPassword);
      toast.success("Password updated successfully");
      e.currentTarget.reset();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleSessionTimeoutChange(
    e: React.FocusEvent<HTMLInputElement>
  ) {
    setSettingsLoading(true);

    try {
      const timeout = parseInt(e.target.value);
      await updateSecuritySettings(userId, { sessionTimeout: timeout });
      toast.success("Session timeout updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update settings");
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleLoginNotificationChange(checked: boolean) {
    setSettingsLoading(true);

    try {
      await updateSecuritySettings(userId, { loginNotifications: checked });
      toast.success("Login notification settings updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update settings");
    } finally {
      setSettingsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Change Password</h3>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
            />
          </div>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={passwordLoading}
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sessionTimeout">Session Timeout</Label>
              <p className="text-sm text-gray-500">
                Automatically log out after period of inactivity
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="sessionTimeout"
                name="sessionTimeout"
                type="number"
                defaultValue={30}
                min="5"
                max="120"
                className="w-20 text-right"
                onBlur={handleSessionTimeoutChange}
              />
              <span className="text-sm text-gray-500">minutes</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="loginNotification">Login Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive email alerts for new sign-ins
              </p>
            </div>
            <Switch
              id="loginNotification"
              defaultChecked={true}
              onCheckedChange={handleLoginNotificationChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="trusted-devices">Trusted Devices</Label>
              <p className="text-sm text-gray-500">
                Manage devices that can access your account
              </p>
            </div>
            <Button variant="outline">
              <Key className="mr-2 h-4 w-4" />
              Manage Devices
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Account Activity</h3>
        <div className="rounded-lg border">
          <div className="p-4">
            <Button variant="outline" className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              View Activity Log
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
