"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  LayoutDashboard,
  MessageSquare,
  Code2,
  FileText,
  History,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen border-r bg-card px-4 py-6 space-y-6">
      {/* Logo */}
      <div className="flex items-center space-x-2 px-2">
        <BrainCircuit className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold">Intervu AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
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
      </nav>

      {/* Footer */}
      <div className="px-2 text-xs text-muted-foreground">
        <p>Intervu AI v1.0</p>
        <p>Final Year Project</p>
      </div>
    </aside>
  );
}