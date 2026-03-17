'use node'

import { internalAction } from './_generated/server'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import Anthropic from '@anthropic-ai/sdk'
import {
  buildPrompt,
  FORMATS,
  type FormatType,
} from './prompts'

// ─── AI Clients ───────────────────────────────────────────────────────────────

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

async function callClaude(prompt: string): Promise<string> {
  const client = getAnthropicClient()
  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })
  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text
}

async function callGrok(prompt: string): Promise<string> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-3',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    }),
  })
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Grok API error: ${error}`)
  }
  const data = await response.json()
  return data.choices[0].message.content as string
}

// ─── Main repurposing action ──────────────────────────────────────────────────

export const repurposeContent = internalAction({
  args: {
    projectId: v.id('projects'),
    userId: v.string(),
    sourceContent: v.string(),
    selectedFormats: v.array(v.string()),
  },
  handler: async (ctx, { projectId, userId, sourceContent, selectedFormats }) => {
    // Mark project as processing
    await ctx.runMutation(internal.projects.updateStatus, {
      projectId,
      status: 'processing',
    })

    // Fetch brand voice if user has it stored
    const brandVoice = await ctx.runQuery(internal.users.getBrandVoiceForUser, {
      userId,
    })

    const errors: string[] = []

    // Process each selected format (in parallel, batched 5 at a time)
    const formatDefs = FORMATS.filter((f) => selectedFormats.includes(f.id))

    // Process in batches to avoid rate limits
    const batchSize = 5
    for (let i = 0; i < formatDefs.length; i += batchSize) {
      const batch = formatDefs.slice(i, i + batchSize)
      await Promise.all(
        batch.map(async (format) => {
          try {
            const prompt = buildPrompt(
              format.id as FormatType,
              sourceContent,
              brandVoice ?? undefined,
            )
            const content =
              format.provider === 'claude'
                ? await callClaude(prompt)
                : await callGrok(prompt)

            await ctx.runMutation(internal.outputs.saveOutput, {
              projectId,
              userId,
              formatType: format.id,
              content,
              aiProvider: format.provider,
            })
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            errors.push(`${format.label}: ${msg}`)
            console.error(`Failed to generate ${format.id}:`, msg)
          }
        }),
      )
    }

    // Mark done (or error if all failed)
    const allFailed = errors.length === formatDefs.length
    await ctx.runMutation(internal.projects.updateStatus, {
      projectId,
      status: allFailed ? 'error' : 'done',
      ...(errors.length > 0
        ? { errorMessage: `Some formats failed: ${errors.join('; ')}` }
        : {}),
    })
  },
})
