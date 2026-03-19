// ─── Output format definitions ───────────────────────────────────────────────

export type FormatType =
  | 'twitter_thread'
  | 'linkedin_post'
  | 'newsletter'
  | 'email_sequence'
  | 'blog_summary'
  | 'video_script_short'
  | 'video_script_long'
  | 'instagram_caption'
  | 'youtube_description'
  | 'key_takeaways'

export interface FormatDefinition {
  id: FormatType
  label: string
  description: string
  provider: 'claude' | 'grok'
  tier: 'free' | 'starter' | 'pro'
  icon: string
}

export const FORMATS: FormatDefinition[] = [
  {
    id: 'twitter_thread',
    label: 'Twitter / X Thread',
    description: '8-12 punchy tweets with hooks',
    provider: 'grok',
    tier: 'free',
    icon: '𝕏',
  },
  {
    id: 'linkedin_post',
    label: 'LinkedIn Post',
    description: 'Professional long-form post with CTA',
    provider: 'claude',
    tier: 'free',
    icon: 'in',
  },
  {
    id: 'blog_summary',
    label: 'Blog Summary',
    description: 'SEO-friendly 300-word summary',
    provider: 'claude',
    tier: 'free',
    icon: '📝',
  },
  {
    id: 'newsletter',
    label: 'Newsletter Section',
    description: 'Ready-to-send email newsletter section',
    provider: 'claude',
    tier: 'starter',
    icon: '📬',
  },
  {
    id: 'email_sequence',
    label: 'Email Sequence (3-part)',
    description: '3-email nurture sequence',
    provider: 'claude',
    tier: 'starter',
    icon: '✉️',
  },
  {
    id: 'video_script_short',
    label: 'Short-Form Video Script',
    description: '60-second script for Reels / TikTok / Shorts',
    provider: 'grok',
    tier: 'starter',
    icon: '🎬',
  },
  {
    id: 'instagram_caption',
    label: 'Instagram Caption',
    description: 'Engaging caption with hashtags',
    provider: 'grok',
    tier: 'starter',
    icon: '📸',
  },
  {
    id: 'youtube_description',
    label: 'YouTube Description',
    description: 'SEO-optimised video description + timestamps',
    provider: 'claude',
    tier: 'starter',
    icon: '▶️',
  },
  {
    id: 'video_script_long',
    label: 'Long-Form Video Script',
    description: '5-10 min YouTube script with hooks',
    provider: 'claude',
    tier: 'pro',
    icon: '🎥',
  },
  {
    id: 'key_takeaways',
    label: 'Key Takeaways',
    description: 'Bullet-point summary of insights',
    provider: 'claude',
    tier: 'free',
    icon: '💡',
  },
]

// ─── Tier run limits ─────────────────────────────────────────────────────────

export const TIER_LIMITS: Record<string, number> = {
  free: 3,
  starter: 30,
  pro: Infinity,
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

export const TONE_LABELS: Record<string, string> = {
  professional: 'Professional',
  conversational: 'Conversational',
  witty: 'Witty & Bold',
  educational: 'Educational',
}

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional: 'TONE: Formal, authoritative, and polished. Use data, avoid colloquialisms, write for business professionals.',
  conversational: 'TONE: Warm, casual, and personal — like talking to a close friend. Use contractions, short sentences, and everyday language.',
  witty: 'TONE: Witty, bold, and punchy. Use clever angles, light humour, and provocative statements. Make people stop scrolling.',
  educational: 'TONE: Clear, detailed, and structured for learning. Define terms, use examples, organise with clear hierarchy.',
}

export function buildPrompt(
  format: FormatType,
  sourceContent: string,
  brandVoice?: string,
  tone?: string,
): string {
  const voiceInstructions = brandVoice
    ? `\n\nBRAND VOICE GUIDELINES:\n${brandVoice}\nApply this voice throughout your response.\n`
    : ''

  const toneInstruction = tone && TONE_INSTRUCTIONS[tone]
    ? `\n\n${TONE_INSTRUCTIONS[tone]}\n`
    : ''

  const base = `You are an expert content strategist and copywriter.${voiceInstructions}${toneInstruction}

SOURCE CONTENT:
${sourceContent}

`
  const instructions: Record<FormatType, string> = {
    twitter_thread: `${base}Repurpose the source content into an engaging Twitter/X thread.
- Start with a strong hook tweet that stops scrolling
- Write 8-12 tweets total
- Each tweet max 280 characters
- Use numbers, line breaks, and bold claims
- End with a call to action
- Format as: "1/ [tweet]\\n\\n2/ [tweet]" etc.`,

    linkedin_post: `${base}Repurpose the source content into a powerful LinkedIn post.
- Start with a curiosity-gap opening line (no "I'm excited to share…")
- 150-300 words
- Use short paragraphs (2-3 lines max)
- Include 3-5 key insights
- End with a question to drive comments
- Add 3-5 relevant hashtags at the bottom`,

    newsletter: `${base}Repurpose the source content into a newsletter section.
- Write a compelling subject line
- Add a preview text (90 chars max)
- Body: 300-400 words, warm and conversational tone
- Include 1 actionable takeaway
- Sign off naturally`,

    email_sequence: `${base}Create a 3-part email nurture sequence based on the source content.
EMAIL 1 (Day 1) - Awareness: introduce the problem/opportunity
EMAIL 2 (Day 3) - Education: dive deeper into the solution  
EMAIL 3 (Day 7) - Conversion: clear CTA

Format each email with:
Subject: [subject line]
Preview: [preview text]
Body: [email body]
CTA: [call to action button text]`,

    blog_summary: `${base}Write a 300-word SEO-friendly blog post summary.
- Use a compelling H1 title
- Include 2-3 subheadings (H2)
- Add a meta description (155 chars max) at the top
- Write for readability: short sentences, active voice
- End with a relevant CTA`,

    video_script_short: `${base}Write a 60-second short-form video script (Reels/TikTok/Shorts).
- HOOK (0-3s): Pattern interrupt opening line
- PROBLEM (3-10s): Relatable pain point
- SOLUTION (10-45s): Key insight/value, one step at a time
- CTA (45-60s): Follow / save / comment prompt
- Include [B-ROLL] and [TEXT ON SCREEN] cues in brackets`,

    video_script_long: `${base}Write a 5-10 minute YouTube video script.
- Clickbait-proof title suggestion
- INTRO (0-60s): Hook + what they'll learn + credibility
- MAIN CONTENT: 4-6 clearly labelled sections with transitions
- OUTRO: Subscribe CTA + recommended video
- Include [VISUAL CUE] suggestions throughout`,

    instagram_caption: `${base}Write an Instagram caption.
- First line: attention-grabbing hook (shows before "more")
- Body: 100-150 words, relatable and conversational
- Emojis used sparingly for structure
- CTA: save, share, or comment prompt
- 20-30 hashtags in first comment (provide them)`,

    youtube_description: `${base}Write a YouTube video description.
- First 125 chars: keyword-rich summary (appears in search)
- Full description: 200-300 words
- Include suggested timestamps format: 00:00 Intro, 01:30 [Section]...
- Add 3 relevant links section
- 5-8 keyword tags at the bottom`,

    key_takeaways: `${base}Extract the 5-7 most valuable key takeaways from the source content.
- Format as a numbered list
- Each takeaway: 1-2 sentences, actionable
- Bold the core insight in each point
- Add a 1-sentence summary at the top
- Add a "What to do next" section at the bottom`,
  }

  return instructions[format]
}
