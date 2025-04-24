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
      const date = row.getValue("sentAt") as Date
      return format(date, "PPp")
    },
  },
] 