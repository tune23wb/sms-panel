"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function ReportsPage() {
  const reports = [
    {
      title: "Monthly Summary",
      description: "Complete overview of messaging activity",
      period: "June 2024",
      type: "PDF",
    },
    {
      title: "Delivery Report",
      description: "Detailed message delivery statistics",
      period: "Q2 2024",
      type: "CSV",
    },
    {
      title: "Cost Analysis",
      description: "Breakdown of messaging costs",
      period: "2024 YTD",
      type: "Excel",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Reports</h3>
        <p className="text-sm text-muted-foreground">
          Download and analyze your messaging data
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-xl">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Period</p>
                  <p className="text-sm text-muted-foreground">{report.period}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Format</p>
                  <p className="text-sm text-muted-foreground">{report.type}</p>
                </div>
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 