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
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/(auth)/login/actions";

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
    <nav className="flex-1 space-y-0.5">
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
              "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-indigo-400" : "text-slate-500"
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen border-r border-slate-800 bg-slate-950 px-3 py-5 space-y-6">
        {/* Logo */}
        <div className="flex items-center space-x-2.5 px-3 py-1">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <BrainCircuit className="h-4.5 w-4.5 text-indigo-400" />
          </div>
          <div>
            <span
              className="text-base font-semibold text-slate-100"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Intervu AI
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-800 mx-2" />

        {/* Navigation */}
        <NavLinks />

        {/* Footer */}
        <div className="mt-auto px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
          <p className="text-xs font-medium text-slate-400">
            Intervu AI
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            Final Year Project
          </p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <BrainCircuit className="h-4 w-4 text-indigo-400" />
          </div>
          <span
            className="font-semibold text-slate-100"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Intervu AI
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-9 w-9 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
<div
  className={cn(
    "md:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-slate-950 border-r border-slate-800 px-3 py-4 flex flex-col transition-transform duration-200",
    mobileOpen ? "translate-x-0" : "-translate-x-full"
  )}
>
  <NavLinks />

  {/* Mobile user info + sign out */}
  <div className="mt-auto pt-4 border-t border-slate-800 space-y-3">
    <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
      <p className="text-xs font-medium text-slate-300 truncate">
        Signed in
      </p>
      <p className="text-xs text-slate-500 truncate">
        Tap below to sign out
      </p>
    </div>
    <form action={signOut} className="w-full">
      <button
        type="submit"
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Sign Out
      </button>
    </form>
  </div>
</div>

      {/* Mobile spacer */}
      <div className="md:hidden h-14 shrink-0" />
    </>
  );
}