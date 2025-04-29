import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const INTERNAL_API_KEY = "smpp_internal_key"

export async function POST(req: Request) {
  try {
    // Check authorization
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${INTERNAL_API_KEY}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { message_id, status, phone_number, message_cost } = body

    console.log("[BALANCE_UPDATE] Received request:", {
      message_id,
      status,
      phone_number,
      message_cost
    })

    if (!message_id || !status) {
      console.error("[BALANCE_UPDATE] Missing required fields")
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Start a database transaction
    const result = await prisma.$transaction(async (tx) => {
      console.log("[BALANCE_UPDATE] Looking up message:", message_id)
      
      // Get the message to find the user
      const message = await tx.message.findUnique({
        where: { id: message_id },
        include: { user: true }
      })

      if (!message) {
        console.error("[BALANCE_UPDATE] Message not found:", message_id)
        throw new Error("Message not found")
      }

      console.log("[BALANCE_UPDATE] Found message:", {
        messageId: message.id,
        userId: message.userId,
        currentStatus: message.status
      })

      // Update message status
      const updatedMessage = await tx.message.update({
        where: { id: message_id },
        data: { 
          status,
          updatedAt: new Date()
        }
      })

      console.log("[BALANCE_UPDATE] Updated message status:", {
        messageId: updatedMessage.id,
        newStatus: updatedMessage.status
      })

      let updatedUser = message.user
      // Only deduct balance when status is SENT and it wasn't already SENT
      if (status === "SENT" && message.status !== "SENT") {
        console.log("[BALANCE_UPDATE] Deducting balance:", {
          userId: message.userId,
          amount: message_cost
        })

        updatedUser = await tx.user.update({
          where: { id: message.userId },
          data: {
            balance: {
              decrement: message_cost
            }
          }
        })

        console.log("[BALANCE_UPDATE] Updated user balance:", {
          userId: updatedUser.id,
          newBalance: updatedUser.balance
        })

        // Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            type: "DEBIT",
            amount: message_cost,
            description: `SMS sent to ${phone_number}`,
            status: "COMPLETED",
            userId: message.userId
          }
        })

        console.log("[BALANCE_UPDATE] Created transaction record:", {
          transactionId: transaction.id,
          amount: transaction.amount
        })
      }

      return { 
        message: updatedMessage,
        user: updatedUser
      }
    })

    console.log("[BALANCE_UPDATE] Transaction completed successfully")

    return NextResponse.json({
      success: true,
      message: result.message,
      new_balance: result.user.balance
    })
  } catch (error) {
    console.error("[BALANCE_UPDATE] Error:", error)
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json(
      { error: `Failed to update balance: ${errorMessage}` },
      { status: 500 }
    )
  }
} 