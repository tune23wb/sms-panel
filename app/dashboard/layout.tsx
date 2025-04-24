"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  BarChart3,
  MessageSquare,
  Settings,
  Users,
  LogOut,
  LayoutDashboard,
  FileText,
  CreditCard
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { QuantumHubLogo } from "@/components/quantum-hub-logo"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/dashboard/admin')

  const clientNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard/client",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />
    },
    {
      title: "Send SMS",
      href: "/dashboard/send-sms",
      icon: <MessageSquare className="mr-2 h-4 w-4" />
    },
    {
      title: "History",
      href: "/dashboard/history",
      icon: <FileText className="mr-2 h-4 w-4" />
    },
    {
      title: "Billing",
      href: "/dashboard/billing",
      icon: <BarChart3 className="mr-2 h-4 w-4" />
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="mr-2 h-4 w-4" />
    }
  ]

  const adminNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard/admin",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />
    },
    {
      title: "Users",
      href: "/dashboard/admin/users",
      icon: <Users className="mr-2 h-4 w-4" />
    },
    {
      title: "Messages",
      href: "/dashboard/admin/messages",
      icon: <MessageSquare className="mr-2 h-4 w-4" />
    },
    {
      title: "Analytics",
      href: "/dashboard/admin/analytics",
      icon: <BarChart3 className="mr-2 h-4 w-4" />
    },
    {
      title: "Billing",
      href: "/dashboard/admin/billing",
      icon: <CreditCard className="mr-2 h-4 w-4" />
    },
    {
      title: "Settings",
      href: "/dashboard/admin/settings",
      icon: <Settings className="mr-2 h-4 w-4" />
    }
  ]

  const sidebarNavItems = isAdmin ? adminNavItems : clientNavItems

  return (
    <div className="flex min-h-screen dark:bg-gray-950">
      <div className="hidden border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 lg:block lg:w-60">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4">
            <Link href={isAdmin ? "/dashboard/admin" : "/dashboard/client"} className="flex items-center space-x-2">
              <QuantumHubLogo />
            </Link>
            <ThemeToggle />
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-4 text-sm font-medium">
              {sidebarNavItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-gray-500 dark:text-gray-400 transition-all hover:text-gray-900 dark:hover:text-gray-50",
                    pathname === item.href 
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50" 
                      : "transparent"
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-6 w-full max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  )
} 