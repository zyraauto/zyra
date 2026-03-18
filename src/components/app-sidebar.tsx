"use client";

import * as React from "react";
import {
  CalendarIcon,
  CarIcon,
  ChartBarIcon,
  HouseIcon,
  TagIcon,
  UsersIcon,
  WrenchIcon,
  ClipboardTextIcon,
  StarIcon,
} from "@phosphor-icons/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { useAuthStore } from "@/stores/auth.store";
import type { UserRole } from "@/types";
import Link from "next/link";

type NavItem = {
  title:    string;
  url:      string;
  icon:     React.ReactNode;
  isActive?: boolean;
  items?:   { title: string; url: string }[];
};

// URLs base sin locale — se prefijarán dinámicamente
const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  super_admin: [
    { title: "Dashboard",   url: "/admin/dashboard",   icon: <ChartBarIcon /> },
    { title: "Workshops",   url: "/admin/talleres",    icon: <WrenchIcon />,
      items: [{ title: "All workshops", url: "/admin/talleres" }] },
    { title: "Cars",        url: "/admin/autos",       icon: <CarIcon />,
      items: [{ title: "Brands & models", url: "/admin/autos" }] },
    { title: "Pricing",     url: "/admin/precios",     icon: <TagIcon /> },
    { title: "Promotions",  url: "/admin/promociones", icon: <StarIcon /> },
    { title: "Users",       url: "/admin/usuarios",    icon: <UsersIcon /> },
  ],
  workshop_admin: [
    { title: "Dashboard",   url: "/workshop/dashboard", icon: <HouseIcon /> },
    { title: "Agenda",      url: "/workshop/agenda",    icon: <CalendarIcon /> },
    { title: "Mechanics",   url: "/workshop/mecanicos", icon: <UsersIcon /> },
    { title: "Reports",     url: "/workshop/reportes",  icon: <ChartBarIcon /> },
  ],
  mechanic: [
    { title: "My Appointments", url: "/mechanic/mis-citas", icon: <ClipboardTextIcon /> },
  ],
  client: [
    { title: "Dashboard",        url: "/client/dashboard", icon: <HouseIcon /> },
    { title: "My Appointments",  url: "/client/citas",     icon: <CalendarIcon /> },
    { title: "My Garage",        url: "/client/garage",    icon: <CarIcon /> },
    { title: "Points",           url: "/client/puntos",    icon: <StarIcon /> },
  ],
  supplier: [
    { title: "Orders", url: "/supplier/ordenes", icon: <ClipboardTextIcon /> },
  ],
  visitor: [],
};

// ✅ locale se agrega como prop separado del resto de Sidebar
type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  locale?: string;
};

export function AppSidebar({ locale = "es", ...props }: AppSidebarProps) {
  const { profile } = useAuthStore();
  const role = (profile?.role ?? "visitor") as UserRole;

  // Prefijar todas las URLs con el locale
  const navItems = (NAV_BY_ROLE[role] ?? []).map(item => ({
    ...item,
    url: `/${locale}${item.url}`,
    items: item.items?.map(sub => ({
      ...sub,
      url: `/${locale}${sub.url}`,
    })),
  }));

  const user = {
    name:   profile?.full_name  ?? "User",
    email:  "",
    avatar: profile?.avatar_url ?? "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={`/${locale}`}>
                <CarIcon weight="fill" className="size-5 text-primary" />
                <span className="font-bold">AutoService Pro</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}