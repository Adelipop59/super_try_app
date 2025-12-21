"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CreditCardIcon,
  FilterIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  MegaphoneIcon,
  PackageIcon,
  SettingsIcon,
  TestTubeIcon,
  UsersIcon,
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

// Navigation pour les utilisateurs PRO
const proNavMain = [
  {
    title: "Overview",
    url: "/dashboard/pro",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Campaigns",
    url: "/dashboard/pro/campaigns",
    icon: MegaphoneIcon,
  },
  {
    title: "Procedures",
    url: "/dashboard/pro/procedures",
    icon: ListChecksIcon,
  },
  {
    title: "Criteres",
    url: "/dashboard/pro/criteria-templates",
    icon: FilterIcon,
  },
  {
    title: "Products",
    url: "/dashboard/pro/products",
    icon: PackageIcon,
  },
  {
    title: "Mes paiements",
    url: "/dashboard/pro/payments",
    icon: CreditCardIcon,
  },
]

// Navigation pour les utilisateurs standard (testeurs)
const userNavMain = [
  {
    title: "Overview",
    url: "/dashboard/user",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Sessions",
    url: "/dashboard/user/sessions",
    icon: TestTubeIcon,
  },
  {
    title: "Wallet",
    url: "/dashboard/user/wallet",
    icon: WalletIcon,
  },
]

// Navigation pour les administrateurs
const adminNavMain = [
  {
    title: "Overview",
    url: "/dashboard/admin",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Utilisateurs",
    url: "/dashboard/admin/users",
    icon: UsersIcon,
  },
  {
    title: "Campagnes",
    url: "/dashboard/admin/campaigns",
    icon: MegaphoneIcon,
  },
  {
    title: "Statistiques",
    url: "/dashboard/admin/analytics",
    icon: BarChartIcon,
  },
]

// Secondary navigation based on role
const getNavSecondary = (role?: string) => {
  const settingsUrl = role === 'ADMIN'
    ? '/dashboard/admin/settings'
    : role === 'USER'
    ? '/dashboard/user/settings'
    : '/dashboard/pro/settings'

  return [
    {
      title: "Settings",
      url: settingsUrl,
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: HelpCircleIcon,
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const userData = {
    name: user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    avatar: user?.avatar || '/avatars/shadcn.jpg',
  }

  // Sélectionner la navigation en fonction du rôle
  const navItems = user?.role === 'ADMIN'
    ? adminNavMain
    : user?.role === 'USER'
    ? userNavMain
    : proNavMain

  // Get dashboard URL based on role
  const dashboardUrl = user?.role === 'ADMIN'
    ? '/dashboard/admin'
    : user?.role === 'USER'
    ? '/dashboard/user'
    : '/dashboard/pro'

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href={dashboardUrl}>
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">SuperTry</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavSecondary items={getNavSecondary(user?.role)} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
