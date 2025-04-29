import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { hash } from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true }
    })

    if (admin?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = resetPasswordSchema.parse(body)

    // Hash the new password
    const hashedPassword = await hash(validatedData.newPassword, 12)

    // Update user's password
    await prisma.user.update({
      where: { id: params.userId },
      data: { hashedPassword: hashedPassword }
    })

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 