import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { defaultPricingTiers } from "@/components/pricing-tiers"

// Helper function to calculate cost based on message count
function calculateCost(messageCount: number): number {
  const tier = defaultPricingTiers
    .sort((a, b) => b.minVolume - a.minVolume)
    .find((tier) => messageCount >= tier.minVolume)
  
  const pricePerSMS = tier?.pricePerSMS || defaultPricingTiers[0].pricePerSMS
  return messageCount * pricePerSMS
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify if the user is an admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    // Get current date and date ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Get message counts and calculate costs for different periods and statuses
    const [currentDraftMessages, previousDraftMessages, currentActiveMessages, previousActiveMessages] = await Promise.all([
      // Draft messages (last 30 days)
      prisma.message.count({
        where: {
          campaign: {
            status: "DRAFT"
          },
          createdAt: {
            gte: thirtyDaysAgo,
            lte: now
          }
        }
      }),
      // Draft messages (30-60 days ago)
      prisma.message.count({
        where: {
          campaign: {
            status: "DRAFT"
          },
          createdAt: {
            gte: sixtyDaysAgo,
            lte: thirtyDaysAgo
          }
        }
      }),
      // Active messages (last 30 days)
      prisma.message.count({
        where: {
          campaign: {
            status: "ACTIVE"
          },
          createdAt: {
            gte: thirtyDaysAgo,
            lte: now
          }
        }
      }),
      // Active messages (30-60 days ago)
      prisma.message.count({
        where: {
          campaign: {
            status: "ACTIVE"
          },
          createdAt: {
            gte: sixtyDaysAgo,
            lte: thirtyDaysAgo
          }
        }
      })
    ])

    // Calculate costs
    const currentDraftCosts = calculateCost(currentDraftMessages)
    const previousDraftCosts = calculateCost(previousDraftMessages)
    const currentActiveCosts = calculateCost(currentActiveMessages)
    const previousActiveCosts = calculateCost(previousActiveMessages)

    // Calculate growth percentages
    const draftCostsGrowth = previousDraftCosts === 0 
      ? 100 
      : ((currentDraftCosts - previousDraftCosts) / previousDraftCosts) * 100

    const activeCostsGrowth = previousActiveCosts === 0
      ? 100
      : ((currentActiveCosts - previousActiveCosts) / previousActiveCosts) * 100

    return NextResponse.json({
      draftCosts: {
        current: currentDraftCosts,
        previous: previousDraftCosts,
        growth: draftCostsGrowth
      },
      activeCosts: {
        current: currentActiveCosts,
        previous: previousActiveCosts,
        growth: activeCostsGrowth
      }
    })
  } catch (error) {
    console.error("Error in billing metrics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 