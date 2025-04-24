"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, BellRing, BellOff } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function NotificationsPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <BellRing className="h-5 w-5" />
              <div>
                <p className="font-medium">System Alerts</p>
                <p className="text-sm text-muted-foreground">Receive notifications about system status and maintenance</p>
              </div>
            </div>
            <Switch id="system-alerts" />
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5" />
              <div>
                <p className="font-medium">Message Updates</p>
                <p className="text-sm text-muted-foreground">Get notified about new messages and delivery status</p>
              </div>
            </div>
            <Switch id="message-updates" />
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <BellOff className="h-5 w-5" />
              <div>
                <p className="font-medium">Do Not Disturb</p>
                <p className="text-sm text-muted-foreground">Temporarily disable all notifications</p>
              </div>
            </div>
            <Switch id="do-not-disturb" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Your latest system notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 border-b pb-4">
              <Bell className="h-5 w-5 mt-1" />
              <div>
                <p className="font-medium">System Update Complete</p>
                <p className="text-sm text-muted-foreground">The system has been successfully updated to the latest version.</p>
                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <BellRing className="h-5 w-5 mt-1" />
              <div>
                <p className="font-medium">New Message Campaign</p>
                <p className="text-sm text-muted-foreground">A new message campaign has been initiated.</p>
                <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 