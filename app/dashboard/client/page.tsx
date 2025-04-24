"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OverviewPage from "../overview/page"
import AnalyticsPage from "../analytics/page"
import ReportsPage from "../reports/page"

export default function ClientDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "overview"

  const handleTabChange = (value: string) => {
    router.push(`/dashboard/client?tab=${value}`)
  }

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="mt-4">
        {tab === "overview" && <OverviewPage />}
        {tab === "analytics" && <AnalyticsPage />}
        {tab === "reports" && <ReportsPage />}
      </div>
    </>
  )
}
