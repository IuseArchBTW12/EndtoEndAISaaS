'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookOpen, Mic, Video, Mail, Lightbulb, FileText, Search, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Template definitions ─────────────────────────────────────────────────────

interface Template {
  id: string
  title: string
  category: string
  icon: React.ElementType
  description: string
  placeholder: string
  defaultContent: string
  recommendedFormats: string[]
  tier: 'free' | 'any'
  color: string
}

const TEMPLATES: Template[] = [
  {
    id: 'podcast_notes',
    title: 'Podcast Notes',
    category: 'Audio',
    icon: Mic,
    description: 'Raw notes or transcript from a podcast episode',
    placeholder: 'Paste your podcast show notes or rough transcript here…',
    defaultContent: `Episode: The Rise of AI in Small Business\n\nKey guest: Sara Chen, founder of AutomateHQ\n\nMain topics discussed:\n- How small businesses are adopting AI tools\n- The biggest mistakes founders make with automation\n- Sara's 3-step framework: Map → Test → Scale\n- Cost breakdown: DIY vs hiring an AI consultant\n- Top 3 tools Sara recommends for non-technical founders\n\nQuotes:\n"Most founders overthink AI. Start with the one task you hate doing the most."\n"We saved 40 hours a week just by automating our onboarding flow."\n\nAction items mentioned:\n- Try Make.com for workflow automation\n- Read "The Age of Surveillance Capitalism"\n- Join the AutomateHQ community for free templates`,
    recommendedFormats: ['twitter_thread', 'linkedin_post', 'newsletter', 'key_takeaways'],
    tier: 'free',
    color: 'text-purple-500',
  },
  {
    id: 'youtube_transcript',
    title: 'YouTube Transcript',
    category: 'Video',
    icon: Video,
    description: 'Auto-generated or cleaned-up transcript from a YouTube video',
    placeholder: 'Paste the auto-generated YouTube transcript here…',
    defaultContent: `[Transcript — "10 Productivity Habits That Changed My Life"]\n\nHey everyone, welcome back. Today I want to share the 10 productivity habits that completely transformed how I work.\n\nHabit 1: Time blocking. I dedicate 90-minute deep work sessions every morning before checking email.\n\nHabit 2: The 2-minute rule. If something takes less than 2 minutes, do it immediately instead of scheduling it.\n\nHabit 3: Weekly reviews. Every Sunday I spend 30 minutes reviewing what worked and what didn't.\n\nHabit 4: Single-tasking. Research shows multitasking reduces productivity by 40%. I focus on one thing at a time.\n\nHabit 5: Energy management over time management. I do creative work in the morning, admin in the afternoon.\n\n[continues for 5 more habits...]\n\nIf this helped you, subscribe and hit the bell icon. See you next week!`,
    recommendedFormats: ['twitter_thread', 'blog_summary', 'instagram_caption', 'key_takeaways'],
    tier: 'free',
    color: 'text-red-500',
  },
  {
    id: 'blog_draft',
    title: 'Blog Post Draft',
    category: 'Writing',
    icon: BookOpen,
    description: 'Long-form blog article that needs repurposing across platforms',
    placeholder: 'Paste your full blog post draft here…',
    defaultContent: `Title: Why Every Solopreneur Needs a Content System in 2026\n\nIntroduction:\nIf you're a solopreneur trying to grow your audience, you already know the feeling: endless hours spent creating content, only to watch it disappear into the void after 24 hours.\n\nThe problem isn't the quality of your content. It's the lack of a system.\n\nSection 1: The Content Treadmill\nMost creators are stuck on what I call the content treadmill — constantly producing new content without ever leveraging what they've already built. The average blog post takes 4-6 hours to write. A YouTube video? 8-12 hours including filming and editing. Yet most creators let that content die after the initial publish.\n\nSection 2: What a Content System Actually Looks Like\nA proper content system has three layers:\n1. Creation — your long-form anchor content (blog, podcast, video)\n2. Distribution — repurposed short-form for each platform\n3. Resurrection — bringing old content back to life every 90 days\n\nConclusion:\nYou don't need more content. You need a smarter system for the content you already have.`,
    recommendedFormats: ['twitter_thread', 'linkedin_post', 'newsletter', 'email_sequence'],
    tier: 'free',
    color: 'text-green-500',
  },
  {
    id: 'meeting_notes',
    title: 'Meeting / Workshop Notes',
    category: 'Business',
    icon: FileText,
    description: 'Notes from a client call, workshop, or team meeting',
    placeholder: 'Paste your meeting notes here…',
    defaultContent: `Meeting: Q1 Product Strategy — March 15, 2026\nAttendees: Alex (CEO), Jamie (Head of Product), Sam (Lead Dev)\n\nAgenda:\n1. Review Q4 performance metrics\n2. Define Q1 OKRs\n3. Prioritise roadmap for next 3 months\n\nKey discussion points:\n- DAU grew 34% in Q4, MAU up 28%\n- Churn rate needs attention: currently 8.2%, target is under 5%\n- Top user request: bulk export feature (mentioned by 47 users in support)\n- New competitor launched last week — pricing is 30% lower\n\nDecisions made:\n- Prioritise bulk export in Q1 sprint\n- Launch annual billing to improve churn\n- Alex to reach out to top 20 churned users for exit interviews\n\nNext steps:\n- Sam: scope bulk export feature by March 22\n- Jamie: draft updated pricing page by March 20\n- Alex: send user interview invites by March 17`,
    recommendedFormats: ['key_takeaways', 'linkedin_post', 'newsletter'],
    tier: 'free',
    color: 'text-blue-500',
  },
  {
    id: 'newsletter_issue',
    title: 'Newsletter Issue',
    category: 'Writing',
    icon: Mail,
    description: 'A sent newsletter that you want to repurpose for other platforms',
    placeholder: 'Paste your newsletter issue here…',
    defaultContent: `Subject: The One Habit That 10x'd My Revenue\n\nHey [First Name],\n\nI want to tell you about the single habit that changed my business.\n\nFor the first three years of running my agency, I was reactive. I'd wake up, check Slack, respond to emails, jump into client work. Sound familiar?\n\nThen I read a study that said CEOs who spent at least 20% of their time on business development grew 2.5x faster than those who didn't.\n\nSo I blocked every Tuesday morning — 9am to 12pm — for nothing but outreach, partnerships, and strategic thinking.\n\nWithin 6 months:\n• Revenue grew 40%\n• I landed 3 partnership deals\n• I had a waiting list for the first time\n\nThe lesson: your calendar is a mirror of your priorities. If revenue growth isn't on your calendar, it won't happen.\n\nThis week's challenge: block one 2-hour slot for business development. No clients, no admin. Just growth.\n\nUntil next week,\nAlex`,
    recommendedFormats: ['twitter_thread', 'linkedin_post', 'instagram_caption', 'video_script_short'],
    tier: 'free',
    color: 'text-amber-500',
  },
  {
    id: 'idea_brainstorm',
    title: 'Idea / Brainstorm Doc',
    category: 'Ideas',
    icon: Lightbulb,
    description: 'Raw ideas, thinking-out-loud notes, or a brain dump you want to turn into polished content',
    placeholder: 'Paste your raw ideas or brainstorm notes here…',
    defaultContent: `Idea: Why most "productivity advice" is actually counterproductive\n\nCore argument:\n- Productivity culture tells us to optimise everything\n- But humans are not machines\n- The obsession with efficiency creates anxiety, not output\n\nPoints to make:\n- "Hustle culture" leads to burnout (link studies)\n- The best work comes from rest, play, boredom\n- Cal Newport: "Deep work requires a commitment to boredom"\n- My personal experience: best ideas come in the shower, on walks\n- Rest is not the opposite of productivity, it's the foundation of it\n\nMy contrarian take:\n"Stop trying to be productive. Start trying to be effective. They're not the same thing."\n\nPotential angles:\n- "The Productivity Trap" — for LinkedIn\n- "I quit productivity culture for 30 days — here's what happened" — for blog\n- Thread: "7 productivity myths you still believe" — for Twitter\n\nCall to action: Share a time when doing LESS led to better results`,
    recommendedFormats: ['twitter_thread', 'linkedin_post', 'blog_summary', 'video_script_short'],
    tier: 'free',
    color: 'text-orange-500',
  },
]

const CATEGORIES = ['All', ...Array.from(new Set(TEMPLATES.map((t) => t.category)))]

// ─── Template card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onUse,
}: {
  template: Template
  onUse: (t: Template) => void
}) {
  return (
    <Card className="group flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex size-9 items-center justify-center rounded-lg bg-muted',
              template.color,
            )}
          >
            <template.icon className="size-5" />
          </div>
          <Badge variant="outline" className="text-xs">
            {template.category}
          </Badge>
        </div>
        <CardTitle className="mt-3 text-base">{template.title}</CardTitle>
        <CardDescription className="text-xs">{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="flex flex-wrap gap-1">
          {template.recommendedFormats.slice(0, 3).map((id) => (
            <Badge key={id} variant="secondary" className="text-[10px]">
              {id.replace(/_/g, ' ')}
            </Badge>
          ))}
          {template.recommendedFormats.length > 3 && (
            <Badge variant="secondary" className="text-[10px]">
              +{template.recommendedFormats.length - 3} more
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          className="w-full gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90"
          onClick={() => onUse(template)}
        >
          Use Template
          <ArrowRight className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = TEMPLATES.filter((t) => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleUse = (template: Template) => {
    // Pass template content via sessionStorage so the dashboard page can pre-fill it
    sessionStorage.setItem(
      'cf_template',
      JSON.stringify({
        content: template.defaultContent,
        formats: template.recommendedFormats,
        title: template.title,
      }),
    )
    router.push('/dashboard?template=1')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start with a real-world example — edit it, then hit Repurpose.
        </p>
      </div>

      {/* Search + category filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          No templates match your search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} onUse={handleUse} />
          ))}
        </div>
      )}
    </div>
  )
}
