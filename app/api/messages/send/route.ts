import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

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
      // TODO: Integrate with SMS provider
      // This is where you would integrate with your chosen SMS provider
      // For now, we'll simulate a successful send
      
      // Update message status to SENT
      await prisma.message.update({
        where: {
          id: message.id
        },
        data: {
          status: "SENT"
        }
      })

      // Deduct balance (assuming 1 credit per message)
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
          status: "SENT"
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