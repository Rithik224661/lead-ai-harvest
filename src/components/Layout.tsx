
import React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { Database, Download, FileSpreadsheet, Home, Search, Settings, UserRound, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="flex items-center h-16 px-4 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold ml-4">Lead AI Harvest</h1>
            <div className="ml-auto flex items-center space-x-4">
              <UserRound className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export function AppSidebar() {
  return (
    <Sidebar className="border-r bg-white">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-teal-700" />
          <span className="font-semibold text-lg">Lead Harvest</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuItem href="/" icon={Home} text="Dashboard" />
              <MenuItem href="/search" icon={Search} text="Find Leads" />
              <MenuItem href="/leads" icon={Users} text="My Leads" />
              <MenuItem href="/export" icon={FileSpreadsheet} text="Export" />
              <MenuItem href="/settings" icon={Settings} text="Settings" />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          © 2025 Caprae Capital
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

interface MenuItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  active?: boolean;
}

const MenuItem = ({ href, icon: Icon, text, active }: MenuItemProps) => {
  const isActive = window.location.pathname === href;
  
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild className={cn(
        "w-full flex items-center gap-3 px-3 py-2",
        isActive && "bg-accent text-primary font-medium"
      )}>
        <a href={href}>
          <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
          <span>{text}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
