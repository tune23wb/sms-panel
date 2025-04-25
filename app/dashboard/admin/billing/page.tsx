"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Download, Plus, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AdminBillingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [billingData, setBillingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const response = await fetch("/api/admin/billing")
        if (!response.ok) {
          throw new Error("Failed to fetch billing data")
        }
        const data = await response.json()
        setBillingData(data)
      } catch (error) {
        console.error("Error fetching billing data:", error)
        toast({
          title: "Error",
          description: "Failed to load billing data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBillingData()
  }, [toast])

  const filteredBillingHistory = (billingData?.transactions || []).filter((item: any) => {
    const matchesSearch = 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.invoice.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="flex-1 space-y-4 p-8 pt-6">Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${billingData?.totalRevenue.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">{billingData?.revenueGrowth > 0 ? "+" : ""}{billingData?.revenueGrowth.toFixed(1)}% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{billingData?.activeSubscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">{billingData?.subscriptionGrowth > 0 ? "+" : ""}{billingData?.subscriptionGrowth.toFixed(1)}% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${billingData?.pendingPayments.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">{billingData?.pendingGrowth > 0 ? "+" : ""}{billingData?.pendingGrowth.toFixed(1)}% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Revenue per User</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${billingData?.averageRevenuePerUser.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">{billingData?.arpuGrowth > 0 ? "+" : ""}{billingData?.arpuGrowth.toFixed(1)}% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-muted rounded-md flex items-end justify-between p-4">
                {[40, 60, 50, 75, 60, 90, 70, 80, 65, 75, 85, 90].map((height, i) => (
                  <div key={i} className="relative h-full w-6 flex flex-col justify-end">
                    <div
                      className="bg-primary rounded-sm w-full transition-all duration-500"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-muted-foreground mt-2">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View and manage all payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBillingHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>${item.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.status === "Paid" ? "bg-green-100 text-green-800" :
                            item.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell>{item.invoice}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>Manage and view all active subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Subscription management content will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 