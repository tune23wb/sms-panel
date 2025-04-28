"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export type Message = {
  id: string
  phoneNumber: string
  content: string
  status: string
  createdAt: string
}

export const columns: ColumnDef<Message>[] = [
  {
    accessorKey: "phoneNumber",
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
            status === "SENT"
              ? "default"
              : status === "DELIVERED"
              ? "secondary"
              : status === "PENDING"
              ? "outline"
              : "destructive"
          }
        >
          {status.toUpperCase()}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Sent At",
    cell: ({ row }) => {
      const dateStr = row.getValue("createdAt") as string
      if (!dateStr) return "N/A"
      
      try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) {
          return "Invalid date"
        }
        return format(date, "PPp") // Format as "Apr 29, 2023, 9:30 AM"
      } catch (error) {
        console.error("Error formatting date:", error)
        return "Invalid date"
      }
    },
  },
] 