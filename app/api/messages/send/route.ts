import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

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

    // Get user from database
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

    // Check user balance
    if (user.balance <= 0) {
      return NextResponse.json(
        {
          error: "Insufficient balance"
        },
        { status: 400 }
      )
    }

    // Create message with initial status
    const message = await prisma.message.create({
      data: {
        content,
        phoneNumber: recipient,
        userId: user.id,
        campaignId,
        status: "PENDING"
      }
    })

    try {
      // Update to SENT status
      await prisma.message.update({
        where: { id: message.id },
        data: { status: "SENT" }
      })

      // Path to the Python script and virtual environment
      const scriptPath = path.join(process.cwd(), 'services', 'smpp', 'smpp_service.py')
      const venvPythonPath = '/var/www/sms-panel-app/venv/bin/python3'

      // Check if script exists
      if (!fs.existsSync(scriptPath)) {
        throw new Error('SMS service script not found')
      }

      // Check if venv Python exists
      if (!fs.existsSync(venvPythonPath)) {
        throw new Error('Python environment not found')
      }

      // Spawn Python process to send SMS
      const pythonProcess = spawn(venvPythonPath, [
        scriptPath,
        '--destination', recipient,
        '--message', content,
        '--source', 'TestSMPP'
      ])

      // Handle the Python process
      const sendSMS = new Promise((resolve, reject) => {
        let output = ''
        let error = ''

        pythonProcess.stdout.on('data', (data) => {
          output += data.toString()
        })

        pythonProcess.stderr.on('data', (data) => {
          error += data.toString()
        })

        pythonProcess.on('close', async (code) => {
          if (code === 0) {
            // Update status to DELIVERED on successful send
            await prisma.message.update({
              where: { id: message.id },
              data: { status: "DELIVERED" }
            })
            resolve(output)
          } else {
            // Update status to FAILED on error
            await prisma.message.update({
              where: { id: message.id },
              data: { status: "FAILED" }
            })
            reject(new Error(`Failed to send SMS: ${error}`))
          }
        })
      })

      // Wait for SMS to be sent
      await sendSMS

      // Deduct balance
      await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          balance: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({
        message: {
          id: message.id,
          status: "SENT",
          content,
          recipient
        }
      })
    } catch (error) {
      // If sending fails, update message status to FAILED
      await prisma.message.update({
        where: {
          id: message.id
        },
        data: {
          status: "FAILED"
        }
      })
      throw error
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.errors[0].message
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Internal server error"
      },
      { status: 500 }
    )
  }
} 