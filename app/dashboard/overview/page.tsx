"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

interface Message {
  id: string
  status: string
  content: string
  createdAt: string
}

interface Stats {
  totalMessages: number
  deliveryRate: number
  messageGrowth: number
  recentMessages: Message[]
}

export default function OverviewPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/client/metrics")
      if (!response.ok) {
        throw new Error("Failed to fetch stats")
      }
      const data = await response.json()
      setStats({
        totalMessages: data.totalMessages || 0,
        deliveryRate: data.deliveryRate || 0,
        messageGrowth: ((data.messagesLastMonth || 0) / (data.totalMessages || 1) * 100) - 100,
        recentMessages: data.recentMessages || []
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard stats",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Set up polling with exponential backoff
    let retryCount = 0
    const maxRetries = 3
    const baseDelay = 5000 // Start with 5 seconds
    
    const poll = () => {
      const delay = Math.min(baseDelay * Math.pow(2, retryCount), 30000) // Max 30 seconds
      setTimeout(() => {
        fetchStats().then(() => {
          retryCount = 0 // Reset retry count on success
        }).catch(() => {
          retryCount = Math.min(retryCount + 1, maxRetries)
        })
        poll()
      }, delay)
    }
    
    poll()
    
    return () => {
      // Cleanup will be handled by the timeout
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Overview</h3>
        <p className="text-sm text-muted-foreground">
          View your SMS platform performance at a glance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.totalMessages.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              {loading ? "..." : `${stats?.messageGrowth.toFixed(1)}% from last month`}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${stats?.deliveryRate.toFixed(1)}%`}
            </div>
            <Progress 
              value={loading ? 0 : stats?.deliveryRate} 
              className="mt-2" 
            />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>Your latest SMS activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div>Loading...</div>
            ) : stats?.recentMessages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No messages sent yet
              </div>
            ) : (
              stats?.recentMessages.map((message) => (
                <div key={message.id} 
                  className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(message.status)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {message.content}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 