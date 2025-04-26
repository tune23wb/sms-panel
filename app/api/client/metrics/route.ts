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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get current date and date 30 days ago
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get total messages count for this user
    const totalMessages = await prisma.message.count({
      where: { userId: user.id }
    })

    // Get messages from last month for this user
    const messagesLastMonth = await prisma.message.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: thirtyDaysAgo,
          lte: now
        }
      }
    })

    // Get message status distribution for this user
    const messageStatuses = await prisma.message.groupBy({
      by: ['status'],
      _count: true,
      where: { userId: user.id }
    })

    // Calculate delivery rate for this user
    const deliveredCount = messageStatuses.find(s => s.status === "DELIVERED")?._count || 0
    const deliveryRate = totalMessages === 0 ? 100 : (deliveredCount / totalMessages) * 100

    // Get active campaigns count for this user
    const activeCampaigns = await prisma.campaign.count({
      where: {
        userId: user.id,
        status: "ACTIVE"
      }
    })

    // Get recent messages
    const recentMessages = await prisma.message.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        phoneNumber: true,
        content: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      totalMessages,
      messagesLastMonth,
      activeCampaigns,
      deliveryRate,
      messageStatuses,
      balance: user.balance,
      recentMessages
    })
  } catch (error) {
    console.error("Error fetching client metrics:", error)
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    )
  }
} 