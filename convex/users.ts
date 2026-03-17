import { internalMutation, internalQuery, mutation, query } from './_generated/server'
import { v } from 'convex/values'

// ─── Public queries ──────────────────────────────────────────────────────────

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    return await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', identity.subject))
      .unique()
  },
})

// ─── Internal queries ────────────────────────────────────────────────────────

export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, { externalId }) => {
    return await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', externalId))
      .unique()
  },
})

export const getByPolarCustomerId = query({
  args: { polarCustomerId: v.string() },
  handler: async (ctx, { polarCustomerId }) => {
    return await ctx.db
      .query('users')
      .withIndex('byPolarCustomerId', (q) =>
        q.eq('polarCustomerId', polarCustomerId),
      )
      .unique()
  },
})

// ─── Internal mutations (called from Clerk webhook) ──────────────────────────

export const upsertFromClerk = internalMutation({
  args: {
    data: v.any(), // Clerk user webhook payload
  },
  handler: async (ctx, { data }) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', data.id))
      .unique()

    const name =
      `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() || 'Unknown'
    const email = data.email_addresses?.[0]?.email_address ?? ''
    const imageUrl = data.image_url ?? undefined

    if (existing) {
      await ctx.db.patch(existing._id, { name, email, imageUrl })
    } else {
      const now = Date.now()
      const nextMonthReset = now + 30 * 24 * 60 * 60 * 1000 // 30 days from now
      await ctx.db.insert('users', {
        externalId: data.id,
        name,
        email,
        imageUrl,
        subscriptionTier: 'free',
        runsUsedThisMonth: 0,
        runsResetAt: nextMonthReset,
      })
    }
  },
})

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', clerkUserId))
      .unique()
    if (user) await ctx.db.delete(user._id)
  },
})

// ─── Subscription update via Polar webhook (called from Next.js route handler) ─

// This mutation is callable via ConvexHttpClient from the Next.js API route.
// It validates a shared internal secret to prevent unauthorized calls.
export const updateSubscriptionFromWebhook = mutation({
  args: {
    externalId: v.string(),
    tier: v.union(v.literal('free'), v.literal('starter'), v.literal('pro')),
    polarCustomerId: v.optional(v.string()),
    webhookSecret: v.string(),
  },
  handler: async (ctx, { externalId, tier, polarCustomerId, webhookSecret }) => {
    // Validate the internal shared secret (set in Convex env vars)
    if (webhookSecret !== process.env.CONVEX_INTERNAL_WEBHOOK_SECRET) {
      throw new Error('Unauthorized')
    }
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', externalId))
      .unique()
    if (!user) throw new Error(`User not found: ${externalId}`)
    await ctx.db.patch(user._id, {
      subscriptionTier: tier,
      ...(polarCustomerId ? { polarCustomerId } : {}),
    })
  },
})

// ─── Increment run counter (called before AI action) ─────────────────────────

export const incrementRunCount = internalMutation({
  args: { externalId: v.string() },
  handler: async (ctx, { externalId }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', externalId))
      .unique()
    if (!user) throw new Error('User not found')

    // Reset counter if monthly window has passed
    const now = Date.now()
    if (now > user.runsResetAt) {
      await ctx.db.patch(user._id, {
        runsUsedThisMonth: 1,
        runsResetAt: now + 30 * 24 * 60 * 60 * 1000,
      })
    } else {
      await ctx.db.patch(user._id, {
        runsUsedThisMonth: user.runsUsedThisMonth + 1,
      })
    }
  },
})

// ─── Update brand voice (Pro only) ───────────────────────────────────────────

export const upsertBrandVoice = mutation({
  args: {
    sampleTexts: v.array(v.string()),
    voiceDescription: v.optional(v.string()),
  },
  handler: async (ctx, { sampleTexts, voiceDescription }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthenticated')

    // Verify Pro tier
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', identity.subject))
      .unique()
    if (!user || user.subscriptionTier !== 'pro') {
      throw new Error('Brand Voice is a Pro feature. Please upgrade.')
    }

    const existing = await ctx.db
      .query('brandVoice')
      .withIndex('byUserId', (q) => q.eq('userId', identity.subject))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        sampleTexts,
        voiceDescription,
        updatedAt: Date.now(),
      })
    } else {
      await ctx.db.insert('brandVoice', {
        userId: identity.subject,
        sampleTexts,
        voiceDescription,
        updatedAt: Date.now(),
      })
    }
  },
})

export const getBrandVoice = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    return await ctx.db
      .query('brandVoice')
      .withIndex('byUserId', (q) => q.eq('userId', identity.subject))
      .unique()
  },
})

// Internal version for use inside actions
export const getBrandVoiceForUser = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const entry = await ctx.db
      .query('brandVoice')
      .withIndex('byUserId', (q) => q.eq('userId', userId))
      .unique()
    return entry?.voiceDescription ?? null
  },
})
