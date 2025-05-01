import * as React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface EditUserDialogProps {
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
  } | null
  onUserUpdated: () => void
}

export function EditUserDialog({ open, onOpenChange, user, onUserUpdated }: EditUserDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    company: user?.company || "",
    pricingTier: user?.pricingTier || "standard"
  })
  const [balanceAmount, setBalanceAmount] = useState("")
  const [balanceType, setBalanceType] = useState<"CREDIT" | "DEBIT">("CREDIT")

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        company: user.company || "",
        pricingTier: user.pricingTier || "standard"
      })
      setBalanceAmount("")
      setBalanceType("CREDIT")
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      onUserUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBalanceUpdate = async () => {
    if (!user || !balanceAmount) return

    setIsSubmitting(true)
    try {
      const amount = parseFloat(balanceAmount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount greater than 0')
      }

      const response = await fetch(`/api/admin/users/${user.id}/balance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: balanceType,
          amount: amount,
          description: `Balance ${balanceType.toLowerCase()}ed by admin`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update balance')
      }

      toast({
        title: "Success",
        description: `Balance ${balanceType.toLowerCase()}ed successfully`,
      })

      setBalanceAmount("")
      onUserUpdated()
    } catch (error) {
      console.error('Error updating balance:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update balance",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pricingTier" className="text-right">Pricing Tier</Label>
              <Select
                value={formData.pricingTier}
                onValueChange={(value) => setFormData(prev => ({ ...prev, pricingTier: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select pricing tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="border-t pt-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium">Balance Management</h4>
                <p className="text-sm text-muted-foreground">Current balance: ${user.balance?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="balanceAmount" className="text-right">Amount</Label>
                <Input
                  id="balanceAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4 mt-2">
                <Label className="text-right">Type</Label>
                <Select
                  value={balanceType}
                  onValueChange={(value: "CREDIT" | "DEBIT") => setBalanceType(value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREDIT">Credit (Add)</SelectItem>
                    <SelectItem value="DEBIT">Debit (Subtract)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-2 text-right">
                <Button 
                  type="button"
                  onClick={handleBalanceUpdate}
                  disabled={isSubmitting || !balanceAmount}
                  variant="secondary"
                >
                  Update Balance
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 