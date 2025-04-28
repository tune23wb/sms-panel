import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
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
        data: { status }
      })

      console.log("[BALANCE_UPDATE] Updated message status:", {
        messageId: updatedMessage.id,
        newStatus: updatedMessage.status
      })

      let updatedUser = null
      // If status is SENT, deduct balance
      if (status === "SENT") {
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
        user: updatedUser || message.user
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
    return NextResponse.json(
      { error: "Failed to update balance" },
      { status: 500 }
    )
  }
} 