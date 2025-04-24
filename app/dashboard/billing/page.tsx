"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function BillingPage() {
  // This would come from your API/database in the future
  const userPlan = {
    name: "Basic Plan",
    smsRate: 0.05, // $0.05 per SMS
    monthlyLimit: 1000,
    usedThisMonth: 450,
    balance: 27.50, // $27.50 remaining balance
  }

  const usagePercentage = (userPlan.usedThisMonth / userPlan.monthlyLimit) * 100

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
                <Badge variant="secondary">{userPlan.name}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">SMS Rate</span>
                <span className="text-sm">${userPlan.smsRate.toFixed(2)} per SMS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Limit</span>
                <span className="text-sm">{userPlan.monthlyLimit} SMS</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Your current month's usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Used This Month</span>
                <span className="text-sm">{userPlan.usedThisMonth} SMS</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Usage Progress</span>
                  <span className="text-sm">{usagePercentage.toFixed(1)}%</span>
                </div>
                <Progress value={usagePercentage} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Remaining Balance</span>
                <span className="text-sm">${userPlan.balance.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Future Integration</CardTitle>
          <CardDescription>Coming soon: Stripe integration for payments</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            In the future, this page will be integrated with Stripe to handle payments, 
            subscriptions, and automatic top-ups. You'll be able to:
          </p>
          <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
            <li>View and manage your subscription</li>
            <li>Set up automatic payments</li>
            <li>View detailed billing history</li>
            <li>Download invoices</li>
            <li>Update payment methods</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 