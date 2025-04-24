"use client"

import { useState } from "react"
import { PlusCircle, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { defaultPricingTiers, formatMXN, type PricingTier } from "@/components/pricing-tiers"

export default function PricingPage() {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(defaultPricingTiers)
  const [editedTier, setEditedTier] = useState<PricingTier | null>(null)

  const handleEditTier = (tier: PricingTier) => {
    setEditedTier({ ...tier })
  }

  const handleSaveTier = () => {
    if (!editedTier) return

    setPricingTiers((tiers) => tiers.map((tier) => (tier.id === editedTier.id ? editedTier : tier)))
    setEditedTier(null)
  }

  const handleAddTier = () => {
    const newTier: PricingTier = {
      id: `tier-${Date.now()}`,
      name: "New Tier",
      minVolume: 0,
      pricePerSMS: 0.7,
      description: "New pricing tier",
    }
    setPricingTiers([...pricingTiers, newTier])
    setEditedTier(newTier)
  }

  const handleDeleteTier = (tierId: string) => {
    setPricingTiers((tiers) => tiers.filter((tier) => tier.id !== tierId))
    if (editedTier?.id === tierId) {
      setEditedTier(null)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Pricing Configuration</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddTier}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Pricing Tier
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tiers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tiers">Pricing Tiers</TabsTrigger>
          <TabsTrigger value="settings">General Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Pricing Tiers</CardTitle>
              <CardDescription>Configure pricing tiers based on message volume</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier Name</TableHead>
                    <TableHead>Min. Volume</TableHead>
                    <TableHead>Price per SMS</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingTiers
                    .sort((a, b) => a.minVolume - b.minVolume)
                    .map((tier) => (
                      <TableRow key={tier.id}>
                        <TableCell className="font-medium">{tier.name}</TableCell>
                        <TableCell>{tier.minVolume.toLocaleString()} SMS</TableCell>
                        <TableCell>{formatMXN(tier.pricePerSMS)}</TableCell>
                        <TableCell className="max-w-xs truncate">{tier.description}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditTier(tier)}>
                              Edit
                            </Button>
                            {tier.id !== "standard" && (
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteTier(tier.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {editedTier && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Pricing Tier</CardTitle>
                <CardDescription>Modify the selected pricing tier details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tier-name">Tier Name</Label>
                      <Input
                        id="tier-name"
                        value={editedTier.name}
                        onChange={(e) => setEditedTier({ ...editedTier, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min-volume">Minimum Volume (SMS)</Label>
                      <Input
                        id="min-volume"
                        type="number"
                        min={0}
                        value={editedTier.minVolume}
                        onChange={(e) =>
                          setEditedTier({ ...editedTier, minVolume: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price-per-sms">Price per SMS (MXN)</Label>
                      <Input
                        id="price-per-sms"
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={editedTier.pricePerSMS}
                        onChange={(e) =>
                          setEditedTier({ ...editedTier, pricePerSMS: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tier-description">Description</Label>
                      <Input
                        id="tier-description"
                        value={editedTier.description}
                        onChange={(e) => setEditedTier({ ...editedTier, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setEditedTier(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTier}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>General Pricing Settings</CardTitle>
              <CardDescription>Configure global pricing settings for the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-currency">Default Currency</Label>
                <Input id="default-currency" value="MXN" disabled />
                <p className="text-xs text-muted-foreground">
                  The platform is currently configured to use Mexican Pesos (MXN)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input id="tax-rate" type="number" min={0} max={100} defaultValue={16} />
                <p className="text-xs text-muted-foreground">Standard IVA tax rate applied to invoices</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-recharge">Minimum Recharge Amount (MXN)</Label>
                <Input id="min-recharge" type="number" min={0} defaultValue={100} />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
