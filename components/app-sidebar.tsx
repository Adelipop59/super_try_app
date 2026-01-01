"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  CreditCardIcon,
  FilterIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  MegaphoneIcon,
  PackageIcon,
  SettingsIcon,
  TestTubeIcon,
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
    title: "Dashboard",
    url: "/dashboard/pro",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Campaigns",
    url: "/dashboard/pro/campaigns",
    icon: MegaphoneIcon,
  },
  {
    title: "Sessions",
    url: "/dashboard/pro/sessions",
    icon: TestTubeIcon,
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
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Sessions",
    url: "/dashboard/sessions",
    icon: TestTubeIcon,
  },
  {
    title: "Wallet",
    url: "/dashboard/wallet",
    icon: WalletIcon,
  },
]

const navSecondary = [
  {
    title: "Settings",
    url: "/dashboard/pro/settings",
    icon: SettingsIcon,
  },
  {
    title: "Get Help",
    url: "/help",
    icon: HelpCircleIcon,
  },
]

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
  const navItems = user?.role === 'PRO' || user?.role === 'ADMIN'
    ? proNavMain
    : userNavMain

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard/pro">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold " >SuperTry</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
