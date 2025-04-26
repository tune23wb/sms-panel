"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export type Message = {
  id: string
  recipient: string
  content: string
  status: "sent" | "delivered" | "failed"
  sentAt: Date
}

export const columns: ColumnDef<Message>[] = [
  {
    accessorKey: "recipient",
    header: "Recipient",
  },
  {
    accessorKey: "content",
    header: "Message",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={
            status === "sent"
              ? "default"
              : status === "delivered"
              ? "secondary"
              : "destructive"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "sentAt",
    header: "Sent At",
    cell: ({ row }) => {
      try {
        const dateStr = row.getValue("sentAt") as string
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) {
          return "Invalid date"
        }
        return format(date, "PPp")
      } catch (error) {
        console.error("Error formatting date:", error)
        return "Invalid date"
      }
    },
  },
] 