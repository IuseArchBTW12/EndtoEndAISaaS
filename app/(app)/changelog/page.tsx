'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ChangelogEntry {
  version: string
  date: string
  title: string
  items: {
    type: 'new' | 'improvement' | 'fix'
    text: string
  }[]
}

const BADGE_CLS: Record<'new' | 'improvement' | 'fix', string> = {
  new: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  improvement: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  fix: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
}

const ENTRIES: ChangelogEntry[] = [
  {
    version: 'v2.0',
    date: 'March 2026',
    title: 'Tone Selector & Expanded Templates',
    items: [
      { type: 'new', text: 'Tone Selector — choose Professional, Conversational, Witty & Bold, or Educational before generating' },
      { type: 'new', text: 'Templates Library — 13 hand-crafted templates across Free, Starter, and Pro tiers' },
      { type: 'new', text: 'Paid template tiers — Starter and Pro unlock business, marketing, and creator templates' },
      { type: 'new', text: 'Changelog page — you are reading it right now!' },
      { type: 'improvement', text: 'Template cards show recommended formats and tier badge at a glance' },
      { type: 'improvement', text: 'Template page now reflects your real subscription tier for access gating' },
    ],
  },
  {
    version: 'v1.5',
    date: 'February 2026',
    title: 'Analytics, Favourites & Power Features',
    items: [
      { type: 'new', text: 'Analytics page — total projects, outputs, words generated, and most-used formats' },
      { type: 'new', text: 'Favourites — star any output and find it instantly later' },
      { type: 'new', text: 'Settings page — update your display name and notification preferences' },
      { type: 'new', text: 'URL Scraping — paste a URL and we pull the content for you automatically' },
      { type: 'new', text: 'Bulk Export — download all outputs from any project as a single Markdown file' },
      { type: 'improvement', text: 'History page shows output count per project' },
      { type: 'fix', text: 'Brand Voice prompt injection no longer duplicates in multi-format runs' },
    ],
  },
  {
    version: 'v1.0',
    date: 'January 2026',
    title: 'Initial Launch',
    items: [
      { type: 'new', text: 'Repurpose long-form content into 12+ formats simultaneously' },
      { type: 'new', text: 'Formats: Twitter Thread, LinkedIn Post, Newsletter, Blog Summary, Email Sequence, Instagram Caption, YouTube Script (Short & Long), Key Takeaways, Slide Deck, Video Script, Pinterest Description' },
      { type: 'new', text: 'Brand Voice (Pro) — define your tone and style; injected into every generation' },
      { type: 'new', text: 'History — browse all past projects and copy outputs' },
      { type: 'new', text: 'Free Templates library — 4 starter templates (Podcast Notes, YouTube Transcript, Blog Draft, Idea Brainstorm)' },
      { type: 'new', text: 'Clerk authentication — magic link & Google sign-in' },
      { type: 'new', text: 'Polar.sh subscriptions — Free, Starter, and Pro billing tiers' },
    ],
  },
]

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Changelog</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What&apos;s new in ContentForge — every release, every improvement.
        </p>
      </div>

      <div className="relative space-y-8 before:absolute before:left-[15px] before:top-0 before:h-full before:w-px before:bg-border">
        {ENTRIES.map((entry) => (
          <div key={entry.version} className="relative pl-10">
            <div className="absolute left-0 top-1 flex size-8 items-center justify-center rounded-full border bg-background text-[11px] font-bold text-muted-foreground">
              {entry.version}
            </div>
            <Card>
              <CardContent className="pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold">{entry.title}</h2>
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                </div>
                <ul className="space-y-2">
                  {entry.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Badge
                        variant="secondary"
                        className={cn('mt-0.5 shrink-0 text-[10px] capitalize', BADGE_CLS[item.type])}
                      >
                        {item.type}
                      </Badge>
                      <span className="text-muted-foreground">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
