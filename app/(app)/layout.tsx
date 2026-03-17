'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { LayoutDashboard, History, Mic2, Zap, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'History', href: '/history', icon: History },
  { label: 'Brand Voice', href: '/brand-voice', icon: Mic2, proOnly: true },
]

function AppSidebar() {
  const pathname = usePathname()
  const user = useQuery(api.users.getCurrentUser)

  const tierColors: Record<string, string> = {
    free: 'bg-muted text-muted-foreground',
    starter: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    pro: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Zap className="size-6 text-amber-500" />
          <span className="text-lg font-bold">ContentForge</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                    className={cn(
                      'flex items-center gap-2',
                      item.proOnly &&
                        user?.subscriptionTier !== 'pro' &&
                        'opacity-50',
                    )}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                    {item.proOnly && (
                      <Crown className="ml-auto size-3 text-amber-500" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <UserButton />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? '…'}</p>
            <Badge
              className={cn(
                'mt-0.5 text-xs capitalize',
                tierColors[user?.subscriptionTier ?? 'free'],
              )}
              variant="secondary"
            >
              {user?.subscriptionTier ?? 'free'}
            </Badge>
          </div>
        </div>
        {user?.subscriptionTier === 'free' && (
          <Link
            href="/pricing"
            className="mt-3 block rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-center text-xs font-semibold text-white shadow-sm hover:opacity-90"
          >
            Upgrade → Starter $19/mo
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex h-12 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <ThemeToggle />
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
