import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'
import { Webhook } from 'svix'

const http = httpRouter()

// ─── Clerk user sync webhook ──────────────────────────────────────────────────
// Register this URL in Clerk Dashboard → Webhooks:
//   https://<your-deployment>.convex.site/clerk-users-webhook
// Events: user.created, user.updated, user.deleted

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text()
    const svixHeaders = {
      'svix-id': request.headers.get('svix-id') ?? '',
      'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
      'svix-signature': request.headers.get('svix-signature') ?? '',
    }

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
    let event: { type: string; data: Record<string, unknown> }

    try {
      event = wh.verify(payloadString, svixHeaders) as typeof event
    } catch (err) {
      console.error('Clerk webhook verification failed:', err)
      return new Response('Webhook verification failed', { status: 400 })
    }

    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        })
        break
      case 'user.deleted':
        await ctx.runMutation(internal.users.deleteFromClerk, {
          clerkUserId: event.data.id as string,
        })
        break
      default:
        console.log(`Unhandled Clerk event: ${event.type}`)
    }

    return new Response(null, { status: 200 })
  }),
})

export default http
