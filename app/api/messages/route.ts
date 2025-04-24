import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import type { Message } from "@prisma/client"

import { prisma } from "@/lib/prisma"

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

    const messages = await prisma.message.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({
      messages: messages.map((message: Message) => ({
        id: message.id,
        content: message.content,
        recipient: message.recipient,
        status: message.status,
        createdAt: message.createdAt.toISOString()
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