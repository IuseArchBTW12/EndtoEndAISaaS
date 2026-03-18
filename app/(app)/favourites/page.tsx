'use client'

import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { type Id } from '@/convex/_generated/dataModel'
import { FORMATS } from '@/convex/prompts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Star, Copy, Check, Search, Inbox } from 'lucide-react'
import type { ConvexOutput } from '@/lib/types'
import Link from 'next/link'

// ─── Single favourited output ─────────────────────────────────────────────────

function FavCard({ output }: { output: ConvexOutput }) {
  const [copied, setCopied] = useState(false)
  const toggleStar = useMutation(api.outputs.toggleStar)
  const format = FORMATS.find((f) => f.id === output.formatType)

  const copy = () => {
    navigator.clipboard.writeText(output.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const unstar = async () => {
    try {
      await toggleStar({ outputId: output._id as Id<'outputs'> })
      toast.success('Removed from Favourites')
    } catch {
      toast.error('Failed to remove')
    }
  }

  return (
    <Card className="group">
      <CardContent className="pt-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">{format?.icon}</span>
            <span className="truncate text-sm font-semibold">{format?.label ?? output.formatType}</span>
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {output.aiProvider === 'claude' ? '🤖 Claude' : '⚡ Grok'}
            </Badge>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button size="icon" variant="ghost" className="size-7" onClick={copy}>
              {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-yellow-500 hover:text-muted-foreground"
              onClick={unstar}
              title="Remove from Favourites"
            >
              <Star className="size-3.5 fill-yellow-400" />
            </Button>
          </div>
        </div>
        <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-xs leading-relaxed">
          {output.content}
        </pre>
        <p className="mt-2 text-right text-[10px] text-muted-foreground">
          {new Date(output._creationTime).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FavouritesPage() {
  const starred = useQuery(api.outputs.getStarred)
  const [search, setSearch] = useState('')

  const loading = starred === undefined

  const filtered = (starred ?? []).filter((o) => {
    if (!search) return true
    const fmt = FORMATS.find((f) => f.id === o.formatType)
    return (
      (fmt?.label ?? o.formatType).toLowerCase().includes(search.toLowerCase()) ||
      o.content.toLowerCase().includes(search.toLowerCase())
    )
  }) as ConvexOutput[]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Favourites</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Outputs you've starred — tap the ⭐ on any output card to save it here.
        </p>
      </div>

      {/* Search */}
      {(starred?.length ?? 0) > 0 && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search favourites…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <Skeleton className="mb-3 h-5 w-40" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && (starred?.length ?? 0) === 0 && (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
          <Star className="mb-4 size-12 text-muted-foreground/40" />
          <h2 className="text-lg font-semibold">No favourites yet</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Hit the star icon on any generated output to save it here for quick access.
          </p>
          <Link href="/dashboard">
            <Button className="mt-6" size="sm">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      )}

      {/* Filtered empty state */}
      {!loading && (starred?.length ?? 0) > 0 && filtered.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <Inbox className="mx-auto mb-3 size-8 opacity-30" />
          No favourites match your search.
        </div>
      )}

      {/* Results */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((output) => (
            <FavCard key={output._id} output={output} />
          ))}
        </div>
      )}
    </div>
  )
}
