import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt"

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth()
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { password } = body

    if (!password) {
      return new NextResponse("Password is required", { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10)

    // Update user's password
    await prisma.user.update({
      where: { id: params.userId },
      data: { hashedPassword }
    })

    return new NextResponse("Password reset successfully", { status: 200 })
  } catch (error) {
    console.error("[RESET_PASSWORD]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 