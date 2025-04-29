import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface User {
  id: string
  name: string
  email: string
  company?: string
  role: string
  status: string
  balance?: number
  pricingTier?: string
  lastActive: string
}

interface ViewUserDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewUserDialog({ user, open, onOpenChange }: ViewUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View detailed information about this user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Name</h4>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Email</h4>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Company</h4>
            <p className="text-sm text-muted-foreground">{user.company || "N/A"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Role</h4>
            <p className="text-sm text-muted-foreground">{user.role}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Status</h4>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  user.status === "Active"
                    ? "bg-green-500"
                    : user.status === "Inactive"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
              <p className="text-sm text-muted-foreground">{user.status}</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium">Balance</h4>
            <p className="text-sm text-muted-foreground">
              ${user.balance?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Pricing Tier</h4>
            <p className="text-sm text-muted-foreground">
              {user.pricingTier || "Standard"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Last Active</h4>
            <p className="text-sm text-muted-foreground">{user.lastActive}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 