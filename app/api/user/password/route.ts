import { compare, hash } from "bcryptjs"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters")
})

export async function PATCH(req: Request) {
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
    const { currentPassword, newPassword } = updatePasswordSchema.parse(body)

    const isValid = await compare(currentPassword, user.password)

    if (!isValid) {
      return NextResponse.json(
        {
          error: "Current password is incorrect"
        },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(newPassword, 10)

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        password: hashedPassword
      }
    })

    return NextResponse.json({
      success: true
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