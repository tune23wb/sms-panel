"use client"

import { FormEvent } from "react"
import { useState } from "react"
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
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [messageLength, setMessageLength] = useState(0)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    console.log('Attempting to send SMS:', { phoneNumber, messageLength });

    try {
      console.log('Making API request...');
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{
            number: phoneNumber,
            message: message,
          }],
        }),
      })

      console.log('API response status:', response.status);
      const data = await response.json()
      console.log('API response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to send SMS")
      }

      setIsSent(true)
      toast({
        title: "Success",
        description: "Message sent successfully",
      })

      // Reset form
      setPhoneNumber("")
      setMessage("")
      setMessageLength(0)

      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSent(false)
      }, 3000)
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
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
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <form onSubmit={handleSendMessage}>
              <CardHeader>
                <CardTitle>Send a Single SMS</CardTitle>
                <CardDescription>Send an SMS message to a single recipient</CardDescription>
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
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : isSent ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Sent Successfully
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

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Bulk SMS</CardTitle>
              <CardDescription>Send SMS messages to multiple recipients at once</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Recipients</Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Drag and drop your CSV or TXT file here</p>
                  <p className="text-xs text-muted-foreground mb-4">or click to browse files</p>
                  <p className="text-xs text-muted-foreground mb-2">Supported formats: .csv, .txt</p>
                  <Button variant="outline" size="sm">
                    Upload File
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulk-message">Message Template</Label>
                <Textarea
                  id="bulk-message"
                  placeholder="Hello {name}, this is your message..."
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{name}"}, {"{id}"} etc. as placeholders for personalization
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Send to All Recipients
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule SMS</CardTitle>
              <CardDescription>Schedule SMS messages to be sent at a later time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-recipient">Recipient Phone Number</Label>
                <Input id="schedule-recipient" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-message">Message</Label>
                <Textarea id="schedule-message" placeholder="Type your message here..." className="min-h-[120px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Schedule Date & Time</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input id="schedule-date" type="date" />
                  <Input id="schedule-time" type="time" />
                </div>
              </div>
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
