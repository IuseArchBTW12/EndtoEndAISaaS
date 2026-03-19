'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BookOpen, Mic, Video, Mail, Lightbulb, FileText,
  Search, ArrowRight, Lock, ShoppingBag, Briefcase,
  GraduationCap, TrendingUp, Megaphone, Code2, Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type TemplateTier = 'free' | 'starter' | 'pro'

interface Template {
  id: string
  title: string
  category: string
  icon: string // lucide identifier stored as string; rendered via map
  description: string
  defaultContent: string
  recommendedFormats: string[]
  tier: TemplateTier
  color: string
  badge?: string
}

const TEMPLATES: Template[] = [
  {
    id: 'podcast_notes', title: 'Podcast Notes', category: 'Audio', icon: 'Mic',
    description: 'Raw notes or transcript from a podcast episode',
    defaultContent: "Episode: The Rise of AI in Small Business\n\nKey guest: Sara Chen, founder of AutomateHQ\n\nTopics:\n- How small businesses are adopting AI tools\n- Sara\u2019s 3-step framework: Map \u2192 Test \u2192 Scale\n- Top 3 tools Sara recommends for non-technical founders\n\nQuotes:\n\"Most founders overthink AI. Start with the one task you hate doing the most.\"\n\"We saved 40 hours a week just by automating our onboarding flow.\"\n\nAction items:\n- Try Make.com for workflow automation\n- Join the AutomateHQ community for free templates",
    recommendedFormats: ['twitter_thread', 'linkedin_post', 'newsletter', 'key_takeaways'],
    tier: 'free', color: 'text-purple-500', badge: 'Popular',
  },
  {
    id: 'youtube_transcript', title: 'YouTube Transcript', category: 'Video', icon: 'Video',
    description: 'Auto-generated or cleaned-up YouTube video transcript',
    defaultContent: "[Transcript \u2014 \"10 Productivity Habits That Changed My Life\"]\n\nHabit 1: Time blocking. 90-minute deep work sessions every morning before email.\nHabit 2: The 2-minute rule. If it takes less than 2 minutes, do it immediately.\nHabit 3: Weekly reviews. Every Sunday \u2014 30 minutes, what worked and what didn't.\nHabit 4: Single-tasking. Multitasking reduces productivity 40%. One thing at a time.\nHabit 5: Energy management over time management. Creative work mornings, admin afternoons.\n\nIf this helped, subscribe and hit the bell icon. See you next week!",
    recommendedFormats: ['twitter_thread', 'blog_summary', 'instagram_caption', 'key_takeaways'],
    tier: 'free', color: 'text-red-500', badge: 'Popular',
  },
  {
    id: 'blog_draft', title: 'Blog Post Draft', category: 'Writing', icon: 'BookOpen',
    description: 'Long-form blog article to repurpose across all platforms',
    defaultContent: "Title: Why Every Solopreneur Needs a Content System in 2026\n\nIntro:\nEndless hours spent creating content, only to watch it disappear after 24 hours. The problem isn\u2019t quality \u2014 it\u2019s the lack of a system.\n\nSection 1: The Content Treadmill\nMost creators constantly produce new content without leveraging what they\u2019ve already built. The average blog post takes 4-6 hours. Yet most creators let it die after publishing.\n\nSection 2: What a Content System Looks Like\n1. Creation \u2014 long-form anchor content (blog, podcast, video)\n2. Distribution \u2014 repurposed short-form for each platform\n3. Resurrection \u2014 bringing old content back every 90 days\n\nConclusion:\nYou don\u2019t need more content. You need a smarter system.",
    recommendedFormats: ['twitter_thread', 'linkedin_post', 'newsletter', 'email_sequence'],
    tier: 'free', color: 'text-green-500',
  },
  {
    id: 'idea_brainstorm', title: 'Idea / Brainstorm Doc', category: 'Ideas', icon: 'Lightbulb',
    description: 'Raw ideas or a brain dump to turn into polished content',
    defaultContent: "Idea: Why most productivity advice is counterproductive\n\nCore argument:\n- Productivity culture tells us to optimise everything\n- But humans are not machines\n- The obsession with efficiency creates anxiety, not output\n\nPoints:\n- Hustle culture leads to burnout\n- Best work comes from rest, play, boredom\n- Cal Newport: \"Deep work requires a commitment to boredom\"\n\nContrarian take:\n\"Stop trying to be productive. Start trying to be effective.\"\n\nCTA: Share a time when doing LESS led to better results",
    recommendedFormats: ['twitter_thread', 'linkedin_post', 'blog_summary', 'video_script_short'],
    tier: 'free', color: 'text-orange-500',
  },
  {
    id: 'meeting_notes', title: 'Meeting / Workshop Notes', category: 'Business', icon: 'FileText',
    description: 'Turn client calls or workshop notes into shareable content',
    defaultContent: "Meeting: Q1 Product Strategy \u2014 March 15, 2026\nAttendees: Alex (CEO), Jamie (Product), Sam (Dev)\n\nKey discussion:\n- DAU grew 34% in Q4, MAU up 28%\n- Churn rate: 8.2%, target under 5%\n- Top user request: bulk export (mentioned by 47 users)\n- New competitor launched \u2014 pricing 30% lower\n\nDecisions:\n- Prioritise bulk export in Q1\n- Launch annual billing to improve churn\n- Alex: exit interviews with top 20 churned users\n\nNext steps:\n- Sam: scope bulk export by March 22\n- Jamie: updated pricing page by March 20",
    recommendedFormats: ['key_takeaways', 'linkedin_post', 'newsletter'],
    tier: 'starter', color: 'text-blue-500', badge: 'New',
  },
  {
    id: 'newsletter_issue', title: 'Newsletter Issue', category: 'Writing', icon: 'Mail',
    description: 'Repurpose a sent newsletter across all social channels',
    defaultContent: "Subject: The One Habit That 10x\u2019d My Revenue\n\nHey [First Name],\n\nFor the first three years of running my agency, I was reactive. I\u2019d wake up, check Slack, respond to emails, jump into client work.\n\nThen I read a study: CEOs who spent 20%+ of their time on business development grew 2.5x faster.\n\nSo I blocked every Tuesday morning, 9am\u201312pm, for outreach, partnerships, and strategic thinking.\n\nWithin 6 months:\n\u2022 Revenue grew 40%\n\u2022 I landed 3 partnership deals\n\u2022 I had a waiting list for the first time\n\nThe lesson: your calendar is a mirror of your priorities.\n\nUntil next week, Alex",
    recommendedFormats: ['twitter_thread', 'linkedin_post', 'instagram_caption', 'video_script_short'],
    tier: 'starter', color: 'text-amber-500',
  },
  {
    id: 'product_launch', title: 'Product Launch Announcement', category: 'Marketing', icon: 'Megaphone',
    description: 'Turn a product launch brief into a full cross-platform campaign',
    defaultContent: "Product: ContentForge v2.0\nLaunch: April 1, 2026\n\nWhat\u2019s new:\n- Tone selector: Professional, Conversational, Witty, or Educational\n- 14 output formats (added YouTube Script Long + Thread Variations)\n- Templates library: 14 hand-crafted templates\n- Favourites: star your best outputs\n- Bulk export: download all outputs as Markdown\n\nKey stat: Beta testers saved an average of 6 hours/week on content repurposing.\n\nTestimonial: \"I used to spend my entire Sunday repurposing one video. Now I do it in 90 seconds.\" \u2014 Jamie, educational YouTuber\n\nAvailability: All plans",
    recommendedFormats: ['twitter_thread', 'linkedin_post', 'email_sequence', 'instagram_caption', 'newsletter'],
    tier: 'starter', color: 'text-pink-500', badge: 'New',
  },
  {
    id: 'case_study', title: 'Client Case Study', category: 'Business', icon: 'TrendingUp',
    description: 'Convert a client win into social proof content across every channel',
    defaultContent: "Client: GreenLeaf E-commerce\nIndustry: Sustainable Fashion\nTimeline: 90 days\n\nChallenge:\n- Email open rates below 15%\n- Instagram at 400 followers with <1% engagement\n- No content strategy or consistency\n\nWhat we did:\n1. Developed a brand voice guide (warm, mission-driven, educational)\n2. 3x weekly content across Instagram and LinkedIn\n3. Rebuilt email sequences with storytelling-first approach\n4. Created a 12-episode \"Sustainable Style\" podcast\n\nResults after 90 days:\n- Email open rate: 15% \u2192 38%\n- Instagram: 400 \u2192 12,400 followers\n- Monthly revenue: +67%\n- Podcast: #3 in sustainability on Spotify\n\nClient quote: \"We finally feel like a brand, not just a store.\"",
    recommendedFormats: ['linkedin_post', 'twitter_thread', 'newsletter', 'blog_summary', 'instagram_caption'],
    tier: 'starter', color: 'text-emerald-500',
  },
  {
    id: 'online_course', title: 'Online Course Module', category: 'Education', icon: 'GraduationCap',
    description: 'Turn a course lesson into a week of content across every platform',
    defaultContent: "Course: The Creator Business Blueprint\nModule 3: Building Your Monetisation Stack\n\nLesson 3.2 \u2014 The 4 Revenue Streams Every Creator Needs\n\nSTREAM 1: Digital Products ($0 \u2192 $10K+)\nEbooks, templates, presets. Low effort, passive once live.\n\nSTREAM 2: Cohort Courses ($3K\u2013$50K launches)\nLive, community-driven. Requires engaged audience of 5K+.\n\nSTREAM 3: Consulting/Services ($2K\u2013$10K/mo)\nFastest path to revenue. Leverage expertise directly.\n\nSTREAM 4: Memberships ($29\u2013$99/mo per member)\nMost reliable recurring revenue. Requires consistent value delivery.\n\nKey exercise: Write down your current monthly revenue from each stream. Where\u2019s the gap?",
    recommendedFormats: ['linkedin_post', 'twitter_thread', 'newsletter', 'video_script_long', 'instagram_caption', 'email_sequence'],
    tier: 'pro', color: 'text-violet-500', badge: 'Pro',
  },
  {
    id: 'saas_feature', title: 'SaaS Feature Announcement', category: 'Tech', icon: 'Code2',
    description: 'Ship a feature? Turn your changelog into a full marketing campaign',
    defaultContent: "Feature: AI Tone Selector\nProduct: ContentForge\nShipped: March 19, 2026\n\nWhat it does:\nUsers choose from 4 writing tones before generating:\n- Professional: formal, data-driven, for B2B\n- Conversational: warm and personal, like texting a friend\n- Witty & Bold: punchy, scroll-stopping\n- Educational: clear and structured for tutorials\n\nWhy we built it:\nUsers were re-generating the same content 2-3x trying to get tone right. Now they choose upfront and get it right first time.\n\nUser feedback:\n\"The witty tone for Twitter is INSANE. First thread got 4,200 impressions.\" \u2014 @devmarketer\n\"Finally my LinkedIn posts don\u2019t sound robotic.\" \u2014 @sarahcreates",
    recommendedFormats: ['twitter_thread', 'linkedin_post', 'newsletter', 'blog_summary', 'email_sequence'],
    tier: 'pro', color: 'text-sky-500', badge: 'New',
  },
  {
    id: 'ecommerce_product', title: 'E-commerce Product Launch', category: 'Marketing', icon: 'ShoppingBag',
    description: 'Launch a new product with a full cross-platform content blitz',
    defaultContent: "Product: The Minimal Desk Mat Pro\nBrand: NoiseDesk\nLaunch: April 5, 2026\nPrice: $79 (intro: $59 for first 500)\n\nKey differentiators:\n1. Completely silent \u2014 merino absorbs keystroke noise\n2. Temperature-regulating material\n3. 100% plastic-free packaging\n4. Lifetime warranty\n\nTarget: Remote workers and creators, ages 25-40, willing to pay premium for quality.\n\nSocial proof:\n- 400+ beta customers, 4.9/5 rating\n- Featured in \"Best WFH Setups\" by Notion Tips newsletter (120K subscribers)\n\nUrgency: First batch limited to 500 units. Restock 8-10 weeks.",
    recommendedFormats: ['instagram_caption', 'twitter_thread', 'email_sequence', 'newsletter', 'video_script_short'],
    tier: 'pro', color: 'text-rose-500',
  },
  {
    id: 'personal_story', title: 'Personal Story / Life Update', category: 'Personal Brand', icon: 'Heart',
    description: 'Turn a personal milestone or story into authentic audience content',
    defaultContent: "My story: Leaving my $180K job to build in public\n\nThe moment I knew:\nFour back-to-back meetings on a Tuesday. I hadn\u2019t written a single line of code that week. I was supposedly a \"senior engineer\" but I\u2019d become a professional meeting-attender.\n\nThe fear: Mortgage. 6-month-old daughter. No product, no audience, no safety net.\n\nWhat I did: Gave 3 months notice. Spent evenings building ContentForge while still employed. By quit day: 200 beta users, $800 MRR.\n\nMonth 1 after quitting:\n- Launched publicly\n- Featured in newsletter with 80K subscribers\n- Grew to $3,200 MRR\n\nWhat I wish I\u2019d known: You don\u2019t need to quit to start. You need to start before you\u2019re ready.",
    recommendedFormats: ['linkedin_post', 'twitter_thread', 'newsletter', 'instagram_caption', 'video_script_short'],
    tier: 'pro', color: 'text-pink-500', badge: 'Popular',
  },
  {
    id: 'consulting_proposal', title: 'Consulting / Freelance Proposal', category: 'Business', icon: 'Briefcase',
    description: 'Turn a client proposal into authoritative thought leadership content',
    defaultContent: "Proposal: Content Strategy Overhaul\nClient: Meridian Wealth Advisors\n\nCurrent state:\n- Website: 340 monthly visitors, 78% bounce rate\n- LinkedIn: 890 followers, 0.3% engagement\n- No email nurture sequence for leads\n\nProposed strategy:\n\nPhase 1 (Month 1-2): Foundation\n- Brand voice document + content pillars\n- SEO audit + 12 target keywords\n\nPhase 2 (Month 3-4): Content Engine\n- 2x LinkedIn posts/week\n- Weekly newsletter to existing client base\n- 4 long-form articles targeting \"wealth planning under 45\"\n\nPhase 3 (Month 5-6): Amplification\n- YouTube channel launch (6 videos)\n- Podcast guest outreach (10 appearances)\n\nInvestment: $4,500/month\nExpected: 3x website traffic, 5x LinkedIn reach, 15+ qualified inbound leads/month",
    recommendedFormats: ['linkedin_post', 'newsletter', 'blog_summary', 'key_takeaways', 'email_sequence'],
    tier: 'pro', color: 'text-indigo-500', badge: 'New',
  },
]

const ICON_MAP: Record<string, string> = {
  Mic: 'Mic', Video: 'Video', BookOpen: 'BookOpen', Lightbulb: 'Lightbulb',
  FileText: 'FileText', Mail: 'Mail', Megaphone: 'Megaphone', TrendingUp: 'TrendingUp',
  GraduationCap: 'GraduationCap', Code2: 'Code2', ShoppingBag: 'ShoppingBag',
  Heart: 'Heart', Briefcase: 'Briefcase',
}
void ICON_MAP

const CATEGORIES = ['All', ...Array.from(new Set(TEMPLATES.map((t) => t.category)))]

const TIER_BADGE: Record<TemplateTier, { label: string; cls: string }> = {
  free:    { label: 'Free',    cls: 'bg-muted text-muted-foreground' },
  starter: { label: 'Starter', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  pro:     { label: 'Pro',     cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
}

const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Mic, Video, BookOpen, Lightbulb, FileText, Mail, Megaphone,
  TrendingUp, GraduationCap, Code2, ShoppingBag, Heart, Briefcase,
}

function canUse(templateTier: TemplateTier, userTier: string): boolean {
  if (templateTier === 'free') return true
  if (templateTier === 'starter') return userTier === 'starter' || userTier === 'pro'
  return userTier === 'pro'
}

function TemplateCard({
  template, userTier, onUse,
}: {
  template: Template
  userTier: string
  onUse: (t: Template) => void
}) {
  const unlocked = canUse(template.tier, userTier)
  const tierInfo = TIER_BADGE[template.tier]
  const IconComp = ICON_COMPONENTS[template.icon] ?? FileText

  return (
    <Card className={cn('group flex flex-col transition-shadow', unlocked ? 'hover:shadow-md' : 'opacity-75')}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className={cn('flex size-9 items-center justify-center rounded-lg bg-muted', unlocked ? template.color : 'text-muted-foreground')}>
            {unlocked ? <IconComp className="size-5" /> : <Lock className="size-4" />}
          </div>
          <div className="flex items-center gap-1.5">
            {template.badge && (
              <Badge variant="secondary" className="text-[10px]">{template.badge}</Badge>
            )}
            <Badge className={cn('text-[10px]', tierInfo.cls)} variant="secondary">
              {tierInfo.label}
            </Badge>
          </div>
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
        {unlocked ? (
          <Button
            size="sm"
            className="w-full gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90"
            onClick={() => onUse(template)}
          >
            Use Template <ArrowRight className="size-3.5" />
          </Button>
        ) : (
          <Link href="/pricing">
            <Button size="sm" variant="outline" className="w-full gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300">
              <Lock className="size-3.5" />
              Unlock — {template.tier === 'starter' ? 'Starter $19/mo' : 'Pro $49/mo'}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

export default function TemplatesPage() {
  const router = useRouter()
  const user = useQuery(api.users.getCurrentUser)
  const userTier = user?.subscriptionTier ?? 'free'

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [showLocked, setShowLocked] = useState(true)

  const filtered = TEMPLATES.filter((t) => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory
    const matchSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    const matchLocked = showLocked || canUse(t.tier, userTier)
    return matchCat && matchSearch && matchLocked
  })

  const unlockedCount = TEMPLATES.filter((t) => canUse(t.tier, userTier)).length

  const handleUse = (template: Template) => {
    sessionStorage.setItem('cf_template', JSON.stringify({
      content: template.defaultContent,
      formats: template.recommendedFormats,
      title: template.title,
    }))
    router.push('/dashboard?template=1')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start with a real-world example \u2014 edit it, then hit Repurpose.
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{unlockedCount}</span> / {TEMPLATES.length} unlocked
          {userTier === 'free' && (
            <div className="mt-1">
              <Link href="/pricing" className="text-xs text-amber-600 underline dark:text-amber-400">
                Upgrade to unlock all \u2192
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search templates\u2026" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button key={cat} variant={activeCategory === cat ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory(cat)}>
              {cat}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setShowLocked((p) => !p)}>
          {showLocked ? 'Hide locked' : 'Show all'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {(Object.entries(TIER_BADGE) as [TemplateTier, { label: string; cls: string }][]).map(([tier, info]) => (
          <span key={tier} className="flex items-center gap-1.5">
            <Badge className={cn('text-[10px]', info.cls)} variant="secondary">{info.label}</Badge>
            {tier === 'free' && '\u2014 all plans'}
            {tier === 'starter' && '\u2014 Starter or Pro'}
            {tier === 'pro' && '\u2014 Pro only'}
          </span>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">No templates match your search.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} userTier={userTier} onUse={handleUse} />
          ))}
        </div>
      )}
    </div>
  )
}
