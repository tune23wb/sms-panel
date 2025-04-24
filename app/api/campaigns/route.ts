import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import type { Campaign } from "@prisma/client"

import { prisma } from "@/lib/prisma"

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"]).default("DRAFT")
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized"
        },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, status } = campaignSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!
      }
    })

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found"
        },
        { status: 404 }
      )
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        status,
        userId: user.id
      }
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.errors[0].message
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Internal server error"
      },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized"
        },
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
        {
          error: "User not found"
        },
        { status: 404 }
      )
    }

    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: user.id
      },
      include: {
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({
      campaigns: campaigns.map((campaign: Campaign & { _count: { messages: number } }) => ({
        ...campaign,
        messageCount: campaign._count.messages
      }))
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error"
      },
      { status: 500 }
    )
  }
} 