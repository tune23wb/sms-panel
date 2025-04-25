"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react"

interface AnalyticsData {
  messageVolume: Array<{ date: string; count: number }>
  messageStatuses: Array<{ status: string; _count: number }>
  successRate: number
  failedMessages: number
  totalMessages: number
}

export default function AnalyticsPage() {
  const { toast } = useToast()
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/client/analytics")
        if (!response.ok) {
          throw new Error("Failed to fetch analytics")
        }
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error("Error fetching analytics:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
    // Refresh analytics every minute
    const interval = setInterval(fetchAnalytics, 60000)
    return () => clearInterval(interval)
  }, [toast])

  if (loading) {
    return <div>Loading analytics...</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Message delivery success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalMessages}</div>
            <p className="text-xs text-muted-foreground">Messages sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Messages</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.failedMessages}</div>
            <p className="text-xs text-muted-foreground">Messages that failed to deliver</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Volume</CardTitle>
          <CardDescription>Daily message count for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.messageVolume && (
            <div className="h-[200px]">
              {/* Add your preferred charting library here */}
              <pre className="text-xs">
                {JSON.stringify(analytics.messageVolume, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message Status Distribution</CardTitle>
          <CardDescription>Breakdown of message delivery statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics?.messageStatuses.map((status) => (
              <div key={status.status} className="flex items-center justify-between">
                <span className="text-sm font-medium">{status.status}</span>
                <span className="text-sm text-muted-foreground">{status._count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 