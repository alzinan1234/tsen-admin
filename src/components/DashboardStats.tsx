// components/DashboardStats.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Users,
  UserCheck,
  UserPlus,
  BookOpen,
  Mic,
  Radio,
  DollarSign,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { getDashboardStats } from "@/components/dashboardStatsApiClient";
import type { DashboardStats } from "@/components/dashboardStatsApiClient";

// ─── Types ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  subtitle?: string;
}

// ─── Stat Card Component ───────────────────────────────────────────────────

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, subtitle }) => (
  <div className="bg-white p-6 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <h3 className="font-serif text-[14px] text-[#8C8C8C] font-medium uppercase tracking-wide">
          {title}
        </h3>
        <p className="font-serif text-[36px] font-bold text-black leading-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && (
          <p className="text-[12px] text-[#B5B5B5] font-light">{subtitle}</p>
        )}
      </div>
      <div className="w-12 h-12 bg-gradient-to-br from-[#E9ECFF] to-[#F5F7FF] rounded-[14px] flex items-center justify-center">
        <Icon className="text-[#3448D6] w-6 h-6" strokeWidth={1.5} />
      </div>
    </div>
  </div>
);

// ─── Section Header ────────────────────────────────────────────────────────

const SectionHeader = ({ title, icon: Icon }: { title: string; icon: React.ElementType }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={20} className="text-[#3448D6]" />
    <h2 className="font-serif text-[20px] font-semibold text-black">{title}</h2>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: unknown) {
      console.error("Failed to fetch stats:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 size={36} className="animate-spin text-[#3448D6]" />
        <p className="text-[#8C8C8C] text-sm">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[16px] p-8 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-2">Failed to load dashboard data</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-[#3448D6] text-white rounded-[8px] text-sm hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Calculate derived stats
  const totalUsers = stats.users.readers + stats.users.writers + stats.users.editors;
  const totalContent = stats.content.stories.total + stats.content.podcasts.total + stats.content.liveNews.total;
  const totalPublished = stats.content.stories.published + stats.content.podcasts.published + stats.content.liveNews.published;

  return (
    <div className="space-y-8">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-[12px] text-[14px] text-gray-600 hover:bg-gray-50 transition-all"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          subtitle="Across all roles"
        />
        <StatCard
          title="Total Content"
          value={totalContent}
          icon={BookOpen}
          subtitle="Stories, Podcasts & News"
        />
        <StatCard
          title="Total Published"
          value={totalPublished}
          icon={FileText}
          subtitle="Live on platform"
        />
      </div>

      {/* User Breakdown Section */}
      <div>
        <SectionHeader title="User Analytics" icon={Users} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Readers"
            value={stats.users.readers}
            icon={UserPlus}
            subtitle="Active readers"
          />
          <StatCard
            title="Writers"
            value={stats.users.writers}
            icon={UserCheck}
            subtitle="Content creators"
          />
          <StatCard
            title="Editors"
            value={stats.users.editors}
            icon={Users}
            subtitle="Review team"
          />
        </div>
      </div>

      {/* Content Breakdown Section */}
      <div>
        <SectionHeader title="Content Analytics" icon={BookOpen} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stories */}
          <div className="bg-white p-6 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-[12px] flex items-center justify-center">
                <FileText className="text-[#3448D6] w-5 h-5" />
              </div>
              <h3 className="font-serif text-[16px] font-semibold text-black">Stories</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#8C8C8C]">Total</span>
                <span className="font-serif text-[24px] font-bold text-black">{stats.content.stories.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#8C8C8C]">Published</span>
                <span className="font-serif text-[24px] font-bold text-green-600">{stats.content.stories.published}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#8C8C8C]">Pending</span>
                <span className="font-serif text-[24px] font-bold text-orange-500">
                  {stats.content.stories.total - stats.content.stories.published}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-[#3448D6] h-2 rounded-full"
                    style={{
                      width: `${(stats.content.stories.published / stats.content.stories.total) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-[#B5B5B5] mt-2 text-center">
                  {Math.round((stats.content.stories.published / stats.content.stories.total) * 100)}% published
                </p>
              </div>
            </div>
          </div>

          {/* Podcasts */}
          <div className="bg-white p-6 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-[12px] flex items-center justify-center">
                <Mic className="text-purple-600 w-5 h-5" />
              </div>
              <h3 className="font-serif text-[16px] font-semibold text-black">Podcasts</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#8C8C8C]">Total</span>
                <span className="font-serif text-[24px] font-bold text-black">{stats.content.podcasts.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#8C8C8C]">Published</span>
                <span className="font-serif text-[24px] font-bold text-green-600">{stats.content.podcasts.published}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#8C8C8C]">Pending</span>
                <span className="font-serif text-[24px] font-bold text-orange-500">
                  {stats.content.podcasts.total - stats.content.podcasts.published}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${(stats.content.podcasts.published / stats.content.podcasts.total) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-[#B5B5B5] mt-2 text-center">
                  {Math.round((stats.content.podcasts.published / stats.content.podcasts.total) * 100)}% published
                </p>
              </div>
            </div>
          </div>

          {/* Live News */}
          <div className="bg-white p-6 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-[12px] flex items-center justify-center">
                <Radio className="text-red-500 w-5 h-5" />
              </div>
              <h3 className="font-serif text-[16px] font-semibold text-black">Live News</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#8C8C8C]">Total</span>
                <span className="font-serif text-[24px] font-bold text-black">{stats.content.liveNews.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#8C8C8C]">Published</span>
                <span className="font-serif text-[24px] font-bold text-green-600">{stats.content.liveNews.published}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#8C8C8C]">Draft</span>
                <span className="font-serif text-[24px] font-bold text-gray-400">
                  {stats.content.liveNews.total - stats.content.liveNews.published}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Section */}
      {stats.subscriptions.total > 0 && (
        <div>
          <SectionHeader title="Revenue Analytics" icon={DollarSign} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Active Subscriptions"
              value={stats.subscriptions.active}
              icon={UserCheck}
            />
            <StatCard
              title="Total Subscriptions"
              value={stats.subscriptions.total}
              icon={Users}
            />
            <StatCard
              title="Total Earnings"
              value={`$${stats.subscriptions.totalEarning.toLocaleString()}`}
              icon={DollarSign}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;