import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { Message, Transaction, User } from "@prisma/client"

const PRICING_TIERS = {
  STANDARD: {
    name: "Standard",
    minVolume: 1,
    maxVolume: 9999,
    pricePerSMS: 0.70
  },
  SILVER: {
    name: "Silver",
    minVolume: 10000,
    maxVolume: 49999,
    pricePerSMS: 0.65
  },
  GOLD: {
    name: "Gold",
    minVolume: 50000,
    maxVolume: 99999,
    pricePerSMS: 0.60
  },
  PLATINUM: {
    name: "Platinum",
    minVolume: 100000,
    maxVolume: 199999,
    pricePerSMS: 0.55
  },
  CUSTOM: {
    name: "Custom",
    minVolume: 200000,
    maxVolume: 300000,
    pricePerSMS: 0.50
  }
}

export async function GET() {
  return new NextResponse("Method not allowed", { status: 405 })
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: {
        email: session.user.email!
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const { phoneNumber, messageContent } = body

    if (!phoneNumber || !messageContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate SMS cost based on user's pricing tier
    const userTier = user.pricingTier.toUpperCase()
    const tierInfo = PRICING_TIERS[userTier as keyof typeof PRICING_TIERS]
    const smsCost = tierInfo.pricePerSMS

    // Check if user has sufficient balance
    if (user.balance < smsCost) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Start a transaction to ensure atomicity
    const result = await db.$transaction<{
      message: Message;
      transaction: Transaction;
      updatedUser: User;
    }>(async (tx) => {
      // Deduct balance and create transaction record
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: smsCost
          }
        }
      })

      // Create transaction record
      const transactionRecord = await tx.transaction.create({
        data: {
          type: "DEBIT",
          amount: smsCost,
          description: `SMS sent to ${phoneNumber}`,
          status: "COMPLETED",
          userId: user.id
        }
      })

      // Create message record
      const sentMessage = await tx.message.create({
        data: {
          phoneNumber,
          content: messageContent,
          userId: user.id,
          status: "SENT",
        }
      })

      return { 
        message: sentMessage, 
        transaction: transactionRecord, 
        updatedUser 
      }
    })

    return NextResponse.json({
      message: result.message,
      transaction: result.transaction,
      remainingBalance: result.updatedUser.balance
    })
  } catch (error) {
    console.error("[SMS_SEND]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 