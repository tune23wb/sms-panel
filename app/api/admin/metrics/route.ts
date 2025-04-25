import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

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

    // Get current date and date 30 days ago
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get total users count
    const totalUsers = await prisma.user.count({
      where: { role: "CLIENT" }
    })

    // Get total messages count
    const totalMessages = await prisma.message.count()

    // Get active campaigns count
    const activeCampaigns = await prisma.campaign.count({
      where: { status: "ACTIVE" }
    })

    // Get messages from last month for comparison
    const messagesLastMonth = await prisma.message.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
          lte: now
        }
      }
    })

    // Get messages from month before last for growth calculation
    const previousMonthStart = new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000)
    const messagesMonthBeforeLast = await prisma.message.count({
      where: {
        createdAt: {
          gte: previousMonthStart,
          lte: thirtyDaysAgo
        }
      }
    })

    // Calculate growth percentages
    const messageGrowth = messagesMonthBeforeLast === 0 
      ? 100 
      : ((messagesLastMonth - messagesMonthBeforeLast) / messagesMonthBeforeLast) * 100

    // Get message status distribution
    const messageStatuses = await prisma.message.groupBy({
      by: ['status'],
      _count: true
    })

    // Calculate delivery rate
    const deliveredCount = messageStatuses.find(s => s.status === "DELIVERED")?._count || 0
    const deliveryRate = totalMessages === 0 ? 100 : (deliveredCount / totalMessages) * 100

    return NextResponse.json({
      totalUsers,
      totalMessages,
      activeCampaigns,
      messageGrowth,
      deliveryRate,
      messageStatuses,
      systemStatus: "Healthy" // You can implement actual system health checks here
    })
  } catch (error) {
    console.error("Error fetching admin metrics:", error)
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    )
  }
} 