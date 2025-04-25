"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Users, MessageSquare, TrendingUp, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AnalyticsData {
  messageVolume: Array<{ date: string; count: number }>
  messageStatuses: Array<{ status: string; _count: number }>
  activeUsers: number
  successRate: number
  failedMessages: number
  totalMessages: number
}

export default function AdminAnalyticsPage() {
  const { toast } = useToast()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics")
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
  }, [toast])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : analytics?.totalMessages.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">All time messages sent</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : analytics?.activeUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : `${analytics?.successRate.toFixed(1)}%`}
                </div>
                <p className="text-xs text-muted-foreground">Message delivery rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Messages</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : analytics?.failedMessages.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total failed messages</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Message Volume</CardTitle>
                <CardDescription>Daily message volume over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full bg-muted rounded-md flex items-end justify-between p-4">
                  {loading ? (
                    <div className="flex items-center justify-center w-full">Loading...</div>
                  ) : (
                    analytics?.messageVolume.map((day, i) => {
                      const maxCount = Math.max(...analytics.messageVolume.map(d => d.count))
                      const height = maxCount === 0 ? 0 : (day.count / maxCount) * 100
                      return (
                        <div key={i} className="relative h-full w-6 flex flex-col justify-end">
                          <div
                            className="bg-primary rounded-sm w-full transition-all duration-500"
                            style={{ height: `${height}%` }}
                          ></div>
                          <span className="text-xs text-muted-foreground mt-2">
                            {new Date(day.date).getDate()}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Message Status Distribution</CardTitle>
                <CardDescription>Current status of all messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center">
                  {loading ? (
                    <div>Loading...</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 w-full p-4">
                      {analytics?.messageStatuses.map((status, index) => {
                        const percentage = (status._count / analytics.totalMessages) * 100
                        return (
                          <div key={index} className="flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-2xl font-bold">{percentage.toFixed(1)}%</span>
                            </div>
                            <span className="mt-2 text-sm font-medium capitalize">{status.status.toLowerCase()}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Analytics</CardTitle>
              <CardDescription>Detailed message statistics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Message analytics content will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>User growth and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">User analytics content will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 