import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { spawn } from 'child_process'
import path from 'path'

const PRICE_PER_SMS = 0.70 // MXN per SMS

const messageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
  recipient: z.string().min(1, "Recipient is required"),
  campaignId: z.string().optional()
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized"
        },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { content, recipient, campaignId } = messageSchema.parse(body)

    // Get user from database with current pricing tier
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!
      }
    })

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found"
        },
        { status: 404 }
      )
    }

    // Calculate cost based on pricing tier
    const smsCost = PRICE_PER_SMS

    // Check user balance
    if (user.balance < smsCost) {
      return NextResponse.json(
        {
          error: "Insufficient balance"
        },
        { status: 400 }
      )
    }

    // Start a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create initial transaction record in PENDING state
      const transaction = await tx.transaction.create({
        data: {
          type: "DEBIT",
          amount: smsCost,
          description: `SMS sent to ${recipient}`,
          status: "PENDING",
          userId: user.id,
          createdAt: new Date()
        }
      })

      // Create initial message record
      const message = await tx.message.create({
        data: {
          content,
          phoneNumber: recipient,
          userId: user.id,
          campaignId,
          status: "PENDING",
          createdAt: new Date()
        }
      })

      return { message, transaction, user }
    })

    // Path to Python script
    const scriptPath = path.join(process.cwd(), 'services', 'smpp', 'smpp_service.py')
    const pythonProcess = spawn('python3', [
      scriptPath,
      '--destination', recipient,
      '--message', content
    ])

    // Create a promise to handle the Python script execution
    const sendResult = await new Promise((resolve, reject) => {
      let output = ''
      let error = ''

      pythonProcess.stdout.on('data', async (data) => {
        const dataStr = data.toString()
        output += dataStr
        
        try {
          // Try to parse JSON response
          const response = JSON.parse(dataStr)
          
          if (response.status === "SENT" || response.status === "DELIVERED") {
            // Update message status
            await prisma.message.update({
              where: { id: result.message.id },
              data: { 
                status: response.status,
                updatedAt: new Date()
              }
            })

            // Update transaction status for both SENT and DELIVERED states
            if (response.status === "SENT" || response.status === "DELIVERED") {
              await prisma.transaction.update({
                where: { id: result.transaction.id },
                data: { 
                  status: "COMPLETED",
                  updatedAt: new Date()
                }
              })
            }
          }
        } catch (e) {
          console.error("Error parsing SMPP response:", e)
        }
      })

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString()
      })

      pythonProcess.on('close', async (code) => {
        if (code === 0) {
          // Get the latest message status
          const updatedMessage = await prisma.message.findUnique({
            where: { id: result.message.id }
          })
          resolve({ success: true, message: updatedMessage })
        } else {
          // Update message status to FAILED if there was an error
          await prisma.message.update({
            where: { id: result.message.id },
            data: { 
              status: "FAILED",
              updatedAt: new Date()
            }
          })
          reject(new Error(error || "Failed to send SMS"))
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: result.message,
      transaction: result.transaction,
      remainingBalance: (await prisma.user.findUnique({ where: { id: user.id } }))?.balance || 0
    })
  } catch (error) {
    console.error("[SMS_SEND]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 