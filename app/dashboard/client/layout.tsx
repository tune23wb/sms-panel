import type React from "react"

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1">
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
