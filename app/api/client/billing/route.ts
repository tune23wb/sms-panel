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

    console.log('User pricing tier:', user.pricingTier)

    // Get current tier and next tier information
    const currentTier = defaultPricingTiers.find(tier => tier.id === user.pricingTier)
    console.log('Found current tier:', currentTier)

    if (!currentTier) {
      console.error('No matching tier found for:', user.pricingTier)
      // Fallback to standard tier if no match found
      return NextResponse.json({
        balance: user.balance,
        pricePerSMS: defaultPricingTiers[0].pricePerSMS,
        currentTier: defaultPricingTiers[0],
        nextTier: defaultPricingTiers[1] || null,
        transactions: [],
        invoices: []
      })
    }

    const nextTier = defaultPricingTiers
      .sort((a, b) => a.minVolume - b.minVolume)
      .find(tier => tier.minVolume > (currentTier.minVolume || 0))

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
      amount: -currentTier.pricePerSMS,
      description: `SMS sent${t.campaign ? ` (${t.campaign.name})` : ""}`,
      status: t.status
    }))

    return NextResponse.json({
      balance: user.balance,
      pricePerSMS: currentTier.pricePerSMS,
      currentTier: currentTier,
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