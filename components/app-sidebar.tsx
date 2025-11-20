"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  MegaphoneIcon,
  PackageIcon,
  SearchIcon,
  SettingsIcon,
  TestTubeIcon,
  WalletIcon,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
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
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Campaigns",
    url: "/dashboard/campaigns",
    icon: MegaphoneIcon,
  },
  {
    title: "Procedures",
    url: "/dashboard/procedures",
    icon: ListChecksIcon,
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: PackageIcon,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChartIcon,
  },
  {
    title: "Wallet",
    url: "/dashboard/wallet",
    icon: WalletIcon,
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
    url: "/dashboard/settings",
    icon: SettingsIcon,
  },
  {
    title: "Get Help",
    url: "/help",
    icon: HelpCircleIcon,
  },
  {
    title: "Search",
    url: "#",
    icon: SearchIcon,
  },
]

const documents = [
  {
    name: "Data Library",
    url: "#",
    icon: DatabaseIcon,
  },
  {
    name: "Reports",
    url: "#",
    icon: ClipboardListIcon,
  },
  {
    name: "Word Assistant",
    url: "#",
    icon: FileIcon,
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
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">SuperTry</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavDocuments items={documents} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
