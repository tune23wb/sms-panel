import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  return NextResponse.json({ message: "Reset password endpoint" })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth()
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10)

    // Update user's password
    await prisma.user.update({
      where: { id: params.userId },
      data: { hashedPassword }
    })

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 })
  } catch (error) {
    console.error("[RESET_PASSWORD]", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
} 