import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { defaultPricingTiers } from "@/components/pricing-tiers"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user data including their pricing tier
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        balance: true,
        pricingTier: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get current tier and next tier information
    const currentTier = defaultPricingTiers.find(tier => tier.id === user.pricingTier)
    const nextTier = defaultPricingTiers
      .sort((a, b) => a.minVolume - b.minVolume)
      .find(tier => tier.minVolume > (currentTier?.minVolume || 0))

    // Get user's transactions
    const transactions = await prisma.message.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50,
      select: {
        id: true,
        createdAt: true,
        status: true,
        content: true,
        campaign: {
          select: {
            name: true
          }
        }
      }
    })

    // Format transactions
    const formattedTransactions = transactions.map(t => ({
      id: t.id,
      createdAt: t.createdAt,
      type: "Usage",
      amount: -(currentTier?.pricePerSMS || defaultPricingTiers[0].pricePerSMS),
      description: `SMS sent${t.campaign ? ` (${t.campaign.name})` : ""}`,
      status: t.status
    }))

    return NextResponse.json({
      balance: user.balance,
      pricePerSMS: currentTier?.pricePerSMS || defaultPricingTiers[0].pricePerSMS,
      currentTier: currentTier || defaultPricingTiers[0],
      nextTier: nextTier || null,
      transactions: formattedTransactions,
      invoices: [] // Placeholder for future invoice functionality
    })
  } catch (error) {
    console.error("Error in client billing:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 