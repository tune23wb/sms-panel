"use client"

import * as React from "react"
import { useState, useRef, useEffect, FormEvent } from "react"
import { MoreHorizontal, Plus, Search, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ViewUserDialog } from "@/app/components/dialogs/ViewUserDialog"
import { EditUserDialog } from "@/app/components/dialogs/EditUserDialog"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastActive: string
  company?: string
  balance?: number
  pricingTier?: string
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [editUserOpen, setEditUserOpen] = useState(false)
  const createClientFormRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user status')
      }

      // Update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ))

      toast({
        title: "Success",
        description: `User status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error('Error updating user status:', error)
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateBalance = async (userId: string, type: "CREDIT" | "DEBIT", amount: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/balance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          amount,
          description: `Balance ${type.toLowerCase()}ed by admin`
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update balance')
      }

      toast({
        title: "Success",
        description: `User balance ${type.toLowerCase()}ed successfully`,
      })

      // Refresh user list
      await fetchUsers()
    } catch (error) {
      console.error('Error updating balance:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update balance",
        variant: "destructive",
      })
    }
  }

  const handleCreateClient = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const firstName = formData.get('first-name') as string
      const lastName = formData.get('last-name') as string
      const email = formData.get('email') as string
      const company = formData.get('company') as string
      const password = formData.get('initial-password') as string
      const balanceRaw = formData.get('balance');
      const balance = balanceRaw !== null && balanceRaw !== '' ? Number(balanceRaw) : 0;
      const pricingTier = formData.get('pricing-tier') as string

      console.log('Submitting form data:', {
        name: `${firstName} ${lastName}`,
        email,
        company,
        balance,
        pricingTier
      })

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          company,
          password,
          balance,
          pricingTier,
        }),
      })

      const data = await response.json()
      console.log('Server response:', data)

      if (!response.ok) {
        if (response.status === 400 && data.error === "User with this email already exists") {
          throw new Error(`A user with the email ${email} already exists. Please use a different email address.`)
        }
        
        let errorMessage = data.error || 'Failed to create user'
        if (data.details) {
          errorMessage += `: ${data.details}`
        }
        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: "New client account created successfully",
      })

      // Reset form with null check
      if (e.currentTarget) {
        e.currentTarget.reset()
      }
      
      // Refresh user list
      await fetchUsers()

    } catch (error) {
      console.error('Error creating client:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create client account",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => createClientFormRef.current?.scrollIntoView({ behavior: "smooth" })}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage your platform users, their permissions and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'Active' ? 'bg-green-100 text-green-800' :
                          user.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        ${user.balance?.toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell>{new Date(user.lastActive).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setViewDetailsOpen(true);
                            }}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setEditUserOpen(true);
                            }}>
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(user.id, user.status === 'Active' ? 'Suspended' : 'Active')}>
                              {user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6" ref={createClientFormRef}>
        <CardHeader>
          <CardTitle>Create New Client</CardTitle>
          <CardDescription>Add a new client to the Quantum Hub platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateClient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input 
                  id="first-name" 
                  name="first-name" 
                  autoComplete="given-name"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input 
                  id="last-name" 
                  name="last-name" 
                  autoComplete="family-name"
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="client@example.com" 
                autoComplete="email"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                name="company" 
                autoComplete="organization"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initial-password">Initial Password</Label>
              <Input 
                id="initial-password" 
                name="initial-password" 
                type="password" 
                autoComplete="new-password"
                required 
              />
              <p className="text-xs text-muted-foreground">
                The client will be prompted to change this password on first login
              </p>
            </div>
            <div className="space-y-2">
              <Label>Initial Balance (MXN)</Label>
              <Input type="number" name="balance" defaultValue={0} min={0} step={0.01} />
              <p className="text-xs text-muted-foreground">Initial balance in Mexican Pesos (MXN)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricing-tier">Pricing Tier</Label>
              <select
                id="pricing-tier"
                name="pricing-tier"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="standard">Standard - $0.70 MXN per SMS (1-9,999 SMS)</option>
                <option value="silver">Silver - $0.65 MXN per SMS (10,000-49,999 SMS)</option>
                <option value="gold">Gold - $0.60 MXN per SMS (50,000-99,999 SMS)</option>
                <option value="platinum">Platinum - $0.55 MXN per SMS (100,000-199,999 SMS)</option>
                <option value="custom">Custom - $0.50 MXN per SMS (200,000-300,000 SMS)</option>
              </select>
              <p className="text-xs text-muted-foreground">Select the appropriate pricing tier for this client</p>
            </div>
            <Button type="submit" className="mt-2" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Client Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {selectedUser && (
        <>
          <ViewUserDialog
            user={selectedUser}
            open={viewDetailsOpen}
            onOpenChange={setViewDetailsOpen}
          />
          <EditUserDialog
            user={selectedUser}
            open={editUserOpen}
            onOpenChange={setEditUserOpen}
            onUserUpdated={fetchUsers}
          />
        </>
      )}
    </div>
  )
}
