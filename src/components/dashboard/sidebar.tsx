"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  ChevronLeft,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Plus,
  Settings,
  X,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/links/new", label: "Create", icon: Plus },
  { href: "/dashboard/links", label: "Links", icon: Link2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      await fetch("/api/demo/login", { method: "DELETE" });
    } catch {
      // ignore
    }
    window.location.href = "/login";
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6">
        <Logo />
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : item.href === "/dashboard/links"
                  ? pathname === "/dashboard/links" ||
                    (pathname.startsWith("/dashboard/links/") &&
                      !pathname.startsWith("/dashboard/links/new"))
                  : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "smooth-hover flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                  isActive
                    ? "nav-glow-active font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar md:block">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 90, damping: 22, mass: 0.9 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-sidebar md:hidden"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-5" />
              </Button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function DashboardHeader({
  title,
  description,
  backHref,
  children,
}: {
  title: string;
  description?: string;
  backHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back
          </Link>
        )}
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-3 md:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}
