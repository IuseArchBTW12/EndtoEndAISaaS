import { Checkout } from '@polar-sh/nextjs'

// This route handler reads ?productId=<id> from the URL and redirects
// to Polar's hosted checkout. The successUrl includes the checkout ID.
// Usage: <a href="/checkout?productId=YOUR_PRODUCT_ID">Upgrade</a>

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/dashboard?checkout=success&checkout_id={CHECKOUT_ID}`,
  server: (process.env.POLAR_SERVER as 'sandbox' | 'production') ?? 'sandbox',
})
