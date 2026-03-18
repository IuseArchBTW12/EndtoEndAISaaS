'use client'

import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { type Id } from '@/convex/_generated/dataModel'
import { FORMATS } from '@/convex/prompts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ConvexOutput, ConvexProject } from '@/lib/types'
import { ChevronDown, ChevronRight, Clock, Copy, Check, Star, Download } from 'lucide-react'
import { toast } from 'sonner'

function OutputItem({ output }: { output: ConvexOutput }) {
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
    <div className="group relative rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <span>{format?.icon}</span>
          {format?.label ?? output.formatType}
        </span>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px]">
            {output.aiProvider === 'claude' ? '🤖 Claude' : '⚡ Grok'}
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'size-6 transition-all',
              starred ? 'text-yellow-500' : 'opacity-0 group-hover:opacity-100',
            )}
            onClick={handleStar}
          >
            <Star className={cn('size-3', starred && 'fill-yellow-400')} />
          </Button>
          <Button size="icon" variant="ghost" className="size-6" onClick={copy}>
            {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
          </Button>
        </div>
      </div>
      <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded bg-muted/50 p-2 text-xs leading-relaxed">
        {output.content}
      </pre>
    </div>
  )
}

function ProjectRow({ project }: { project: ConvexProject }) {
  const [expanded, setExpanded] = useState(false)
  const outputs = useQuery(
    api.outputs.getForProject,
    expanded ? { projectId: project._id } : 'skip',
  )

  const statusColors: Record<string, string> = {
    done: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    processing: 'bg-blue-100 text-blue-700',
    pending: 'bg-muted text-muted-foreground',
    error: 'bg-red-100 text-red-700',
  }

  const exportAsMarkdown = () => {
    if (!outputs || outputs.length === 0) return
    const lines: string[] = [`# ${project.title}`, `Generated: ${new Date(project._creationTime).toLocaleDateString()}`, '']
    for (const o of outputs as ConvexOutput[]) {
      const fmt = FORMATS.find((f) => f.id === o.formatType)
      lines.push(`## ${fmt?.icon ?? ''} ${fmt?.label ?? o.formatType}`)
      lines.push('')
      lines.push(o.content)
      lines.push('')
      lines.push('---')
      lines.push('')
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${project.title.slice(0, 40).replace(/\s+/g, '-')}.md`
    a.click()
    toast.success('Exported as Markdown')
  }

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="size-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground" />
            )}
            <CardTitle className="text-sm font-medium">{project.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {expanded && outputs && outputs.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 gap-1 px-2 text-xs"
                onClick={(e) => { e.stopPropagation(); exportAsMarkdown() }}
              >
                <Download className="size-3" />
                Export
              </Button>
            )}
            <Badge className={cn('text-xs capitalize', statusColors[project.status])} variant="secondary">
              {project.status}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {new Date(project._creationTime).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1 pl-6">
          {project.selectedFormats.map((f) => {
            const format = FORMATS.find((fmt) => fmt.id === f)
            return (
              <Badge key={f} variant="outline" className="text-[10px]">
                {format?.icon} {format?.label ?? f}
              </Badge>
            )
          })}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />
          {!outputs ? (
            <div className="space-y-2">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : outputs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No outputs yet.
            </p>
          ) : (
            <div className="space-y-3">
              {(outputs as ConvexOutput[]).map((output) => (
                <OutputItem key={output._id} output={output} />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function HistoryPage() {
  const projects = useQuery(api.projects.listForCurrentUser, {})

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All your past repurposing projects — expand any row to star outputs or export as Markdown.
        </p>
      </div>

      {!projects ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed text-center">
          <p className="font-medium text-muted-foreground">No projects yet</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Head to Dashboard and repurpose your first piece of content!
          </p>
          <a href="/dashboard" className="mt-4 text-sm text-primary underline">
            Go to Dashboard →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project: ConvexProject) => (
            <ProjectRow key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
