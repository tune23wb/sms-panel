import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "../[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 })
    }

    // Check if the user is an admin based on the session role
    const isAdmin = session.user.role?.toUpperCase() === "ADMIN"

    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error('Error verifying admin status:', error)
    return NextResponse.json(
      { error: "Failed to verify admin status" },
      { status: 500 }
    )
  }
} 