import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // ─── Users ──────────────────────────────────────────────────────────────────
  users: defineTable({
    externalId: v.string(),           // Clerk user ID (identity.subject)
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    subscriptionTier: v.union(        // updated by Polar.sh webhook
      v.literal('free'),
      v.literal('starter'),
      v.literal('pro'),
    ),
    polarCustomerId: v.optional(v.string()),
    runsUsedThisMonth: v.number(),    // reset monthly
    runsResetAt: v.number(),          // Unix timestamp of next reset
  })
    .index('byExternalId', ['externalId'])
    .index('byPolarCustomerId', ['polarCustomerId']),

  // ─── Projects ───────────────────────────────────────────────────────────────
  projects: defineTable({
    userId: v.string(),               // Clerk user ID
    title: v.string(),
    sourceType: v.union(v.literal('text'), v.literal('url')),
    sourceContent: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('done'),
      v.literal('error'),
    ),
    errorMessage: v.optional(v.string()),
    selectedFormats: v.array(v.string()),
  })
    .index('byUserId', ['userId']),

  // ─── Outputs ────────────────────────────────────────────────────────────────
  outputs: defineTable({
    projectId: v.id('projects'),
    userId: v.string(),
    formatType: v.string(),           // e.g. "twitter_thread", "newsletter"
    content: v.string(),
    aiProvider: v.union(v.literal('claude'), v.literal('grok')),
    starred: v.optional(v.boolean()), // user-favourited output
  })
    .index('byProjectId', ['projectId'])
    .index('byUserId', ['userId'])
    .index('byUserIdStarred', ['userId', 'starred']),

  // ─── Brand Voice (Pro only) ─────────────────────────────────────────────────
  brandVoice: defineTable({
    userId: v.string(),
    sampleTexts: v.array(v.string()),
    voiceDescription: v.optional(v.string()),
    updatedAt: v.number(),
  }).index('byUserId', ['userId']),
})
