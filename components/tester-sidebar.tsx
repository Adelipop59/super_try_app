"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  RocketIcon,
  SettingsIcon,
  TestTubeIcon,
  TrophyIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"

// Navigation principale pour les testeurs
const testerNavMain = [
  {
    title: "Dashboard",
    url: "/dashboard/tester",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Campagnes",
    url: "/dashboard/tester/campaigns",
    icon: RocketIcon,
  },
  {
    title: "Mes Sessions",
    url: "/dashboard/tester/sessions",
    icon: TestTubeIcon,
  },
  {
    title: "Mes Gains",
    url: "/dashboard/tester/earnings",
    icon: TrophyIcon,
  },
  {
    title: "Mon Wallet",
    url: "/dashboard/tester/wallet",
    icon: WalletIcon,
  },
  {
    title: "Mon Profil",
    url: "/dashboard/tester/profile",
    icon: UserIcon,
  },
]

// Navigation secondaire
const testerNavSecondary = [
  {
    title: "Paramètres",
    url: "/dashboard/tester/settings",
    icon: SettingsIcon,
  },
  {
    title: "Aide",
    url: "/help",
    icon: HelpCircleIcon,
  },
]

export function TesterSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const userData = {
    name: user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email?.split('@')[0] || 'Testeur',
    email: user?.email || '',
    avatar: user?.avatar || '/avatars/shadcn.jpg',
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard/tester">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">SuperTry</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={testerNavMain} />
        <NavSecondary items={testerNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
