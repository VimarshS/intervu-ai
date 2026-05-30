"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BrainCircuit,
  LayoutDashboard,
  MessageSquare,
  Code2,
  FileText,
  History,
  User,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Mock Interview",
    href: "/interview",
    icon: MessageSquare,
  },
  {
    label: "Coding Practice",
    href: "/practice",
    icon: Code2,
  },
  {
    label: "Resume Analyzer",
    href: "/resume",
    icon: FileText,
  },
  {
    label: "History",
    href: "/history",
    icon: History,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen border-r bg-card px-4 py-6 space-y-6">
        {/* Logo */}
        <div className="flex items-center space-x-2 px-2">
          <BrainCircuit className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">Intervu AI</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          <NavLinks />
        </nav>

        {/* Footer */}
        <div className="px-2 text-xs text-muted-foreground">
          <p>Intervu AI v1.0</p>
          <p>Final Year Project</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <span className="font-bold">Intervu AI</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-9 w-9"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "md:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-card border-r px-4 py-4 space-y-1 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavLinks />
      </div>

      {/* Mobile top spacer — pushes content below fixed header */}
      <div className="md:hidden h-14 shrink-0" />
    </>
  );
}