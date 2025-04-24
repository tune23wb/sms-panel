"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CreditCard, Home, Settings, Users, MessageSquare } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { QuantumHubLogo } from "@/components/quantum-hub-logo"

interface SidebarProps {
  isAdmin?: boolean
}

export function DashboardSidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname()

  const clientLinks = [
    {
      name: "Overview",
      href: "/dashboard/client",
      icon: Home,
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const adminLinks = [
    {
      name: "Dashboard",
      href: "/dashboard/admin",
      icon: Home,
    },
    {
      name: "Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      name: "Messages",
      href: "/dashboard/admin/messages",
      icon: MessageSquare,
    },
    {
      name: "Analytics",
      href: "/dashboard/admin/analytics",
      icon: BarChart3,
    },
    {
      name: "Billing",
      href: "/dashboard/admin/billing",
      icon: CreditCard,
    },
    {
      name: "Settings",
      href: "/dashboard/admin/settings",
      icon: Settings,
    },
  ]

  const links = isAdmin ? adminLinks : clientLinks

  return (
    <div className="hidden border-r bg-background lg:block w-64">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href={isAdmin ? "/dashboard/admin" : "/dashboard/client"} className="flex items-center gap-2 font-semibold">
            <QuantumHubLogo textClassName={isAdmin ? "text-primary" : ""} />
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={pathname === link.href ? "secondary" : "ghost"}
                  className={cn("w-full justify-start gap-2", pathname === link.href && "bg-secondary")}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
