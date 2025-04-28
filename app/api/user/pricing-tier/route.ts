import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

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
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const userTier = user.pricingTier.toUpperCase()
    const tierInfo = PRICING_TIERS[userTier as keyof typeof PRICING_TIERS]

    return NextResponse.json({
      tier: tierInfo.name,
      pricePerSMS: tierInfo.pricePerSMS,
      minVolume: tierInfo.minVolume,
      maxVolume: tierInfo.maxVolume
    })
  } catch (error) {
    console.error("[PRICING_TIER]", error)
    return NextResponse.json(
      { error: "Failed to get pricing tier" },
      { status: 500 }
    )
  }
} 