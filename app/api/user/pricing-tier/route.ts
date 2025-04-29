import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const INTERNAL_API_KEY = "smpp_internal_key"
const DEFAULT_PRICE_PER_SMS = 0.70 // Default price if no tier found

export async function GET(req: Request) {
  try {
    // Check authorization
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${INTERNAL_API_KEY}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // For internal SMPP service calls, return default pricing
    // In a real implementation, you would look up the user's pricing tier
    return NextResponse.json({
      pricePerSMS: DEFAULT_PRICE_PER_SMS
    })
  } catch (error) {
    console.error("[PRICING_TIER] Error:", error)
    return NextResponse.json(
      { error: "Failed to get pricing tier" },
      { status: 500 }
    )
  }
} 