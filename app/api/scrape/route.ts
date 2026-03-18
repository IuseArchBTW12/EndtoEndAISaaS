import { NextRequest, NextResponse } from 'next/server'

// ─── Lightweight URL scraper ──────────────────────────────────────────────────
// Uses fetch + a naive HTML → plain-text strip (no external deps).
// For production you'd use a proper scraper / Firecrawl / Jina AI, but this
// covers the 80 % case of blog posts and articles.

function htmlToText(html: string): string {
  // Drop scripts, styles, nav, footer, header
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    // Convert block elements to newlines
    .replace(/<\/?(h[1-6]|p|li|br|div|section|article|tr|td|th)[^>]*>/gi, '\n')
    // Strip remaining tags
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Collapse whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  // Truncate to ~8000 chars (enough context for AI without token waste)
  if (text.length > 8000) {
    text = text.slice(0, 8000) + '\n\n[Content truncated at 8,000 characters]'
  }
  return text
}

export async function POST(req: NextRequest) {
  try {
    const { url } = (await req.json()) as { url?: string }

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }

    // Basic URL validation
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Only http/https URLs are supported' }, { status: 400 })
    }

    // Fetch with a browser-like User-Agent to avoid bot blocks
    const res = await fetch(parsed.href, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; ContentForge/1.0; +https://contentforge.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10_000), // 10s timeout
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${res.status} ${res.statusText}` },
        { status: 422 },
      )
    }

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('html')) {
      return NextResponse.json(
        { error: 'URL does not return HTML content. Try a direct article URL.' },
        { status: 422 },
      )
    }

    const html = await res.text()
    const text = htmlToText(html)

    if (text.length < 100) {
      return NextResponse.json(
        { error: 'Could not extract enough content from this URL. Paste the text manually.' },
        { status: 422 },
      )
    }

    // Attempt to extract the page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : parsed.hostname

    return NextResponse.json({ text, title, charCount: text.length })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Scrape failed: ${msg}` }, { status: 500 })
  }
}
