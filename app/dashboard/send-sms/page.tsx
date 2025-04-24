"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload, X } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  manualNumbers: z.string(),
  message: z.string().min(1, "Message template is required").max(500, "Message must be less than 500 characters"),
})

type FormData = z.infer<typeof formSchema>

interface Recipient {
  phoneNumber: string;
  name?: string;
  id?: string;
  [key: string]: string | undefined;
}

export default function SendBulkSMSPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      manualNumbers: "",
      message: "Hello {name}, this is your message...",
    },
  })

  const handleFileDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    
    const file = event.dataTransfer.files?.[0]
    if (!file) return
    
    await processFile(file)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    await processFile(file)
  }

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a .csv or .txt file",
        variant: "destructive",
      })
      return
    }

    try {
      const text = await file.text()
      let newRecipients: Recipient[] = []

      if (file.name.endsWith('.csv')) {
        // Process CSV file
        const lines = text.split('\n')
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim())
          if (values.length < 1) continue

          const recipient: Recipient = {
            phoneNumber: values[headers.indexOf('phone') ?? 0] || values[0],
          }

          // Add any additional columns as custom fields
          headers.forEach((header, index) => {
            if (header && header !== 'phone' && values[index]) {
              recipient[header] = values[index]
            }
          })

          newRecipients.push(recipient)
        }
      } else {
        // Process TXT file (one phone number per line)
        newRecipients = text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(phoneNumber => ({ phoneNumber }))
      }

      setRecipients(prev => [...prev, ...newRecipients])
      
      toast({
        title: "File uploaded successfully",
        description: `Added ${newRecipients.length} recipients`,
      })
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "Please make sure it's a valid file format",
        variant: "destructive",
      })
    }
  }

  const addManualNumbers = () => {
    const numbers = form.getValues("manualNumbers")
      .split(/[,\n]/)
      .map(number => number.trim())
      .filter(number => number.length > 0)

    if (numbers.length === 0) return

    const newRecipients = numbers.map(phoneNumber => ({ phoneNumber }))
    setRecipients(prev => [...prev, ...newRecipients])
    form.setValue("manualNumbers", "")

    toast({
      title: "Numbers added",
      description: `Added ${numbers.length} recipients`,
    })
  }

  const removeRecipient = (index: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: FormData) => {
    if (recipients.length === 0) {
      toast({
        title: "No recipients",
        description: "Please add at least one recipient",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Process each recipient with their personalized message
      const messages = recipients.map(recipient => {
        let personalizedMessage = data.message
        
        // Replace all placeholders with recipient data
        Object.entries(recipient).forEach(([key, value]) => {
          personalizedMessage = personalizedMessage.replace(
            new RegExp(`{${key}}`, 'g'),
            value || `{${key}}`
          )
        })

        return {
          number: recipient.phoneNumber,
          message: personalizedMessage,
        }
      })

      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send SMS")
      }

      toast({
        title: "Success",
        description: `SMS sent to ${recipients.length} recipients`,
      })

      // Reset form and recipients
      form.reset()
      setRecipients([])
    } catch (error) {
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
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Send SMS</CardTitle>
          <CardDescription>
            Send SMS messages to single or multiple recipients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <Accordion type="single" collapsible defaultValue="manual">
                  <AccordionItem value="manual">
                    <AccordionTrigger>Enter Numbers Manually</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="manualNumbers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Numbers</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter phone numbers separated by commas or new lines"
                                  className="h-20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="button" 
                          onClick={addManualNumbers}
                          variant="secondary"
                        >
                          Add Numbers
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="file">
                    <AccordionTrigger>Upload File</AccordionTrigger>
                    <AccordionContent>
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center ${
                          isDragging ? 'border-primary bg-primary/5' : 'border-muted'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault()
                          setIsDragging(true)
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                      >
                        <input
                          type="file"
                          accept=".txt,.csv"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <div className="space-y-4">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Drag and drop your CSV or TXT file here
                            </p>
                            <p className="text-sm text-muted-foreground">or</p>
                            <Button
                              type="button"
                              variant="link"
                              className="mt-2"
                              onClick={() => document.getElementById("file-upload")?.click()}
                            >
                              click to browse files
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Supported formats: .csv, .txt
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {recipients.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Recipients</h4>
                      <span className="text-xs text-muted-foreground">
                        {recipients.length} total
                      </span>
                    </div>
                    <ScrollArea className="h-32 rounded-md border">
                      <div className="p-4 space-y-2">
                        {recipients.map((recipient, index) => (
                          <div key={index} className="flex items-center justify-between gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {recipient.phoneNumber}
                              {recipient.name && ` (${recipient.name})`}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4"
                              onClick={() => removeRecipient(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Template</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Hello {name}, this is your message..."
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-2">
                      Use {"{name}"}, {"{id}"} etc. as placeholders for personalization
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || recipients.length === 0}
              >
                {isLoading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 