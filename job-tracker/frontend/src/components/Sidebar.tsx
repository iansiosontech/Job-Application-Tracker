"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FileText, LayoutDashboard, Target, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/jobs", label: "Jobs", icon: Target },
  { href: "/tracker", label: "Tracker", icon: Briefcase },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-56 bg-[#0d0d14] border-r border-white/[0.08] flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">JobTracker AI</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              path === href
                ? "bg-indigo-500/15 text-indigo-300"
                : "text-[#8b8b96] hover:bg-white/[0.04] hover:text-white"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/[0.06]">
        <Link
          href="/jobs"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Job
        </Link>
      </div>
    </aside>
  );
}