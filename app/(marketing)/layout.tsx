import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ContentForge — AI Content Repurposing for Creators',
  description: 'Turn one piece of content into 10+ formats in seconds.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
