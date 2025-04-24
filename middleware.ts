import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { authOptions } from "@/lib/auth"

// Extend the JWT type to include role
declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAdminPage = request.nextUrl.pathname.startsWith("/dashboard/admin")
  const isAdminLoginPage = request.nextUrl.pathname === "/admin/login"
  const isRegularDashboard = request.nextUrl.pathname === "/dashboard" || request.nextUrl.pathname === "/dashboard/client"
  const isRootPath = request.nextUrl.pathname === "/"

  // If trying to access admin pages
  if (isAdminPage) {
    if (!token) {
      // Redirect to admin login if not logged in
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Check if the user is an admin based on the token role
    const isAdmin = token.role?.toUpperCase() === "ADMIN"

    if (!isAdmin) {
      // Redirect non-admin users to regular dashboard
      return NextResponse.redirect(new URL("/dashboard/client", request.url))
    }
  }

  // If accessing admin login while already logged in as admin
  if (isAdminLoginPage && token) {
    const isAdmin = token.role?.toUpperCase() === "ADMIN"

    if (isAdmin) {
      // Redirect to admin dashboard if already logged in as admin
      return NextResponse.redirect(new URL("/dashboard/admin", request.url))
    }
  }

  // If accessing regular dashboard, check if user is admin
  if (isRegularDashboard && token) {
    const isAdmin = token.role?.toUpperCase() === "ADMIN"

    if (isAdmin) {
      // Redirect admin users to admin dashboard
      return NextResponse.redirect(new URL("/dashboard/admin", request.url))
    }
  }

  // If accessing root path and logged in as admin, redirect to admin dashboard
  if (isRootPath && token) {
    const isAdmin = token.role?.toUpperCase() === "ADMIN"

    if (isAdmin) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url))
    }
  }

  // Allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/login",
    "/",
  ],
} 