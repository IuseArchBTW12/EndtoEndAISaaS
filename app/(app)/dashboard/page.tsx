'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { type Id } from '@/convex/_generated/dataModel'
import { FORMATS } from '@/convex/prompts'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Zap, Copy, Check, AlertCircle, Loader2, Sparkles, Star, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConvexOutput } from '@/lib/types'
import { useSearchParams } from 'next/navigation'

// ─── Format selector ──────────────────────────────────────────────────────────

function FormatCheckbox({
  format,
  checked,
  disabled,
  onChange,
}: {
  format: (typeof FORMATS)[number]
  checked: boolean
  disabled: boolean
  onChange: (id: string, checked: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(format.id, !checked)}
      className={cn(
        'flex items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all',
        checked
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border hover:border-primary/50',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <span className="mt-0.5 text-base">{format.icon}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">{format.label}</span>
          {format.tier !== 'free' && (
            <Badge variant="secondary" className="text-[10px] capitalize">
              {format.tier}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {format.description}
        </p>
      </div>
    </button>
  )
}

// ─── Single output card ───────────────────────────────────────────────────────

function OutputCard({ output }: { output: ConvexOutput }) {
  const [copied, setCopied] = useState(false)
  const [starred, setStarred] = useState(output.starred ?? false)
  const toggleStar = useMutation(api.outputs.toggleStar)
  const format = FORMATS.find((f) => f.id === output.formatType)

  const copy = () => {
    navigator.clipboard.writeText(output.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStar = async () => {
    try {
      const next = await toggleStar({ outputId: output._id as Id<'outputs'> })
      setStarred(next)
      toast.success(next ? 'Added to Favourites' : 'Removed from Favourites')
    } catch {
      toast.error('Failed to update favourite')
    }
  }

  return (
    <Card className="group relative">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <span>{format?.icon}</span>
          {format?.label ?? output.formatType}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px]">
            {output.aiProvider === 'claude' ? '🤖 Claude' : '⚡ Grok'}
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'size-7 transition-all',
              starred ? 'text-yellow-500' : 'opacity-0 group-hover:opacity-100',
            )}
            onClick={handleStar}
            title={starred ? 'Remove from Favourites' : 'Add to Favourites'}
          >
            <Star className={cn('size-3.5', starred && 'fill-yellow-400')} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={copy}
          >
            {copied ? (
              <Check className="size-3.5 text-green-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-xs leading-relaxed">
          {output.content}
        </pre>
      </CardContent>
    </Card>
  )
}

// ─── Main dashboard page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = useQuery(api.users.getCurrentUser)
  const createProject = useMutation(api.projects.createProject)
  const searchParams = useSearchParams()

  const [sourceContent, setSourceContent] = useState('')
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['twitter_thread', 'linkedin_post', 'key_takeaways'])
  const [activeProjectId, setActiveProjectId] = useState<Id<'projects'> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inputTab, setInputTab] = useState<'text' | 'url'>('text')
  const [urlInput, setUrlInput] = useState('')
  const [isScraping, setIsScraping] = useState(false)

  // Load template from sessionStorage if redirected from Templates page
  useEffect(() => {
    if (searchParams.get('template') === '1') {
      const raw = sessionStorage.getItem('cf_template')
      if (raw) {
        try {
          const tpl = JSON.parse(raw) as { content: string; formats: string[]; title: string }
          setSourceContent(tpl.content)
          setSelectedFormats(tpl.formats)
          sessionStorage.removeItem('cf_template')
          toast.success(`Template "${tpl.title}" loaded — edit it then hit Repurpose!`)
        } catch { /* ignore */ }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchFromUrl = async () => {
    if (!urlInput.trim()) return toast.error('Enter a URL first.')
    setIsScraping(true)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      })
      const data = await res.json() as { text?: string; title?: string; error?: string; charCount?: number }
      if (!res.ok || data.error) throw new Error(data.error ?? 'Scrape failed')
      setSourceContent(data.text ?? '')
      setInputTab('text')
      toast.success(`Fetched ${(data.charCount ?? 0).toLocaleString()} chars from "${data.title ?? urlInput}"`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch URL')
    } finally {
      setIsScraping(false)
    }
  }

  // Real-time: get current project status
  const activeProject = useQuery(
    api.projects.getById,
    activeProjectId ? { projectId: activeProjectId } : 'skip',
  )
  // Real-time: outputs stream in as they are saved
  const outputs = useQuery(
    api.outputs.getForProject,
    activeProjectId ? { projectId: activeProjectId } : 'skip',
  )

  // Show completion toast
  useEffect(() => {
    if (activeProject?.status === 'done') {
      toast.success(`${outputs?.length ?? 0} formats generated!`)
    }
    if (activeProject?.status === 'error' && activeProject.errorMessage) {
      toast.error(activeProject.errorMessage)
    }
  }, [activeProject?.status, activeProject?.errorMessage, outputs?.length])

  const toggleFormat = (id: string, checked: boolean) => {
    setSelectedFormats((prev) =>
      checked ? [...prev, id] : prev.filter((f) => f !== id),
    )
  }

  const handleSubmit = async () => {
    if (!sourceContent.trim()) return toast.error('Paste your source content first.')
    if (selectedFormats.length === 0) return toast.error('Select at least one format.')

    setIsSubmitting(true)
    try {
      const projectId = await createProject({
        title: sourceContent.slice(0, 80) + (sourceContent.length > 80 ? '…' : ''),
        sourceType: 'text',
        sourceContent,
        selectedFormats,
      })
      setActiveProjectId(projectId)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const tier = user?.subscriptionTier ?? 'free'
  const isFormatAvailable = (format: (typeof FORMATS)[number]) => {
    if (format.tier === 'free') return true
    if (format.tier === 'starter') return tier === 'starter' || tier === 'pro'
    if (format.tier === 'pro') return tier === 'pro'
    return false
  }

  const isProcessing = activeProject?.status === 'pending' || activeProject?.status === 'processing'

  // Run counter info
  const runsUsed = user?.runsUsedThisMonth ?? 0
  const runsLimit = tier === 'free' ? 3 : tier === 'starter' ? 30 : null
  const runsLabel = runsLimit !== null ? `${runsUsed} / ${runsLimit} runs used` : 'Unlimited runs'

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Repurpose Content</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste your content → select formats → hit Repurpose
          </p>
        </div>
        <Badge variant={runsLimit !== null && runsUsed >= runsLimit ? 'destructive' : 'secondary'}>
          <Zap className="mr-1 size-3" />
          {runsLabel}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Left panel: Input ── */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Source Content</CardTitle>
                <div className="flex gap-1 rounded-lg border p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setInputTab('text')}
                    className={cn(
                      'rounded-md px-3 py-1 transition-colors',
                      inputTab === 'text' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Paste Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputTab('url')}
                    className={cn(
                      'flex items-center gap-1 rounded-md px-3 py-1 transition-colors',
                      inputTab === 'url' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Link2 className="size-3" />
                    URL
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {inputTab === 'url' ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://yourblog.com/post-title"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchFromUrl()}
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchFromUrl}
                      disabled={isScraping}
                      className="shrink-0"
                    >
                      {isScraping ? <Loader2 className="size-4 animate-spin" /> : 'Fetch'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste a URL to a blog post, article, or web page — we'll extract the text automatically.
                  </p>
                  {sourceContent && (
                    <div className="rounded-md bg-green-500/10 px-3 py-2 text-xs text-green-700 dark:text-green-400">
                      ✓ Content fetched ({sourceContent.length.toLocaleString()} chars) — switch to Paste Text to review or edit it.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Textarea
                    placeholder="Paste your blog post, YouTube transcript, podcast notes, or any long-form content here…"
                    className="min-h-[200px] resize-none font-mono text-sm"
                    value={sourceContent}
                    onChange={(e) => setSourceContent(e.target.value)}
                  />
                  <p className="mt-2 text-right text-xs text-muted-foreground">
                    {sourceContent.length.toLocaleString()} characters
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Output Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 xl:grid-cols-2">
                {FORMATS.map((format) => (
                  <FormatCheckbox
                    key={format.id}
                    format={format}
                    checked={selectedFormats.includes(format.id)}
                    disabled={!isFormatAvailable(format)}
                    onChange={toggleFormat}
                  />
                ))}
              </div>
              {tier !== 'pro' && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  <a href="/pricing" className="text-amber-600 underline hover:text-amber-700">
                    Upgrade
                  </a>{' '}
                  to unlock all formats
                </p>
              )}
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600"
            onClick={handleSubmit}
            disabled={isSubmitting || isProcessing}
          >
            {isSubmitting || isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {activeProject?.status === 'pending' ? 'Queuing…' : 'Generating…'}
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Repurpose Content ({selectedFormats.length} format
                {selectedFormats.length !== 1 ? 's' : ''})
              </>
            )}
          </Button>
        </div>

        {/* ── Right panel: Outputs ── */}
        <div className="space-y-4">
          {!activeProjectId && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed text-center">
              <Sparkles className="mb-3 size-10 text-muted-foreground/40" />
              <p className="font-medium text-muted-foreground">Your outputs will appear here</p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Results stream in live as each format is generated
              </p>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-3">
              {selectedFormats.slice(0, 3).map((id) => (
                <Card key={id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24" />
                  </CardContent>
                </Card>
              ))}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Generating {selectedFormats.length} formats…
              </div>
            </div>
          )}

          {activeProject?.status === 'error' && outputs?.length === 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {activeProject.errorMessage ?? 'Generation failed. Please try again.'}
            </div>
          )}

          <div className="space-y-4">
            {outputs?.map((output: ConvexOutput) => (
              <OutputCard key={output._id} output={output} />
            ))}
          </div>

          {activeProject?.status === 'error' && (outputs?.length ?? 0) > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <AlertCircle className="size-3.5 shrink-0" />
              {activeProject.errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
