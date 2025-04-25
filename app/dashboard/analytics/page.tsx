"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, BarChart } from "@/components/ui/chart"
import { useToast } from "@/components/ui/use-toast"

interface AnalyticsData {
  messageVolume: Array<{ date: string; count: number }>
  messageStatuses: Array<{ status: string; _count: number }>
}

export default function AnalyticsPage() {
  const { toast } = useToast()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    fetchAnalytics()
    // Set up polling every 10 seconds
    const interval = setInterval(fetchAnalytics, 10000)
    return () => clearInterval(interval)
  }, [])

  const messageData = {
    labels: analytics?.messageVolume.map(m => m.date) || [],
    datasets: [
      {
        label: "Messages Sent",
        data: analytics?.messageVolume.map(m => m.count) || [],
      },
    ],
  }

  const deliveryData = {
    labels: analytics?.messageStatuses.map(s => s.status) || [],
    datasets: [
      {
        label: "Message Status",
        data: analytics?.messageStatuses.map(s => s._count) || [],
      },
    ],
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Analytics</h3>
        <p className="text-sm text-muted-foreground">
          Detailed analysis of your messaging performance
        </p>
      </div>

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">Message Volume</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Volume Trends</CardTitle>
              <CardDescription>
                Number of messages sent over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <LineChart data={messageData} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status Distribution</CardTitle>
              <CardDescription>
                Breakdown of message delivery status
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <BarChart data={deliveryData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 