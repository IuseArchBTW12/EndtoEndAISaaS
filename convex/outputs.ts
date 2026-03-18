import { internalMutation, mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const getForProject = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    return await ctx.db
      .query('outputs')
      .withIndex('byProjectId', (q) => q.eq('projectId', projectId))
      .collect()
  },
})

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    return await ctx.db
      .query('outputs')
      .withIndex('byUserId', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .take(50)
  },
})

// ─── Star / favourite ───────────────────────────────────────────────────────

export const toggleStar = mutation({
  args: { outputId: v.id('outputs') },
  handler: async (ctx, { outputId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthenticated')
    const output = await ctx.db.get(outputId)
    if (!output || output.userId !== identity.subject) throw new Error('Not found')
    const next = !output.starred
    await ctx.db.patch(outputId, { starred: next })
    return next
  },
})

export const getStarred = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    return await ctx.db
      .query('outputs')
      .withIndex('byUserIdStarred', (q) =>
        q.eq('userId', identity.subject).eq('starred', true),
      )
      .order('desc')
      .collect()
  },
})

// ─── Stats (used by Analytics page) ─────────────────────────────────────────

export const getStatsForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const outputs = await ctx.db
      .query('outputs')
      .withIndex('byUserId', (q) => q.eq('userId', identity.subject))
      .collect()

    const formatCounts: Record<string, number> = {}
    let claudeCount = 0
    let grokCount = 0
    let starredCount = 0

    for (const o of outputs) {
      formatCounts[o.formatType] = (formatCounts[o.formatType] ?? 0) + 1
      if (o.aiProvider === 'claude') claudeCount++
      else grokCount++
      if (o.starred) starredCount++
    }

    return {
      totalOutputs: outputs.length,
      claudeCount,
      grokCount,
      starredCount,
      formatCounts,
    }
  },
})

export const saveOutput = internalMutation({
  args: {
    projectId: v.id('projects'),
    userId: v.string(),
    formatType: v.string(),
    content: v.string(),
    aiProvider: v.union(v.literal('claude'), v.literal('grok')),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('outputs', args)
  },
})
