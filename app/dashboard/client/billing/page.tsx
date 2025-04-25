"use client"

import { useState, useEffect } from "react"
import { CreditCard, Download, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatMXN } from "@/components/pricing-tiers"
import { useToast } from "@/components/ui/use-toast"

export default function BillingPage() {
  const [rechargeAmount, setRechargeAmount] = useState<number>(500)
  const [billingData, setBillingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const response = await fetch("/api/client/billing")
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

  if (loading) {
    return <div className="flex-1 space-y-4 p-8 pt-6">Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Billing & Payments</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMXN(billingData?.balance || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Approx. {Math.floor((billingData?.balance || 0) / billingData?.pricePerSMS)} messages at your rate
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">
              View Payment History
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Pricing</CardTitle>
            <CardDescription>Your current SMS pricing</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Price per SMS:</span>
              <span className="font-medium">{formatMXN(billingData?.pricePerSMS || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Current tier:</span>
              <span className="font-medium">{billingData?.currentTier?.name || "Standard"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Next tier:</span>
              <span className="font-medium">{billingData?.nextTier?.name || "N/A"} ({billingData?.nextTier?.minVolume.toLocaleString()}+ SMS)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Next tier price:</span>
              <span className="font-medium">{formatMXN(billingData?.nextTier?.pricePerSMS || 0)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">
              View Pricing Details
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recharge Account</CardTitle>
            <CardDescription>Add funds to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (MXN)</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRechargeAmount(500)}
                  className={rechargeAmount === 500 ? "bg-primary text-primary-foreground" : ""}
                >
                  $500
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRechargeAmount(1000)}
                  className={rechargeAmount === 1000 ? "bg-primary text-primary-foreground" : ""}
                >
                  $1,000
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRechargeAmount(2000)}
                  className={rechargeAmount === 2000 ? "bg-primary text-primary-foreground" : ""}
                >
                  $2,000
                </Button>
              </div>
              <Input
                id="amount"
                type="number"
                min={100}
                step={100}
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(Number(e.target.value))}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Proceed to Payment</Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View your account transactions and usage</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(billingData?.transactions || []).map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            transaction.type === "Payment" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right ${transaction.amount > 0 ? "text-green-600" : ""}`}>
                        {formatMXN(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatMXN(transaction.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>View and download your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(billingData?.invoices || []).map((invoice: any) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.number}</TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell>{formatMXN(invoice.amount)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          invoice.status === "Paid" ? "bg-green-100 text-green-800" :
                          invoice.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment methods</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Method
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <span className="font-medium">Visa ending in 4242</span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">Expires 04/2025</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
