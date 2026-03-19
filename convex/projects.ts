import { internalMutation, mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import { TIER_LIMITS } from './prompts'

// ─── Create a project + schedule AI repurposing ──────────────────────────────

export const createProject = mutation({
  args: {
    title: v.string(),
    sourceType: v.union(v.literal('text'), v.literal('url')),
    sourceContent: v.string(),
    selectedFormats: v.array(v.string()),
    tone: v.optional(v.string()),
  },
  handler: async (ctx, { title, sourceType, sourceContent, selectedFormats, tone }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthenticated')

    // Fetch user and enforce usage limits
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', identity.subject))
      .unique()
    if (!user) throw new Error('User not found — please sign in again.')

    const limit = TIER_LIMITS[user.subscriptionTier]
    const resetPassed = Date.now() > user.runsResetAt
    const currentRuns = resetPassed ? 0 : user.runsUsedThisMonth

    if (currentRuns >= limit) {
      throw new Error(
        user.subscriptionTier === 'free'
          ? 'You have used all 3 free runs this month. Upgrade to Starter or Pro to continue.'
          : user.subscriptionTier === 'starter'
          ? 'You have used all 30 runs this month. Upgrade to Pro for unlimited runs.'
          : 'Monthly run limit reached.',
      )
    }

    // Prevent empty content
    if (!sourceContent.trim()) throw new Error('Source content cannot be empty.')
    if (selectedFormats.length === 0) throw new Error('Select at least one format.')

    // Insert project record
    const projectId = await ctx.db.insert('projects', {
      userId: identity.subject,
      title,
      sourceType,
      sourceContent,
      status: 'pending',
      selectedFormats,
      tone,
    })

    // Increment run counter
    await ctx.runMutation(internal.users.incrementRunCount, {
      externalId: identity.subject,
    })

    // Schedule AI action (runs immediately after this mutation commits)
    await ctx.scheduler.runAfter(0, internal.ai.repurposeContent, {
      projectId,
      userId: identity.subject,
      sourceContent,
      selectedFormats,
      tone,
    })

    return projectId
  },
})

// ─── Queries ─────────────────────────────────────────────────────────────────

export const listForCurrentUser = query({
  args: {
    paginationOpts: v.optional(
      v.object({
        numItems: v.number(),
        cursor: v.union(v.string(), v.null()),
      }),
    ),
  },
  handler: async (ctx, { paginationOpts }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const results = await ctx.db
      .query('projects')
      .withIndex('byUserId', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .take(paginationOpts?.numItems ?? 20)

    return results
  },
})

export const getById = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const project = await ctx.db.get(projectId)
    if (!project || project.userId !== identity.subject) return null
    return project
  },
})

export const getStatsForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const projects = await ctx.db
      .query('projects')
      .withIndex('byUserId', (q) => q.eq('userId', identity.subject))
      .collect()

    const statusCounts = { pending: 0, processing: 0, done: 0, error: 0 }
    for (const p of projects) statusCounts[p.status]++

    // Projects created in last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recentCount = projects.filter((p) => p._creationTime >= thirtyDaysAgo).length

    return {
      total: projects.length,
      recentCount,
      ...statusCounts,
    }
  },
})

// ─── Internal mutations ───────────────────────────────────────────────────────

export const updateStatus = internalMutation({
  args: {
    projectId: v.id('projects'),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('done'),
      v.literal('error'),
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, status, errorMessage }) => {
    await ctx.db.patch(projectId, { status, ...(errorMessage ? { errorMessage } : {}) })
  },
})
