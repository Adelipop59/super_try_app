"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url?: string
  icon?: LucideIcon
  children?: {
    title: string
    url: string
  }[]
}

export function NavMain({
  items,
}: {
  items: NavItem[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            // Vérifier si l'item a des enfants
            if (item.children && item.children.length > 0) {
              // Vérifier si un des enfants est actif
              const isChildActive = item.children.some(
                (child) => pathname === child.url || pathname.startsWith(child.url + '/')
              )

              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isChildActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isChildActive}
                        className={isChildActive ? "bg-sidebar-accent text-foreground font-medium" : ""}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((child) => {
                          const isActive = pathname === child.url || pathname.startsWith(child.url + '/')
                          return (
                            <SidebarMenuSubItem key={child.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive}
                              >
                                <Link href={child.url}>
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            }

            // Item sans enfants (comportement normal)
            // Trouver tous les items sans enfants qui correspondent au pathname actuel
            const itemsWithUrls = items.filter((i): i is NavItem & { url: string } => !!i.url && !i.children)
            const matchingItems = itemsWithUrls.filter(i =>
              pathname === i.url || pathname.startsWith(i.url + '/')
            )

            // Sélectionner l'item avec l'URL la plus longue (la plus spécifique)
            const mostSpecificItem = matchingItems.length > 0
              ? matchingItems.reduce((prev, current) =>
                  (current.url.length > prev.url.length) ? current : prev
                , matchingItems[0])
              : null

            // Cet item est actif seulement s'il est le plus spécifique
            const isActive = item.url ? mostSpecificItem?.url === item.url : false

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive}
                  className={isActive ? "bg-sidebar-accent text-foreground font-medium" : ""}
                >
                  <Link href={item.url || '#'}>
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
