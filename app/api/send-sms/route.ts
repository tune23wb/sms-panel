import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

export async function GET() {
  return new NextResponse("Method not allowed", { status: 405 })
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: {
        email: session.user.email!
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const { phoneNumber, message } = body

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Here you would integrate with your SMS provider (e.g., Twilio, MessageBird)
    // For now, we'll just store the message in the database
    const sentMessage = await db.message.create({
      data: {
        phoneNumber,
        content: message,
        userId: user.id,
        status: "SENT",
      },
    })

    return NextResponse.json(sentMessage)
  } catch (error) {
    console.error("[SMS_SEND]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 