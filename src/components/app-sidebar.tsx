import React from "react";
import { LayoutDashboard, ListFilter, Bell, ShieldCheck, Activity, Terminal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => api<{ status: string; region: string }>('/api/stats/health'),
    refetchInterval: 15000,
  });
  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Logs Explorer", icon: ListFilter, path: "/logs" },
    { title: "Alerts", icon: Bell, path: "/alerts" },
  ];
  return (
    <Sidebar className="border-r border-slate-800 bg-slate-950 text-slate-300">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">EdgeSight</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Observability
          </SidebarGroupLabel>
          <SidebarMenu className="mt-2 px-2">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200",
                    location.pathname === item.path
                      ? "bg-cyan-500/10 text-cyan-400 font-medium"
                      : "hover:bg-slate-900 hover:text-white"
                  )}
                >
                  <Link to={item.path}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
            System
          </SidebarGroupLabel>
          <SidebarMenu className="px-2">
            <SidebarMenuItem>
              <SidebarMenuButton className="flex items-center gap-3 hover:bg-slate-900">
                <ShieldCheck className="h-4 w-4" />
                <span>Security</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="flex items-center gap-3 hover:bg-slate-900">
                <Terminal className="h-4 w-4" />
                <span>API Console</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-800 p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-2xs font-medium text-slate-500">
            <div className={cn(
              "h-2 w-2 rounded-full animate-pulse",
              health?.status === 'operational' ? "bg-emerald-500" : "bg-amber-500"
            )} />
            EDGE NODE: {health?.region || 'CONNECTING...'}
          </div>
          <div className="text-[10px] text-slate-600 font-mono">
            v1.2.0-stable
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}