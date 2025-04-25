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

    // Get current date and date ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const previousMonthStart = new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get daily message counts for the last 30 days
    const dailyMessageCounts = await prisma.message.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
          lte: now
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get message status distribution
    const messageStatuses = await prisma.message.groupBy({
      by: ['status'],
      _count: true
    })

    // Get active users (users who sent messages in the last 30 days)
    const activeUsers = await prisma.user.count({
      where: {
        messages: {
          some: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        }
      }
    })

    // Calculate success rate
    const totalMessages = await prisma.message.count()
    const successfulMessages = await prisma.message.count({
      where: {
        status: "DELIVERED"
      }
    })
    const successRate = totalMessages === 0 ? 100 : (successfulMessages / totalMessages) * 100

    // Get failed messages count
    const failedMessages = await prisma.message.count({
      where: {
        status: "FAILED"
      }
    })

    // Format daily message data for chart
    const messageVolumeData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (29 - i))
      date.setHours(0, 0, 0, 0)
      
      const count = dailyMessageCounts.find(
        d => new Date(d.createdAt).toDateString() === date.toDateString()
      )?._count || 0

      return {
        date: date.toISOString().split('T')[0],
        count
      }
    })

    return NextResponse.json({
      messageVolume: messageVolumeData,
      messageStatuses,
      activeUsers,
      successRate,
      failedMessages,
      totalMessages
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
} 