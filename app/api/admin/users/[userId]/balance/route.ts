import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const updateBalanceSchema = z.object({
  amount: z.number(),
  type: z.enum(["CREDIT", "DEBIT"]),
  description: z.string().optional()
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
    const { amount, type, description } = updateBalanceSchema.parse(body)

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user balance
      const updatedUser = await tx.user.update({
        where: { id: params.userId },
        data: {
          balance: {
            [type === "CREDIT" ? "increment" : "decrement"]: amount
          }
        }
      })

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          type,
          amount,
          description: description || `Balance ${type.toLowerCase()}ed by admin`,
          status: "COMPLETED",
          userId: params.userId
        }
      })

      return { user: updatedUser, transaction }
    })

    return NextResponse.json({
      user: {
        id: result.user.id,
        balance: result.user.balance
      },
      transaction: result.transaction
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating user balance:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 