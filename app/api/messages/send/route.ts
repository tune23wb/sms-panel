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

    // Create initial message record
    const message = await prisma.message.create({
      data: {
        content,
        phoneNumber: recipient,
        userId: user.id,
        campaignId,
        status: "PENDING"
      }
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

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString()
      })

      pythonProcess.on('close', async (code) => {
        if (code === 0 && output.includes('Success')) {
          try {
            // Deduct balance and update message status in a transaction
            const result = await prisma.$transaction([
              // Deduct balance
              prisma.user.update({
                where: { id: user.id },
                data: {
                  balance: {
                    decrement: smsCost
                  }
                }
              }),
              // Create transaction record
              prisma.transaction.create({
                data: {
                  type: "DEBIT",
                  amount: smsCost,
                  description: `SMS sent to ${recipient}`,
                  status: "COMPLETED",
                  userId: user.id
                }
              }),
              // Update message status
              prisma.message.update({
                where: { id: message.id },
                data: { status: "DELIVERED" }
              })
            ])
            resolve({ success: true, message: result[2] })
          } catch (txError) {
            console.error("Transaction error:", txError)
            // Update message status to FAILED if transaction fails
            await prisma.message.update({
              where: { id: message.id },
              data: { status: "FAILED" }
            })
            reject(new Error("Failed to process successful delivery"))
          }
        } else {
          // Update message status to FAILED
          await prisma.message.update({
            where: { id: message.id },
            data: { status: "FAILED" }
          })
          reject(new Error(`Failed to send SMS: ${error || 'Unknown error'}`))
        }
      })

      pythonProcess.on('error', async (err) => {
        // Update message status to FAILED
        await prisma.message.update({
          where: { id: message.id },
          data: { status: "FAILED" }
        })
        reject(new Error(`Failed to start Python process: ${err.message}`))
      })
    })

    return NextResponse.json(sendResult)
  } catch (error) {
    console.error("Error sending SMS:", error)
    return NextResponse.json(
      { 
        error: "Failed to send SMS",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
} 