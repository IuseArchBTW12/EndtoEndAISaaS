'use server'

import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { polar } from '@/lib/polar'
import { PLANS, type PlanId } from '@/lib/plans'

export async function createCheckoutSession(planId: PlanId) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const plan = PLANS[planId]
  if (!plan) throw new Error(`Unknown plan: ${planId}`)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  const checkout = await polar.checkouts.create({
    products: [plan.polarProductId],
    externalCustomerId: userId, // Links Polar customer → Clerk user for webhook sync
    successUrl: `${baseUrl}/dashboard?checkout=success&checkout_id={CHECKOUT_ID}`,
  })

  redirect(checkout.url)
}
