"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Message History</h3>
        <p className="text-sm text-muted-foreground">
          View your message sending history and status
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>
            A list of all messages sent through your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={[]} />
        </CardContent>
      </Card>
    </div>
  )
} 