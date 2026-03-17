import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLANS } from '@/lib/plans'
import { createCheckoutSession } from '@/app/actions/billing'
import { Check, Zap, Crown } from 'lucide-react'

const FREE_FEATURES = [
  '3 repurposing runs/month',
  'Twitter/X thread',
  'LinkedIn post',
  'Key takeaways',
  'Blog summary',
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Zap className="size-5 text-amber-500" />
            ContentForge
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-amber-500 text-white hover:bg-amber-600">
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Header ── */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Simple, creator-friendly pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Scale when you need to. No hidden fees, no per-seat charges.
          </p>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="pb-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 sm:grid-cols-3">
          {/* Free */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="text-lg font-bold">Free</div>
              <div className="mt-1 text-3xl font-extrabold">$0</div>
              <div className="text-sm text-muted-foreground">/month forever</div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/sign-up" className="w-full">
                <Button variant="outline" className="w-full">Get started free</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Starter */}
          <Card className="relative flex flex-col border-amber-400 shadow-lg shadow-amber-100 dark:shadow-amber-900/20">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-amber-500 text-white shadow-sm">Most popular</Badge>
            </div>
            <CardHeader className="pb-2">
              <div className="text-lg font-bold">{PLANS.starter.name}</div>
              <div className="mt-1 text-3xl font-extrabold">{PLANS.starter.price}</div>
              <div className="text-sm text-muted-foreground">{PLANS.starter.description}</div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2.5">
                {PLANS.starter.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <form
                action={createCheckoutSession.bind(null, 'starter')}
                className="w-full"
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90"
                >
                  Get Starter
                </Button>
              </form>
            </CardFooter>
          </Card>

          {/* Pro */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-lg font-bold">
                {PLANS.pro.name}
                <Crown className="size-4 text-amber-500" />
              </div>
              <div className="mt-1 text-3xl font-extrabold">{PLANS.pro.price}</div>
              <div className="text-sm text-muted-foreground">{PLANS.pro.description}</div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2.5">
                {PLANS.pro.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <form
                action={createCheckoutSession.bind(null, 'pro')}
                className="w-full"
              >
                <Button type="submit" variant="outline" className="w-full">
                  Get Pro
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-16 max-w-2xl px-6">
          <h2 className="mb-6 text-center text-xl font-bold">Common questions</h2>
          <div className="space-y-4 text-sm">
            {[
              { q: 'What counts as a "run"?', a: 'One run = processing one piece of source content, regardless of how many output formats you select.' },
              { q: 'Do unused runs roll over?', a: 'No. The counter resets every 30 days.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your account settings at any time. Access continues until the end of the billing period.' },
              { q: 'What AI models power ContentForge?', a: 'Claude (Anthropic) for quality long-form outputs and Grok (xAI) for platform-native short-form content like Twitter threads.' },
            ].map((item) => (
              <div key={item.q} className="rounded-lg border p-4">
                <p className="font-semibold">{item.q}</p>
                <p className="mt-1 text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
