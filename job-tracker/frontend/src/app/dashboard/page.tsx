"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Briefcase, FileText, Target, TrendingUp } from "lucide-react";

interface Stats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const kanban = await api.getKanban();
        setStats({
          total: Object.values(kanban).flat().length,
          applied: kanban.applied?.length || 0,
          interview: kanban.interview?.length || 0,
          offer: kanban.offer?.length || 0,
          rejected: kanban.rejected?.length || 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Applications", value: stats?.total ?? 0, icon: Briefcase, color: "bg-blue-500" },
    { label: "Interviews", value: stats?.interview ?? 0, icon: Target, color: "bg-green-500" },
    { label: "Offers", value: stats?.offer ?? 0, icon: TrendingUp, color: "bg-purple-500" },
    { label: "Rejected", value: stats?.rejected ?? 0, icon: FileText, color: "bg-red-400" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">Your job search at a glance</p>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
              <div className={`w-9 h-9 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6">
        <h2 className="font-semibold text-indigo-900 mb-1">Getting Started</h2>
        <ol className="text-sm text-indigo-700 space-y-1 list-decimal list-inside">
          <li>Upload your resume under <strong>Resume</strong></li>
          <li>Add a job description under <strong>Jobs</strong></li>
          <li>Run AI analysis to get a match score</li>
          <li>Track your applications on the <strong>Tracker</strong> board</li>
        </ol>
      </div>
    </div>
  );
}
