import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

// Create a schema for input validation
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(req: Request) {
  try {
    console.log('Received registration request')
    const json = await req.json()
    console.log('Request body:', { ...json, password: '[REDACTED]' })
    
    const body = registerSchema.parse(json)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      console.log('User already exists:', body.email)
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await hash(body.password, 12)

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        hashedPassword: hashedPassword, // Note: changed from password to hashedPassword to match schema
      },
    })

    console.log('User created successfully:', { id: user.id, email: user.email })

    // Remove sensitive data from response
    const { hashedPassword: _, ...result } = user

    return NextResponse.json(
      { user: result, message: "User created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Something went wrong during registration" },
      { status: 500 }
    )
  }
} 