import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { spawn } from "child_process"
import { promisify } from "util"
import { exec } from "child_process"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const messageSchema = z.object({
  number: z.string(),
  message: z.string().min(1).max(500),
})

const sendSMSSchema = z.object({
  messages: z.array(messageSchema),
})

const execAsync = promisify(exec)

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

    // Process each message
    const results = await Promise.all(
      messages.map(async (message) => {
        try {
          // Call the Python SMPP service script
          const { stdout, stderr } = await execAsync(
            `python3 services/smpp/smpp_service.py --destination "${message.number}" --message "${message.message}"`
          )

          if (stderr) {
            console.error(`Error sending SMS to ${message.number}:`, stderr)
            return {
              number: message.number,
              success: false,
              error: stderr
            }
          }

          return {
            number: message.number,
            success: true,
            message: stdout.trim()
          }
        } catch (error) {
          console.error(`Failed to send SMS to ${message.number}:`, error)
          return {
            number: message.number,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
          }
        }
      })
    )

    // Count successful and failed messages
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      total: messages.length,
      successful,
      failed,
      results
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