'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FORMATS } from '@/convex/prompts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Zap, Clock, TrendingUp, Star } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

gsap.registerPlugin(ScrollTrigger)

const BEFORE_AFTER = [
  { before: '3,000-word podcast transcript', after: '8 output formats', time: '< 30 seconds' },
  { before: 'YouTube video transcript', after: 'Twitter thread + LinkedIn + Newsletter', time: '< 45 seconds' },
  { before: 'Blog post draft', after: 'Short-form scripts + Captions + Email', time: '< 30 seconds' },
]

const TESTIMONIALS = [
  { name: 'Alex Rivera', role: 'Marketing Consultant', quote: 'I used to spend 4 hours repurposing my podcast into social content. Now it takes under a minute. ContentForge is the tool I wish I had 3 years ago.', stars: 5 },
  { name: 'Jamie Chen', role: 'Creator & Educator', quote: 'The Twitter threads it generates are genuinely better than what I write myself. Grok just gets the platform.', stars: 5 },
  { name: 'Morgan Lee', role: 'Freelance Writer', quote: 'My clients pay me to repurpose their content. ContentForge does it in seconds, I add polish, everyone wins.', stars: 5 },
]

export default function LandingPage() {
  const { isSignedIn } = useAuth()
  const ctaHref = isSignedIn ? '/dashboard' : '/sign-up'
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from('.hero-content > *', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      })

      // Feature cards stagger on scroll
      gsap.from('.feature-card', {
        scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' },
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      })

      // Before/after rows
      gsap.from('.before-after-row', {
        scrollTrigger: { trigger: '.before-after-section', start: 'top 75%' },
        x: -40,
        opacity: 0,
        duration: 0.5,
        stagger: 0.12,
        ease: 'power2.out',
      })

      // Testimonials
      gsap.from('.testimonial-card', {
        scrollTrigger: { trigger: testimonialsRef.current, start: 'top 80%' },
        scale: 0.95,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Zap className="size-5 text-amber-500" />
            ContentForge
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button size="sm" className="bg-amber-500 text-white hover:bg-amber-600">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="bg-amber-500 text-white hover:bg-amber-600">
                    Get started free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="py-24 text-center">
        <div className="mx-auto max-w-4xl px-6">
          <div className="hero-content space-y-6">
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
              ✨ Powered by Claude & Grok
            </Badge>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              One piece of content.{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                10+ formats.
              </span>{' '}
              Seconds.
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              ContentForge turns your blog posts, podcast transcripts, and YouTube videos into
              Twitter threads, newsletters, LinkedIn posts, email sequences, and more — instantly.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href={ctaHref}>
                <Button size="lg" className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 px-8 text-white shadow-lg hover:opacity-90">
                  {isSignedIn ? 'Go to Dashboard' : 'Start repurposing free'}
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View pricing
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">No credit card required · 3 free runs/month</p>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y bg-muted/30 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-8 px-6 text-center">
          {[
            { value: '10+', label: 'Output formats' },
            { value: '< 60s', label: 'Average generation time' },
            { value: '4–8h', label: 'Saved per week' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-extrabold text-amber-500">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section ref={featuresRef} className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Everything a creator needs</h2>
            <p className="mt-2 text-muted-foreground">
              From raw content to polished, platform-ready posts in one click
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '🤖', title: 'Claude for quality', desc: 'Newsletters, email sequences, and long-form content crafted by Anthropic\'s Claude Opus.' },
              { icon: '⚡', title: 'Grok for virality', desc: 'Twitter/X threads and short-form scripts written with Grok\'s real-time platform context.' },
              { icon: '🎯', title: '10+ output formats', desc: 'Twitter threads, LinkedIn posts, newsletters, video scripts, Instagram captions, and more.' },
              { icon: '🔊', title: 'Brand Voice (Pro)', desc: 'Train ContentForge on your writing style. Every output sounds like you wrote it.' },
              { icon: '⚡', title: 'Real-time streaming', desc: 'Outputs appear one by one as they\'re generated. No waiting for a full batch.' },
              { icon: '📂', title: 'Full history', desc: 'Every project saved. Revisit and copy any output at any time.' },
            ].map((f) => (
              <Card key={f.title} className="feature-card">
                <CardContent className="pt-6">
                  <div className="mb-3 text-3xl">{f.icon}</div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── All formats ── */}
      <section className="border-y bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold">All output formats</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {FORMATS.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 rounded-lg border bg-background p-3 text-sm"
              >
                <span className="text-lg">{f.icon}</span>
                <div>
                  <div className="font-medium leading-tight">{f.label}</div>
                  <Badge variant="outline" className="mt-0.5 text-[10px] capitalize">
                    {f.tier}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section className="before-after-section py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold">See the difference</h2>
          <div className="space-y-4">
            {BEFORE_AFTER.map((item, i) => (
              <div key={i} className="before-after-row flex items-center gap-4 rounded-xl border p-5">
                <div className="flex-1 rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
                  <div className="text-xs font-semibold uppercase text-red-600 dark:text-red-400">Before</div>
                  <div className="mt-1 text-sm font-medium">{item.before}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    Hours of manual work
                  </div>
                </div>
                <ArrowRight className="size-5 shrink-0 text-amber-500" />
                <div className="flex-1 rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
                  <div className="text-xs font-semibold uppercase text-green-600 dark:text-green-400">After</div>
                  <div className="mt-1 text-sm font-medium">{item.after}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="size-3" />
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section ref={testimonialsRef} className="border-t py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold">Loved by creators</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="testimonial-card">
                <CardContent className="pt-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4 border-t pt-4">
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold">Stop wasting hours on repurposing</h2>
          <p className="mt-3 text-amber-100">
            Join creators using ContentForge to multiply their content reach without multiplying their workload.
          </p>
          <Link href={ctaHref}>
            <Button size="lg" className="mt-8 gap-2 bg-white text-orange-600 shadow-lg hover:bg-amber-50">
              {isSignedIn ? 'Go to Dashboard' : 'Start for free — 3 runs/month'}
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-bold">
            <Zap className="size-4 text-amber-500" />
            ContentForge
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href={isSignedIn ? '/dashboard' : '/sign-in'} className="hover:text-foreground">
              {isSignedIn ? 'Dashboard' : 'Sign in'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
