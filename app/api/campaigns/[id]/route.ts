import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

const updateCampaignSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"]).optional(),
  name: z.string().min(1).optional()
})

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        {
          error: "Campaign not found"
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      campaign: {
        ...campaign,
        messageCount: campaign._count.messages
      }
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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const body = await req.json()
    const { status, name } = updateCampaignSchema.parse(body)

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!campaign) {
      return NextResponse.json(
        {
          error: "Campaign not found"
        },
        { status: 404 }
      )
    }

    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: params.id
      },
      data: {
        status,
        name
      },
      include: {
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    return NextResponse.json({
      campaign: {
        ...updatedCampaign,
        messageCount: updatedCampaign._count.messages
      }
    })
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!campaign) {
      return NextResponse.json(
        {
          error: "Campaign not found"
        },
        { status: 404 }
      )
    }

    await prisma.campaign.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({
      success: true
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