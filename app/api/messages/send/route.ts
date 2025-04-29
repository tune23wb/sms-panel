import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

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

      // Update user balance
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: smsCost
          }
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

      return { message, transaction, user: updatedUser }
    })

    // Send message through SMPP HTTP service
    const smppResponse = await fetch('http://localhost:3001/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: recipient,
        message: content,
        source_addr: "45578"
      })
    });

    if (!smppResponse.ok) {
      throw new Error(`SMPP service returned ${smppResponse.status}`);
    }

    const smppResult = await smppResponse.json();

    // Update message status based on SMPP result
    if (smppResult.success) {
      await prisma.message.update({
        where: { id: result.message.id },
        data: { 
          status: "SENT",
          updatedAt: new Date()
        }
      });

      await prisma.transaction.update({
        where: { id: result.transaction.id },
        data: { 
          status: "COMPLETED",
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.message.update({
        where: { id: result.message.id },
        data: { 
          status: "FAILED",
          updatedAt: new Date()
        }
      });
      throw new Error(smppResult.error || "Failed to send SMS");
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      transaction: result.transaction,
      remainingBalance: result.user.balance
    })
  } catch (error) {
    console.error("[SMS_SEND]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 