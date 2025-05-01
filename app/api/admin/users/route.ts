import { hash } from "bcryptjs"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

// Create a schema for input validation
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  company: z.string().optional(),
  balance: z.number().min(0, "Balance cannot be negative"),
  pricingTier: z.string(),
})

async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // First check if we have a session and user
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Then verify if the user is an admin
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true }
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastActive: true,
        balance: true,
        company: true,
        pricingTier: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function POST(req: Request) {
  try {
    console.log('Received user creation request')
    
    // Check if the user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    console.log('Session:', session)
    
    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json(
        { error: "Unauthorized - No session found" },
        { status: 401 }
      )
    }

    // Verify admin role
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })
    console.log('Admin check:', admin?.role)

    if (!admin || admin.role !== "ADMIN") {
      console.log('Not an admin:', admin?.role)
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const json = await req.json()
    console.log('Request body:', { ...json, password: '[REDACTED]' })
    
    const body = createUserSchema.parse(json)

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

    try {
      // Create the user
      const user = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          hashedPassword,
          role: "CLIENT",
          status: "Active",
          company: body.company,
          balance: body.balance,
          pricingTier: body.pricingTier,
        },
      })
      console.log('User created successfully:', { id: user.id, email: user.email })

      // Remove sensitive data from response
      const { hashedPassword: _, ...result } = user

      return NextResponse.json(
        { user: result, message: "User created successfully" },
        { status: 201 }
      )
    } catch (dbError) {
      console.error('Database error:', dbError)
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { 
            error: "Database error",
            code: dbError.code,
            details: dbError.message
          },
          { status: 500 }
        )
      }
      throw dbError
    }
  } catch (error) {
    console.error('Error creating user:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Validation error",
          details: error.errors[0].message
        },
        { status: 400 }
      )
    }

    // Return more detailed error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json(
      { 
        error: "Something went wrong while creating the user",
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

export { GET, POST }; 