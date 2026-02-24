"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
  Briefcase,
  BarChart3,
  Users,
  Receipt,
} from "lucide-react";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { UserRole } from "@/types";

interface SidebarNavProps {
  user: {
    email: string;
    name: string;
    id?: string;
  };
  role: UserRole;
}

const designerNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/templates", label: "Templates", icon: FileText },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const clientNavItems = [
  { href: "/dashboard", label: "My Briefs", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({ user, role }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = role === "designer" ? designerNavItems : clientNavItems;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <Link 
            href="/dashboard" 
            className="text-xl font-bold font-display tracking-tight rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black"
          >
            Briefed
          </Link>
        </div>
        {role === "designer" && user.id && <NotificationBell userId={user.id} />}
      </div>

      {/* New Project Button */}
      {role === "designer" && (
        <div className="px-4 pt-6 pb-2">
          <Button asChild className="w-full" size="sm">
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {user.name && (
              <p className="text-sm font-medium truncate">{user.name}</p>
            )}
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden flex h-14 items-center justify-between border-b bg-background px-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          <span className="font-bold font-display tracking-tight">Briefed</span>
        </div>
        <div className="flex items-center gap-1">
          {role === "designer" && user.id && <NotificationBell userId={user.id} />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "md:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-background border-r transform transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-background">
        {sidebarContent}
      </aside>
    </>
  );
}
