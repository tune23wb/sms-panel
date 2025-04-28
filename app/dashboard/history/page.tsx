"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface Message {
  id: string
  phoneNumber: string
  content: string
  status: string
  createdAt: string
}

export default function HistoryPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/client/messages")
      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }
      const data = await response.json()
      
      // Format dates before setting messages
      const formattedMessages = data.messages.map((msg: Message) => ({
        ...msg,
        createdAt: format(new Date(msg.createdAt), "PPp")
      }))
      
      setMessages(formattedMessages)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load message history",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Message History</h3>
        <p className="text-sm text-muted-foreground">
          View your message sending history and status
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>
            A list of all messages sent through your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <DataTable columns={columns} data={messages} />
          )}
        </CardContent>
      </Card>
    </div>
  )
} 