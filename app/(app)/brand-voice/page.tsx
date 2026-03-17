'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Crown, Loader2, Mic2, Plus, X } from 'lucide-react'
import Link from 'next/link'

export default function BrandVoicePage() {
  const user = useQuery(api.users.getCurrentUser)
  const brandVoice = useQuery(api.users.getBrandVoice)
  const upsertBrandVoice = useMutation(api.users.upsertBrandVoice)

  const [sampleTexts, setSampleTexts] = useState<string[]>([''])
  const [voiceDescription, setVoiceDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [synced, setSynced] = useState(false)

  // Populate form once Convex data loads (runs only once per page load)
  useEffect(() => {
    if (!synced && brandVoice) {
      if (brandVoice.sampleTexts.length > 0) {
        setSampleTexts(brandVoice.sampleTexts)
      }
      setVoiceDescription(brandVoice.voiceDescription ?? '')
      setSynced(true)
    }
  }, [brandVoice, synced])

  const isPro = user?.subscriptionTier === 'pro'

  const save = async () => {
    const filled = sampleTexts.filter((t) => t.trim())
    if (filled.length === 0) return toast.error('Add at least one sample text.')
    setSaving(true)
    try {
      await upsertBrandVoice({ sampleTexts: filled, voiceDescription: voiceDescription || undefined })
      toast.success('Brand Voice saved!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!isPro) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-12 text-center dark:border-amber-800 dark:bg-amber-950/20">
          <Crown className="mb-4 size-12 text-amber-500" />
          <h2 className="text-xl font-bold">Brand Voice is a Pro Feature</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Train ContentForge on your writing style and it will apply your unique voice
            across every output format — forever.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-md hover:opacity-90"
          >
            <Crown className="size-4" />
            Upgrade to Pro — $49/mo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Brand Voice</h1>
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            <Crown className="mr-1 size-3" />
            Pro
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide sample content written in your voice. ContentForge will match
          your tone and style on every output.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mic2 className="size-4" />
              Voice Description
            </CardTitle>
            <CardDescription>
              Describe your tone and style in a few sentences (optional but
              recommended).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g. I write in a casual, conversational tone. I use short sentences, avoid jargon, and often use rhetorical questions. My content is actionable and data-driven but never dry."
              className="min-h-[100px] text-sm"
              value={voiceDescription}
              onChange={(e) => setVoiceDescription(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sample Texts</CardTitle>
            <CardDescription>
              Paste 2-5 pieces of your best content. The AI will use these as
              style reference.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sampleTexts.map((text, i) => (
              <div key={i} className="relative">
                <Textarea
                  placeholder={`Sample ${i + 1}: Paste a tweet, LinkedIn post, or email you've written…`}
                  className="min-h-[120px] pr-8 text-sm"
                  value={text}
                  onChange={(e) => {
                    const next = [...sampleTexts]
                    next[i] = e.target.value
                    setSampleTexts(next)
                  }}
                />
                {sampleTexts.length > 1 && (
                  <button
                    className="absolute right-2 top-2 rounded p-0.5 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setSampleTexts((prev) => prev.filter((_, j) => j !== i))
                    }
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
            {sampleTexts.length < 5 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setSampleTexts((prev) => [...prev, ''])}
              >
                <Plus className="size-3.5" />
                Add another sample
              </Button>
            )}
          </CardContent>
        </Card>

        <Button
          size="lg"
          className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90"
          onClick={save}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save Brand Voice'
          )}
        </Button>
      </div>
    </div>
  )
}
