"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageSquare, BarChart3, Settings } from "lucide-react"
import AnalyticsPage from "./analytics/page"
import ReportsPage from "../reports/page"
import NotificationsPage from "./notifications/page"
import { useToast } from "@/components/ui/use-toast"

interface Metrics {
  totalUsers: number
  totalMessages: number
  activeCampaigns: number
  messageGrowth: number
  deliveryRate: number
  messageStatuses: Array<{ status: string; _count: number }>
  systemStatus: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const tab = searchParams.get("tab") || "overview"
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/admin/metrics")
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch metrics")
        }
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error("Error fetching metrics:", error)
        setError(error instanceof Error ? error.message : "Failed to load dashboard metrics")
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load dashboard metrics",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [toast])

  const handleTabChange = (value: string) => {
    router.push(`/dashboard/admin?tab=${value}`)
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
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
                <div className="text-2xl font-bold">{loading ? "..." : metrics?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Active client accounts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : metrics?.totalMessages || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "..." : `${(metrics?.messageGrowth || 0).toFixed(1)}% from last month`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : metrics?.activeCampaigns || 0}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : metrics?.systemStatus || "Unknown"}</div>
                <p className="text-xs text-muted-foreground">
                  Delivery rate: {loading ? "..." : `${(metrics?.deliveryRate || 0).toFixed(1)}%`}
                </p>
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
