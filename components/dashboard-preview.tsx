import { BarChart2, MessageSquare, Calendar, Clock, CheckCircle2, XCircle } from "lucide-react"

export function DashboardPreview() {
  return (
    <div className="bg-background w-full h-full p-8 overflow-hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">View your SMS platform performance at a glance</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {/* Total Messages */}
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium">Total Messages</p>
              <h3 className="text-2xl font-bold mt-2">1234</h3>
              <p className="text-sm text-green-500 mt-1">+12.5% from last month</p>
            </div>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-1 bg-indigo-100 mt-4 rounded-full">
            <div className="h-1 bg-indigo-500 rounded-full w-3/4"></div>
          </div>
        </div>

        {/* Delivery Rate */}
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium">Delivery Rate</p>
              <h3 className="text-2xl font-bold mt-2">98.5%</h3>
            </div>
            <BarChart2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-1 bg-green-100 mt-4 rounded-full">
            <div className="h-1 bg-green-500 rounded-full w-[98.5%]"></div>
          </div>
        </div>

        {/* Credits Left */}
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium">Credits Left</p>
              <h3 className="text-2xl font-bold mt-2">766</h3>
              <p className="text-sm text-muted-foreground mt-1">Approx. 25 days remaining</p>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-1 bg-blue-100 mt-4 rounded-full">
            <div className="h-1 bg-blue-500 rounded-full w-1/2"></div>
          </div>
        </div>

        {/* Next Auto-Recharge */}
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium">Next Auto-Recharge</p>
              <h3 className="text-2xl font-bold mt-2">15 Days</h3>
              <p className="text-sm text-muted-foreground mt-1">Auto-recharge: $50.00</p>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-1 bg-orange-100 mt-4 rounded-full">
            <div className="h-1 bg-orange-500 rounded-full w-1/4"></div>
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">Recent Messages</h3>
        <p className="text-sm text-muted-foreground mb-6">Your latest SMS activities</p>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Your appointment is confirmed for tomorrow at 2 PM</p>
              <p className="text-sm text-muted-foreground">2 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium">Your order #123 has been shipped</p>
              <p className="text-sm text-muted-foreground">15 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 