"use client"

import { type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            // Trouver tous les items qui correspondent au pathname actuel
            const matchingItems = items.filter(i =>
              pathname === i.url || pathname.startsWith(i.url + '/')
            )

            // Sélectionner l'item avec l'URL la plus longue (la plus spécifique)
            const mostSpecificItem = matchingItems.reduce((prev, current) =>
              (current.url.length > prev.url.length) ? current : prev
            , matchingItems[0])

            // Cet item est actif seulement s'il est le plus spécifique
            const isActive = mostSpecificItem?.url === item.url

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive}
                  className={isActive ? "bg-sidebar-accent text-foreground font-medium" : ""}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
