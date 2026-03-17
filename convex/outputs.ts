import { internalMutation, query } from './_generated/server'
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
