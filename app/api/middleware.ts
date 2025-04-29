import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"

const INTERNAL_API_KEY = "smpp_internal_key"

export async function middleware(request: NextRequest) {
  // Check if this is an internal API call from SMPP service
  const authHeader = request.headers.get("authorization")
  if (authHeader === `Bearer ${INTERNAL_API_KEY}`) {
    return NextResponse.next()
  }

  // For regular API calls, check session
  const session = await getServerSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/api/update-balance",
    "/api/user/pricing-tier"
  ]
} 