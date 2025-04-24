export type PricingTier = {
  id: string
  name: string
  minVolume: number
  pricePerSMS: number
  description: string
}

export const defaultPricingTiers: PricingTier[] = [
  {
    id: "standard",
    name: "Standard",
    minVolume: 0,
    pricePerSMS: 0.7,
    description: "Regular pricing for all clients",
  },
  {
    id: "silver",
    name: "Silver",
    minVolume: 1000,
    pricePerSMS: 0.65,
    description: "Discounted rate for medium volume",
  },
  {
    id: "gold",
    name: "Gold",
    minVolume: 5000,
    pricePerSMS: 0.6,
    description: "Better pricing for high volume clients",
  },
  {
    id: "platinum",
    name: "Platinum",
    minVolume: 10000,
    pricePerSMS: 0.55,
    description: "Best rates for our highest volume clients",
  },
  {
    id: "custom",
    name: "Custom",
    minVolume: 25000,
    pricePerSMS: 0.5,
    description: "Custom pricing for enterprise clients",
  },
]

export function formatMXN(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function getPricingTierByVolume(volume: number): PricingTier {
  // Find the highest tier that the volume qualifies for
  const tier = [...defaultPricingTiers]
    .sort((a, b) => b.minVolume - a.minVolume)
    .find((tier) => volume >= tier.minVolume)

  return tier || defaultPricingTiers[0] // Default to standard if no tier matches
}
