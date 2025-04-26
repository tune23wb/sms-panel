"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatMXN } from "@/components/pricing-tiers"

interface BillingData {
  balance: number
  pricePerSMS: number
  currentTier: {
    name: string
    minVolume: number
    pricePerSMS: number
  }
  nextTier: {
    name: string
    minVolume: number
    pricePerSMS: number
  } | null
  transactions: Array<{
    id: string
    createdAt: string
    type: string
    amount: number
    description: string
    status: string
  }>
}

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBillingData() {
      try {
        const response = await fetch('/api/client/billing')
        if (!response.ok) {
          throw new Error('Failed to fetch billing data')
        }
        const data = await response.json()
        setBillingData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBillingData()
  }, [])

  if (isLoading) {
    return <div>Loading billing information...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!billingData) {
    return <div>No billing data available</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Billing & Usage</h3>
        <p className="text-sm text-muted-foreground">
          View your current plan, usage, and balance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan Name</span>
                <Badge variant="secondary">{billingData.currentTier.name}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">SMS Rate</span>
                <span className="text-sm">{formatMXN(billingData.pricePerSMS)} per SMS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Minimum Volume</span>
                <span className="text-sm">{billingData.currentTier.minVolume.toLocaleString()} SMS</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
            <CardDescription>Your current balance and next tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Balance</span>
                <span className="text-sm">{formatMXN(billingData.balance)}</span>
              </div>
              {billingData.nextTier && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Next Tier</span>
                    <span className="text-sm">{billingData.nextTier.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Next Tier Rate</span>
                    <span className="text-sm">{formatMXN(billingData.nextTier.pricePerSMS)} per SMS</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Volume Required</span>
                    <span className="text-sm">{billingData.nextTier.minVolume.toLocaleString()} SMS</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your recent SMS usage and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingData.transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent transactions</p>
            ) : (
              <div className="space-y-2">
                {billingData.transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={transaction.amount < 0 ? "text-red-500" : "text-green-500"}>
                        {formatMXN(Math.abs(transaction.amount))}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 