import type { Id } from '@/convex/_generated/dataModel'

export interface ConvexOutput {
  _id: string
  _creationTime: number
  projectId: string
  formatType: string
  content: string
  aiProvider: string
  userId: string
  starred?: boolean
}

export interface ConvexProject {
  _id: Id<'projects'>
  _creationTime: number
  userId: string
  title: string
  sourceContent: string
  selectedFormats: string[]
  status: 'pending' | 'processing' | 'done' | 'error'
  errorMessage?: string
  outputCount?: number
}

export interface ConvexUser {
  _id: Id<'users'>
  _creationTime: number
  externalId: string
  email: string
  name?: string
  subscriptionTier: 'free' | 'starter' | 'pro'
  runsUsedThisMonth: number
  polarCustomerId?: string
}
