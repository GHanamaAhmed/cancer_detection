"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConnectionRequestsList } from "@/components/connection-requests-list";
import { PatientNetwork } from "@/components/patient-network";

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState("requests");

  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Patient Connections
        </h2>
        <p className="text-muted-foreground">
          Manage your patient network and connection requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Requests</CardTitle>
          <CardDescription>
            Review and manage patient connection requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConnectionRequestsList />
        </CardContent>
      </Card>
    </div>
  );
}
