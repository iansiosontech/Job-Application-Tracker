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
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">JobTracker AI</span>
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
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <Link
          href="/jobs/new"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Job
        </Link>
      </div>
    </aside>
  );
}
