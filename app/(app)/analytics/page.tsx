'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { FORMATS, TIER_LIMITS } from '@/convex/prompts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart3,
  Zap,
  FileText,
  Star,
  TrendingUp,
  BrainCircuit,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'text-foreground',
  loading,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color?: string
  loading?: boolean
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 pt-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className={cn('size-5', color)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-7 w-16" />
          ) : (
            <p className="text-2xl font-bold leading-tight">{value}</p>
          )}
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Format bar ───────────────────────────────────────────────────────────────

function FormatBar({
  format,
  count,
  max,
}: {
  format: (typeof FORMATS)[number]
  count: number
  max: number
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-5 shrink-0 text-sm">{format.icon}</span>
      <span className="w-40 shrink-0 truncate text-sm">{format.label}</span>
      <div className="flex-1">
        <Progress value={pct} className="h-2" />
      </div>
      <span className="w-8 shrink-0 text-right text-sm font-medium tabular-nums">
        {count}
      </span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const user = useQuery(api.users.getCurrentUser)
  const projectStats = useQuery(api.projects.getStatsForCurrentUser)
  const outputStats = useQuery(api.outputs.getStatsForCurrentUser)

  const tier = user?.subscriptionTier ?? 'free'
  const runsUsed = user?.runsUsedThisMonth ?? 0
  const runsLimit = TIER_LIMITS[tier]
  const isUnlimited = runsLimit === Infinity
  const runsPct = isUnlimited ? 100 : Math.min(100, (runsUsed / runsLimit) * 100)
  const runsResetDate =
    user?.runsResetAt
      ? new Date(user.runsResetAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      : '—'

  const loading = user === undefined || projectStats === undefined || outputStats === undefined

  // Format distribution
  const formatCounts = outputStats?.formatCounts ?? {}
  const formatsWithCounts = FORMATS.map((f) => ({
    format: f,
    count: formatCounts[f.id] ?? 0,
  })).sort((a, b) => b.count - a.count)
  const maxFormatCount = Math.max(...formatsWithCounts.map((f) => f.count), 1)

  // AI provider split
  const totalOutputs = outputStats?.totalOutputs ?? 0
  const claudeCount = outputStats?.claudeCount ?? 0
  const grokCount = outputStats?.grokCount ?? 0
  const claudePct = totalOutputs > 0 ? Math.round((claudeCount / totalOutputs) * 100) : 50
  const grokPct = 100 - claudePct

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your content repurposing stats and usage overview
        </p>
      </div>

      {/* ── Top stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Total Projects"
          value={projectStats?.total ?? 0}
          sub={`${projectStats?.recentCount ?? 0} in last 30 days`}
          color="text-blue-500"
          loading={loading}
        />
        <StatCard
          icon={BarChart3}
          label="Outputs Generated"
          value={totalOutputs}
          sub={`${outputStats?.starredCount ?? 0} favourited`}
          color="text-purple-500"
          loading={loading}
        />
        <StatCard
          icon={Zap}
          label="Runs This Month"
          value={isUnlimited ? runsUsed : `${runsUsed} / ${runsLimit}`}
          sub={isUnlimited ? 'Unlimited (Pro)' : `Resets ${runsResetDate}`}
          color="text-amber-500"
          loading={loading}
        />
        <StatCard
          icon={Star}
          label="Starred Outputs"
          value={outputStats?.starredCount ?? 0}
          sub="Across all projects"
          color="text-yellow-500"
          loading={loading}
        />
      </div>

      {/* ── Run usage ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-amber-500" />
            Monthly Run Usage
            <Badge
              variant="secondary"
              className={cn(
                'ml-auto capitalize',
                tier === 'pro' && 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
                tier === 'starter' && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
              )}
            >
              {tier}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <Skeleton className="h-4 w-full" />
          ) : (
            <>
              <Progress
                value={runsPct}
                className={cn(
                  'h-3',
                  runsPct >= 90 && !isUnlimited && '[&>div]:bg-red-500',
                  runsPct >= 70 && runsPct < 90 && !isUnlimited && '[&>div]:bg-amber-500',
                )}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {isUnlimited
                    ? `${runsUsed} runs used (unlimited)`
                    : `${runsUsed} of ${runsLimit} runs used`}
                </span>
                <span>Resets {runsResetDate}</span>
              </div>
              {!isUnlimited && runsPct >= 80 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Running low!{' '}
                  <Link href="/pricing" className="font-semibold underline">
                    Upgrade
                  </Link>{' '}
                  for more runs.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Project status breakdown ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Project Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    label: 'Completed',
                    value: projectStats?.done ?? 0,
                    icon: CheckCircle2,
                    color: 'text-green-500',
                  },
                  {
                    label: 'Failed',
                    value: projectStats?.error ?? 0,
                    icon: XCircle,
                    color: 'text-red-500',
                  },
                  {
                    label: 'Processing',
                    value: (projectStats?.pending ?? 0) + (projectStats?.processing ?? 0),
                    icon: Zap,
                    color: 'text-blue-500',
                  },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm">
                      <Icon className={cn('size-4', color)} />
                      {label}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── AI Provider split ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BrainCircuit className="size-4 text-purple-500" />
              AI Provider Split
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : totalOutputs === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No outputs yet — generate some content first.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex overflow-hidden rounded-full">
                  <div
                    className="flex h-6 items-center justify-center bg-purple-500 text-[11px] font-semibold text-white"
                    style={{ width: `${claudePct}%` }}
                  >
                    {claudePct > 10 && `${claudePct}%`}
                  </div>
                  <div
                    className="flex h-6 items-center justify-center bg-amber-400 text-[11px] font-semibold text-white"
                    style={{ width: `${grokPct}%` }}
                  >
                    {grokPct > 10 && `${grokPct}%`}
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-sm bg-purple-500" />
                    Claude ({claudeCount})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-sm bg-amber-400" />
                    Grok ({grokCount})
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Format distribution ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Formats Generated</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : totalOutputs === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No outputs yet — start repurposing content on the{' '}
              <Link href="/dashboard" className="text-primary underline">
                Dashboard
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-3">
              {formatsWithCounts
                .filter((f) => f.count > 0)
                .map(({ format, count }) => (
                  <FormatBar
                    key={format.id}
                    format={format}
                    count={count}
                    max={maxFormatCount}
                  />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
