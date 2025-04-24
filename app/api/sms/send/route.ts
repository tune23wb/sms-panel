import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const messageSchema = z.object({
  number: z.string(),
  message: z.string().min(1).max(500),
})

const sendSMSSchema = z.object({
  messages: z.array(messageSchema),
})

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const { messages } = sendSMSSchema.parse(body)

    // TODO: Integrate with your SMS provider here
    // This is a placeholder that simulates sending SMS
    console.log("Sending bulk SMS:", {
      messageCount: messages.length,
      userId: session.user.id,
      messages: messages.map(m => ({
        to: m.number,
        message: m.message
      }))
    })

    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      count: messages.length,
    })
  } catch (error) {
    console.error("SMS send error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to send SMS" },
      { status: 500 }
    )
  }
} 