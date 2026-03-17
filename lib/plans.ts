// Replace these with your actual Polar.sh Product IDs from the dashboard
// Create products in Polar Dashboard → Products and copy the IDs here

export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: '$19/mo',
    description: 'Perfect for active creators',
    polarProductId: process.env.NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID ?? 'REPLACE_STARTER_PRODUCT_ID',
    features: [
      '30 repurposing runs/month',
      'All 10+ output formats',
      'Twitter/X threads',
      'Email sequences',
      'Video scripts',
      'YouTube descriptions',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: '$49/mo',
    description: 'For power creators & teams',
    polarProductId: process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID ?? 'REPLACE_PRO_PRODUCT_ID',
    features: [
      'Unlimited runs',
      'All Starter formats',
      'Long-form video scripts',
      'Brand Voice training',
      'Priority AI processing',
      'Early access to new features',
    ],
  },
} as const

export type PlanId = keyof typeof PLANS
