import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface ViewUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    id: string
    name: string
    email: string
    role: string
    status: string
    company?: string
    balance?: number
    pricingTier?: string
    lastActive: string
  } | null
}

export function ViewUserDialog({ open, onOpenChange, user }: ViewUserDialogProps) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Name</Label>
            <div className="col-span-3">{user.name}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Email</Label>
            <div className="col-span-3">{user.email}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Role</Label>
            <div className="col-span-3">{user.role}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status</Label>
            <div className="col-span-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.status === 'Active' ? 'bg-green-100 text-green-800' :
                user.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {user.status}
              </span>
            </div>
          </div>
          {user.company && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Company</Label>
              <div className="col-span-3">{user.company}</div>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Balance</Label>
            <div className="col-span-3">${user.balance?.toFixed(2) || "0.00"}</div>
          </div>
          {user.pricingTier && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Pricing Tier</Label>
              <div className="col-span-3">{user.pricingTier}</div>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Last Active</Label>
            <div className="col-span-3">{new Date(user.lastActive).toLocaleString()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 