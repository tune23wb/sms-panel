"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, BarChart3, CreditCard } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import OverviewPage from "../overview/page"
import AnalyticsPage from "../analytics/page"
import ReportsPage from "../reports/page"

interface ClientMetrics {
  totalMessages: number
  messagesLastMonth: number
  activeCampaigns: number
  deliveryRate: number
  messageStatuses: Array<{ status: string; _count: number }>
  balance: number
}

export default function ClientDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const tab = searchParams.get("tab") || "overview"
  const [metrics, setMetrics] = useState<ClientMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/client/metrics")
      if (!response.ok) {
        throw new Error("Failed to fetch metrics")
      }
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error("Error fetching metrics:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard metrics",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    // Refresh metrics every minute
    const interval = setInterval(fetchMetrics, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleTabChange = (value: string) => {
    router.push(`/dashboard/client?tab=${value}`)
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : metrics?.totalMessages}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? "..." : `${metrics?.messagesLastMonth} this month`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `${metrics?.deliveryRate.toFixed(1)}%`}
              </div>
              <p className="text-xs text-muted-foreground">Message success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : metrics?.activeCampaigns}
              </div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `$${metrics?.balance.toFixed(2)}`}
              </div>
              <p className="text-xs text-muted-foreground">Available credits</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-4">
        {tab === "overview" && <OverviewPage />}
        {tab === "analytics" && <AnalyticsPage />}
        {tab === "reports" && <ReportsPage />}
      </div>
    </div>
  )
}
