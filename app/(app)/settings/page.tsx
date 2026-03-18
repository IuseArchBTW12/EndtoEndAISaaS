'use client'

import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { TIER_LIMITS } from '@/convex/prompts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  User,
  CreditCard,
  Zap,
  BrainCircuit,
  ShieldCheck,
  ExternalLink,
  Loader2,
  Crown,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useUser } from '@clerk/nextjs'

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user: clerkUser } = useUser()
  const convexUser = useQuery(api.users.getCurrentUser)
  const updateProfile = useMutation(api.users.updateProfile)

  const [displayName, setDisplayName] = useState('')
  const [nameSynced, setNameSynced] = useState(false)
  const [saving, setSaving] = useState(false)

  // Sync display name from Convex once
  if (!nameSynced && convexUser) {
    setDisplayName(convexUser.name ?? '')
    setNameSynced(true)
  }

  const tier = convexUser?.subscriptionTier ?? 'free'
  const runsUsed = convexUser?.runsUsedThisMonth ?? 0
  const runsLimit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS]
  const isUnlimited = runsLimit === Infinity
  const runsPct = isUnlimited ? 100 : Math.min(100, (runsUsed / runsLimit) * 100)
  const runsResetDate = convexUser?.runsResetAt
    ? new Date(convexUser.runsResetAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  const tierColors: Record<string, string> = {
    free: 'bg-muted text-muted-foreground',
    starter: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    pro: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  }

  const AIModels: Record<string, string[]> = {
    free: ['Claude (basic formats)', 'Grok (Twitter/Video)'],
    starter: ['Claude Opus', 'Grok 3', 'All 10 formats'],
    pro: ['Claude Opus — Brand Voice', 'Grok 3', 'Unlimited formats', 'Priority generation'],
  }

  const saveProfile = async () => {
    if (!displayName.trim()) return toast.error('Name cannot be empty.')
    setSaving(true)
    try {
      await updateProfile({ name: displayName.trim() })
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const loading = convexUser === undefined

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, subscription, and preferences
        </p>
      </div>

      {/* ── Profile ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4 text-blue-500" />
            Profile
          </CardTitle>
          <CardDescription>Your display name — shown in the app sidebar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {clerkUser?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clerkUser.imageUrl}
                alt="Avatar"
                className="size-14 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-full bg-muted text-lg font-bold">
                {displayName?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{convexUser?.email ?? clerkUser?.primaryEmailAddress?.emailAddress ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Avatar managed via Clerk</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            {loading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <div className="flex gap-2">
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="max-w-xs"
                />
                <Button
                  onClick={saveProfile}
                  disabled={saving || displayName.trim() === (convexUser?.name ?? '')}
                  size="sm"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            )}
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            To change your email or password, visit{' '}
            <a
              href="https://accounts.clerk.dev/user"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-primary underline"
            >
              Clerk Account Settings
              <ExternalLink className="size-3" />
            </a>
          </p>
        </CardContent>
      </Card>

      {/* ── Subscription ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="size-4 text-purple-500" />
            Subscription
          </CardTitle>
          <CardDescription>Your current plan and billing status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Badge className={cn('text-sm capitalize', tierColors[tier])} variant="secondary">
                  {tier === 'pro' && <Crown className="mr-1 size-3" />}
                  {tier} Plan
                </Badge>
                {tier !== 'free' && convexUser?.polarCustomerId && (
                  <span className="text-xs text-muted-foreground">
                    Customer ID: {convexUser.polarCustomerId.slice(0, 8)}…
                  </span>
                )}
              </div>

              {tier === 'free' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                  <p className="text-sm font-medium">Upgrade for more power</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Starter ($19/mo) or Pro ($49/mo) — unlock more runs, formats, and Brand Voice.
                  </p>
                  <Link href="/pricing">
                    <Button
                      size="sm"
                      className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90"
                    >
                      View Plans
                    </Button>
                  </Link>
                </div>
              )}

              {tier !== 'free' && (
                <p className="text-xs text-muted-foreground">
                  Manage your subscription on{' '}
                  <a
                    href="https://polar.sh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-primary underline"
                  >
                    Polar.sh
                    <ExternalLink className="size-3" />
                  </a>
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Usage ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="size-4 text-amber-500" />
            Usage
          </CardTitle>
          <CardDescription>Monthly run counter — resets every 30 days.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span>
                    {isUnlimited
                      ? `${runsUsed} runs used (unlimited)`
                      : `${runsUsed} of ${runsLimit} runs`}
                  </span>
                  <span className="text-muted-foreground">Resets {runsResetDate}</span>
                </div>
                <Progress
                  value={runsPct}
                  className={cn(
                    'h-2',
                    runsPct >= 90 && !isUnlimited && '[&>div]:bg-red-500',
                    runsPct >= 70 && runsPct < 90 && !isUnlimited && '[&>div]:bg-amber-500',
                    isUnlimited && '[&>div]:bg-green-500',
                  )}
                />
              </div>
              <Link href="/analytics">
                <Button variant="outline" size="sm" className="gap-1.5">
                  View full analytics
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── AI Models ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BrainCircuit className="size-4 text-blue-500" />
            AI Models on Your Plan
          </CardTitle>
          <CardDescription>Which models ContentForge uses for your requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <ul className="space-y-2">
              {AIModels[tier]?.map((model) => (
                <li key={model} className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="size-4 shrink-0 text-green-500" />
                  {model}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ── Danger zone ── */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          <CardDescription>Account deletion is permanent and irreversible.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-xs text-muted-foreground">
            To delete your account, please{' '}
            <a
              href="mailto:support@contentforge.app?subject=Delete my account"
              className="text-destructive underline"
            >
              contact support
            </a>
            . We'll permanently remove all your data within 7 days.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
