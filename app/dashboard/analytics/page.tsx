"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, BarChart } from "@/components/ui/chart"

export default function AnalyticsPage() {
  // This would come from your API/database in the future
  const messageData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Messages Sent",
        data: [320, 280, 450, 380, 420, 390],
      },
    ],
  }

  const deliveryData = {
    labels: ["Delivered", "Failed", "Pending"],
    datasets: [
      {
        label: "Message Status",
        data: [85, 10, 5],
      },
    ],
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