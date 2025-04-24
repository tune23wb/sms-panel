"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageSquare, BarChart3, Settings } from "lucide-react"
import AnalyticsPage from "./analytics/page"
import ReportsPage from "../reports/page"
import NotificationsPage from "./notifications/page"

export default function AdminDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "overview"

  const handleTabChange = (value: string) => {
    router.push(`/dashboard/admin?tab=${value}`)
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {tab === "overview" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">+0% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">+0% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">+0% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Healthy</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <a href="/dashboard/admin/users" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent">
                    <Users className="h-6 w-6 mb-2" />
                    <span>Manage Users</span>
                  </a>
                  <a href="/dashboard/admin/messages" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent">
                    <MessageSquare className="h-6 w-6 mb-2" />
                    <span>View Messages</span>
                  </a>
                  <a href="/dashboard/admin/analytics" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span>View Analytics</span>
                  </a>
                  <a href="/dashboard/admin/settings" className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent">
                    <Settings className="h-6 w-6 mb-2" />
                    <span>System Settings</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {tab === "analytics" && <AnalyticsPage />}
      {tab === "reports" && <ReportsPage />}
      {tab === "notifications" && <NotificationsPage />}
    </div>
  )
}
