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

    // Get current date and date ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get daily message counts for the last 30 days
    const dailyMessageCounts = await prisma.message.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        userId: user.id,
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
      _count: true,
      where: {
        userId: user.id
      }
    })

    // Calculate success rate
    const totalMessages = await prisma.message.count({
      where: {
        userId: user.id
      }
    })
    
    const successfulMessages = await prisma.message.count({
      where: {
        userId: user.id,
        status: "DELIVERED"
      }
    })
    
    const successRate = totalMessages === 0 ? 100 : (successfulMessages / totalMessages) * 100

    // Get failed messages count
    const failedMessages = await prisma.message.count({
      where: {
        userId: user.id,
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
      successRate,
      failedMessages,
      totalMessages
    })
  } catch (error) {
    console.error("Error fetching client analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
} 