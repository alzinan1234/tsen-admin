// components/Archive.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Mic,
  Radio,
  Search,
  Eye,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Calendar,
  Tag,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { getArchive, ArchiveItem, ArchiveSummary } from "@/components/archiveApiClient";

// ─── Types ─────────────────────────────────────────────────────────────────

type ContentType = "story" | "podcast" | "liveNews";
type StatusFilter = "all" | "published" | "pending" | "rejected" | "revision";

// ─── Status Badge Component ────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    published: { color: "bg-green-50 text-green-600", icon: CheckCircle, label: "Published" },
    pending: { color: "bg-yellow-50 text-yellow-600", icon: Clock, label: "Pending" },
    rejected: { color: "bg-red-50 text-red-600", icon: XCircle, label: "Rejected" },
    revision: { color: "bg-orange-50 text-orange-600", icon: AlertCircle, label: "Revision" },
    draft: { color: "bg-gray-50 text-gray-600", icon: BookOpen, label: "Draft" },
  };
  
  const { color, icon: Icon, label } = config[status] || config.draft;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${color}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

// ─── Content Card Component ────────────────────────────────────────────────

const ContentCard: React.FC<{ item: ArchiveItem; onView: (id: string) => void }> = ({ item, onView }) => {
  return (
    <div className="bg-white rounded-[20px] border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
      {/* Cover Image & Title */}
      <div className="flex gap-4">
        {item.coverImage && (
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-24 h-24 rounded-[12px] object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-serif text-[18px] font-semibold text-black line-clamp-2 flex-1">
              {item.title}
            </h3>
            <StatusBadge status={item.status} />
          </div>
          
          <p className="text-[13px] text-[#8C8C8C] line-clamp-2 mb-3">
            {item.summary || "No summary available"}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#B5B5B5]">
            <div className="flex items-center gap-1">
              <User size={12} />
              <span>{item.author?.name || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{item.readingTime} min read</span>
            </div>
            {item.isPremium && (
              <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">
                Premium
              </span>
            )}
          </div>
          
          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <Tag size={12} className="text-[#B5B5B5]" />
              <div className="flex gap-1">
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="text-[10px] text-[#B5B5B5]">+{item.tags.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
        <button
          onClick={() => onView(item._id)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#3448D6] text-white rounded-[8px] text-[12px] font-medium hover:opacity-90 transition-all"
        >
          <Eye size={14} />
          View Details
        </button>
      </div>
    </div>
  );
};

// ─── Summary Card Component ────────────────────────────────────────────────

const SummaryCard: React.FC<{ title: string; value: number; icon: React.ElementType; color: string }> = ({ 
  title, value, icon: Icon, color 
}) => (
  <div className="bg-white rounded-[16px] border border-gray-100 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[12px] text-[#8C8C8C]">{title}</p>
        <p className="font-serif text-[28px] font-bold text-black mt-1">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────

const Archive: React.FC = () => {
  // State
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [summary, setSummary] = useState<ArchiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contentType, setContentType] = useState<ContentType>("story");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const limit = 10;

  // Content type options
  const contentTypes: { value: ContentType; label: string; icon: React.ElementType }[] = [
    { value: "story", label: "Stories", icon: FileText },
    { value: "podcast", label: "Podcasts", icon: Mic },
    { value: "liveNews", label: "Live News", icon: Radio },
  ];

  // Status filter options
  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
    { value: "revision", label: "Revision" },
  ];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch archive
  useEffect(() => {
    fetchArchive();
  }, [contentType, statusFilter, currentPage, debouncedSearch]);

  const fetchArchive = async () => {
    try {
      setLoading(true);
      setError("");
      
      const params = {
        type: contentType,
        status: statusFilter === "all" ? undefined : statusFilter,
        page: currentPage,
        limit,
        search: debouncedSearch || undefined,
      };
      
      const response = await getArchive(params);
      setItems(response.data);
      setSummary(response.summary);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (err) {
      console.error("Failed to fetch archive:", err);
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleViewContent = (id: string) => {
    window.open(`/admin/archive/${id}?type=${contentType}`, "_blank");
  };

  const handleRefresh = () => {
    fetchArchive();
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-[28px] font-bold text-black">Content Management</h1>
            <p className="font-sans text-[14px] text-[#8C8C8C] mt-1">
              Manage stories, podcasts, and live news content
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-[12px] text-[14px] text-gray-600 hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Content Type Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {contentTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setContentType(type.value);
                setCurrentPage(1);
                setStatusFilter("all");
              }}
              className={`flex items-center gap-2 px-6 py-3 text-[14px] font-medium transition-all ${
                contentType === type.value
                  ? "text-[#3448D6] border-b-2 border-[#3448D6]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <type.icon size={16} />
              {type.label}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <SummaryCard
              title="Total"
              value={summary.total}
              icon={BookOpen}
              color="bg-[#3448D6]"
            />
            <SummaryCard
              title="Published"
              value={summary.published}
              icon={CheckCircle}
              color="bg-green-500"
            />
            <SummaryCard
              title="Pending"
              value={summary.pending}
              icon={Clock}
              color="bg-yellow-500"
            />
            <SummaryCard
              title="Rejected"
              value={summary.rejected}
              icon={XCircle}
              color="bg-red-500"
            />
            <SummaryCard
              title="Revision"
              value={summary.revision}
              icon={AlertCircle}
              color="bg-orange-500"
            />
          </div>
        )}

        {/* Status Filter & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setStatusFilter(filter.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all ${
                  statusFilter === filter.value
                    ? "bg-[#3448D6] text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${contentType}s by title...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-[12px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3448D6]/20 focus:border-[#3448D6] bg-white"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={36} className="animate-spin text-[#3448D6]" />
            <p className="text-[#8C8C8C] text-sm mt-4">Loading content...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-[16px] p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchArchive}
              className="mt-4 px-4 py-2 bg-[#3448D6] text-white rounded-[8px] text-sm hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content Grid */}
        {!loading && !error && (
          <>
            {items.length === 0 ? (
              <div className="bg-white rounded-[20px] border border-gray-100 p-12 text-center">
                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-[#8C8C8C]">No content found</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-[#3448D6] text-sm hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <ContentCard
                    key={item._id}
                    item={item}
                    onView={handleViewContent}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-[8px] border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-[8px] text-[14px] font-medium transition-all ${
                          currentPage === pageNum
                            ? "bg-[#3448D6] text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-[8px] border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Archive;