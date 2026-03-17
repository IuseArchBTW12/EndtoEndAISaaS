'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { type Id } from '@/convex/_generated/dataModel'
import { FORMATS } from '@/convex/prompts'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Zap, Copy, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConvexOutput } from '@/lib/types'

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

function OutputCard({ output }: { output: { formatType: string; content: string; aiProvider: string } }) {
  const [copied, setCopied] = useState(false)
  const format = FORMATS.find((f) => f.id === output.formatType)

  const copy = () => {
    navigator.clipboard.writeText(output.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="group relative">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <span>{format?.icon}</span>
          {format?.label ?? output.formatType}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {output.aiProvider === 'claude' ? '🤖 Claude' : '⚡ Grok'}
          </Badge>
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

  const [sourceContent, setSourceContent] = useState('')
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['twitter_thread', 'linkedin_post', 'key_takeaways'])
  const [activeProjectId, setActiveProjectId] = useState<Id<'projects'> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
              <CardTitle className="text-base">Source Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your blog post, YouTube transcript, podcast notes, or any long-form content here…"
                className="min-h-[200px] resize-none font-mono text-sm"
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
              />
              <p className="mt-2 text-right text-xs text-muted-foreground">
                {sourceContent.length.toLocaleString()} characters
              </p>
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
