"use client"

import React from "react"
import { FormEvent, useState } from "react"
import { Check, Loader2, Send, Upload, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function SendSMS() {
  const { toast } = useToast()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [messageLength, setMessageLength] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (isLoading) return // Prevent double submission
    
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: phoneNumber,
          content: message
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to send SMS")
      }

      // Check if the message was actually sent
      if (data.success && data.message?.status === "DELIVERED") {
        toast({
          title: "Success",
          description: "Message sent successfully",
        })

        // Reset form
        setPhoneNumber("")
        setMessage("")
        setMessageLength(0)
      } else {
        throw new Error(data.error || "Message was not delivered successfully")
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send SMS",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Send SMS</h2>
      </div>

      <Tabs defaultValue="single" className="space-y-4">
        <TabsList>
          <TabsTrigger value="single">Single Message</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Messages</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Message</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <form onSubmit={handleSendMessage}>
              <CardHeader>
                <CardTitle>Send Single Message</CardTitle>
                <CardDescription>
                  Send a message to a single recipient
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Phone Number</Label>
                  <Input 
                    id="recipient" 
                    placeholder="+1 (555) 123-4567" 
                    required 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="message">Message</Label>
                    <span className="text-xs text-muted-foreground">{messageLength}/160 characters</span>
                  </div>
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    className="min-h-[120px]"
                    required
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      setMessageLength(e.target.value.length)
                    }}
                    maxLength={160}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Send Bulk Messages</CardTitle>
              <CardDescription>
                Upload a CSV file or add numbers manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </Button>
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Add Numbers
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Message</CardTitle>
              <CardDescription>
                Schedule a message to be sent later
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Repeat</Label>
                <RadioGroup defaultValue="none">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none">None</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily">Daily</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Weekly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Monthly</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Schedule Message</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
