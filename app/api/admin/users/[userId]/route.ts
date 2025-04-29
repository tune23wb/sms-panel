import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  company: z.string().optional(),
  pricingTier: z.string().optional(),
  status: z.enum(["Active", "Inactive", "Suspended"]).optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession()

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
    const validatedData = updateUserSchema.parse(body)

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        role: true,
        status: true,
        balance: true,
        pricingTier: true,
        lastActive: true,
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 