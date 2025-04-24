"use client"

import { useState } from "react"
import { CreditCard, Download, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatMXN } from "@/components/pricing-tiers"

// Sample transaction data
const transactions = [
  { id: 1, date: "2023-04-15", type: "Payment", amount: 1000, description: "Account recharge", balance: 1000 },
  { id: 2, date: "2023-04-16", type: "Usage", amount: -70, description: "100 SMS sent", balance: 930 },
  { id: 3, date: "2023-04-18", type: "Usage", amount: -140, description: "200 SMS sent", balance: 790 },
  { id: 4, date: "2023-04-20", type: "Usage", amount: -35, description: "50 SMS sent", balance: 755 },
  { id: 5, date: "2023-04-25", type: "Payment", amount: 500, description: "Account recharge", balance: 1255 },
  { id: 6, date: "2023-04-28", type: "Usage", amount: -280, description: "400 SMS sent", balance: 975 },
  { id: 7, date: "2023-05-01", type: "Usage", amount: -100, description: "Scheduled campaign", balance: 875 },
]

export default function BillingPage() {
  const [rechargeAmount, setRechargeAmount] = useState<number>(500)

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
            <div className="text-2xl font-bold">{formatMXN(875)}</div>
            <p className="text-xs text-muted-foreground">Approx. 1,250 messages at your rate</p>
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
              <span className="font-medium">{formatMXN(0.7)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Current tier:</span>
              <span className="font-medium">Standard</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Next tier:</span>
              <span className="font-medium">Silver (1,000+ SMS)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Next tier price:</span>
              <span className="font-medium">{formatMXN(0.65)}</span>
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
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
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
                  <TableRow>
                    <TableCell>INV-001</TableCell>
                    <TableCell>2023-04-15</TableCell>
                    <TableCell>{formatMXN(1000)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Paid
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>INV-002</TableCell>
                    <TableCell>2023-04-25</TableCell>
                    <TableCell>{formatMXN(500)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Paid
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
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
