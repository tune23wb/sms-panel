import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message_id, status, phone_number, message_cost } = body

    if (!message_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Start a database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get the message to find the user
      const message = await tx.message.findUnique({
        where: { id: message_id },
        include: { user: true }
      })

      if (!message) {
        throw new Error("Message not found")
      }

      // Update message status
      const updatedMessage = await tx.message.update({
        where: { id: message_id },
        data: { status }
      })

      let updatedUser = null
      // If status is SENT, deduct balance
      if (status === "SENT") {
        updatedUser = await tx.user.update({
          where: { id: message.userId },
          data: {
            balance: {
              decrement: message_cost
            }
          }
        })

        // Create transaction record
        await tx.transaction.create({
          data: {
            type: "DEBIT",
            amount: message_cost,
            description: `SMS sent to ${phone_number}`,
            status: "COMPLETED",
            userId: message.userId
          }
        })
      }

      return { 
        message: updatedMessage,
        user: updatedUser || message.user
      }
    })

    return NextResponse.json({
      success: true,
      message: result.message,
      new_balance: result.user.balance
    })
  } catch (error) {
    console.error("[BALANCE_UPDATE]", error)
    return NextResponse.json(
      { error: "Failed to update balance" },
      { status: 500 }
    )
  }
} 