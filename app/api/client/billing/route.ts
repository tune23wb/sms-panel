import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

type PricingTier = "STANDARD" | "SILVER" | "GOLD" | "PLATINUM" | "CUSTOM"

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

function getNextTier(currentTier: PricingTier) {
  const tiers = Object.entries(PRICING_TIERS)
  const currentIndex = tiers.findIndex(([key]) => key === currentTier)
  
  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return null
  }

  const [nextKey, nextTier] = tiers[currentIndex + 1]
  return {
    name: nextTier.name,
    minVolume: nextTier.minVolume,
    maxVolume: nextTier.maxVolume,
    pricePerSMS: nextTier.pricePerSMS
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            createdAt: true,
            type: true,
            amount: true,
            description: true,
            status: true
          }
        }
      }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const userTier = user.pricingTier.toUpperCase() as PricingTier
    const currentTier = PRICING_TIERS[userTier]
    const nextTier = getNextTier(userTier)

    return NextResponse.json({
      balance: user.balance,
      pricePerSMS: currentTier.pricePerSMS,
      currentTier: {
        name: currentTier.name,
        minVolume: currentTier.minVolume,
        maxVolume: currentTier.maxVolume,
        pricePerSMS: currentTier.pricePerSMS
      },
      nextTier,
      transactions: (user as any).transactions || []
    })
  } catch (error) {
    console.error("Error fetching billing data:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 