import { Webhooks } from '@polar-sh/nextjs'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import type { WebhookCustomerStateChangedPayload } from '@polar-sh/sdk/models/components/webhookcustomerstatechangedpayload'
import type {
  WebhookSubscriptionCreatedPayload,
} from '@polar-sh/sdk/models/components/webhooksubscriptioncreatedpayload'
import type {
  WebhookSubscriptionCanceledPayload,
} from '@polar-sh/sdk/models/components/webhooksubscriptioncanceledpayload'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// Maps Polar product IDs → subscription tiers
function productIdToTier(productId: string): 'free' | 'starter' | 'pro' {
  if (productId === process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID) return 'pro'
  if (productId === process.env.NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID) return 'starter'
  return 'free'
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  onCustomerStateChanged: async (payload: WebhookCustomerStateChangedPayload) => {
    // payload.data is a CustomerState object
    const customerState = payload.data
    const externalId = customerState.externalId // = Clerk userId (set at checkout)
    if (!externalId) {
      console.warn('Polar webhook: no externalId on customer', customerState.id)
      return
    }

    // Determine the highest active subscription tier
    let tier: 'free' | 'starter' | 'pro' = 'free'
    for (const sub of customerState.activeSubscriptions) {
      const subTier = productIdToTier(sub.productId)
      if (subTier === 'pro') { tier = 'pro'; break }
      if (subTier === 'starter') tier = 'starter'
    }

    await convex.mutation(api.users.updateSubscriptionFromWebhook, {
      externalId,
      tier,
      polarCustomerId: customerState.id,
      webhookSecret: process.env.CONVEX_INTERNAL_WEBHOOK_SECRET!,
    })
  },

  onSubscriptionCreated: async (payload: WebhookSubscriptionCreatedPayload) => {
    console.log('Subscription created:', payload.data.id)
  },

  onSubscriptionCanceled: async (payload: WebhookSubscriptionCanceledPayload) => {
    console.log('Subscription cancelled:', payload.data.id)
  },
})
