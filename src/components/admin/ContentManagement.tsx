"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  getAllStories,
  approveStory,
  rejectStory,
  StoryListItem,
  StoryStatus,
  StoryType,
  GetAllStoriesParams,
} from "@/components/ContentManagementApiClient";

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertCircle size={18} />,
  info: <Info size={18} />,
};

const TOAST_STYLES: Record<ToastType, string> = {
  success: "bg-green-50 border-green-200 text-green-700",
  error: "bg-red-50 border-red-200 text-red-600",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
  info: "bg-blue-50 border-blue-200 text-blue-600",
};

const ToastContainer = ({
  toasts,
  remove,
}: {
  toasts: Toast[];
  remove: (id: string) => void;
}) => (
  <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 min-w-[320px]">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`flex items-center gap-3 px-4 py-3 rounded-[10px] border shadow-md font-serif text-[13px] animate-in slide-in-from-right-5 duration-300 ${TOAST_STYLES[t.type]}`}
      >
        {TOAST_ICONS[t.type]}
        <span className="flex-1">{t.message}</span>
        <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    ))}
  </div>
);

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), 4000);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, remove };
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-black text-white",
  published: "border border-black text-black",
  rejected: "bg-red-100 text-red-600",
  revision: "bg-yellow-100 text-yellow-700",
  scheduled: "bg-blue-100 text-blue-600",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`px-4 py-1 rounded-full text-[12px] font-medium font-serif capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}
  >
    {status === "revision" ? "Needs Revision" : status}
  </span>
);

// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-xl p-8 w-full max-w-[400px] border border-gray-100">
        <h3 className="font-serif text-[20px] font-semibold text-black mb-3">{title}</h3>
        <p className="font-serif text-[14px] text-gray-500 mb-8">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-200 rounded-full font-serif text-sm text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-full font-serif text-sm text-white font-medium transition-all ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="border-b border-gray-50">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <td key={i} className="px-8 py-6">
        <div className="h-4 bg-gray-100 rounded-full animate-pulse w-[80%]" />
      </td>
    ))}
  </tr>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── Main Component ───────────────────────────────────────────────────────────

const LIMIT = 10;

const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Published", value: "published" },
  { label: "Rejected", value: "rejected" },
  { label: "Needs Revision", value: "revision" },
  { label: "Scheduled", value: "scheduled" },
];

const TYPE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "All Types", value: "all" },
  { label: "Story", value: "story" },
  { label: "Podcast", value: "podcast" },
  { label: "Live News", value: "live_news" },
];

const ContentManagement = () => {
  const { toasts, show, remove } = useToast();

  const [stories, setStories] = useState<StoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Confirm modal
  const [confirm, setConfirm] = useState<{
    open: boolean;
    id: string;
    action: "approve" | "reject";
    title: string;
  }>({ open: false, id: "", action: "approve", title: "" });

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetAllStoriesParams = {
        page,
        limit: LIMIT,
        ...(statusFilter !== "all" && { status: statusFilter as StoryStatus }),
        ...(typeFilter !== "all" && { type: typeFilter as StoryType }),
        ...(search && { search }),
      };
      const res = await getAllStories(params);
      if (res.success) {
        setStories(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      }
    } catch (err: unknown) {
      show("error", err instanceof Error ? err.message : "Failed to load stories.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, search]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, search]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleApprove = async (id: string) => {
    setActionLoading(id + "_approve");
    try {
      const res = await approveStory(id);
      if (res.success) {
        show("success", res.message || "Story approved and published!");
        fetchStories();
      }
    } catch (err: unknown) {
      show("error", err instanceof Error ? err.message : "Approval failed.");
    } finally {
      setActionLoading(null);
      setConfirm((c) => ({ ...c, open: false }));
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id + "_reject");
    try {
      const res = await rejectStory(id, "Does not meet editorial standards.");
      if (res.success) {
        show("warning", res.message || "Story rejected.");
        fetchStories();
      }
    } catch (err: unknown) {
      show("error", err instanceof Error ? err.message : "Rejection failed.");
    } finally {
      setActionLoading(null);
      setConfirm((c) => ({ ...c, open: false }));
    }
  };

  const handleConfirm = () => {
    if (confirm.action === "approve") handleApprove(confirm.id);
    else handleReject(confirm.id);
  };

  // ── Pagination helpers ─────────────────────────────────────────────────────

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <ToastContainer toasts={toasts} remove={remove} />

      <ConfirmModal
        open={confirm.open}
        title={confirm.action === "approve" ? "Approve Story" : "Reject Story"}
        message={
          confirm.action === "approve"
            ? `Are you sure you want to approve and publish "${confirm.title}"?`
            : `Are you sure you want to reject "${confirm.title}"? This will notify the writer.`
        }
        confirmLabel={confirm.action === "approve" ? "Yes, Publish" : "Yes, Reject"}
        confirmClass={
          confirm.action === "approve"
            ? "bg-[#3448D6] hover:opacity-90"
            : "bg-[#EE264F] hover:opacity-90"
        }
        onConfirm={handleConfirm}
        onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
      />

      <div className="w-full bg-white rounded-[14px] shadow-sm border border-gray-100 overflow-hidden">
        {/* Header & Filters */}
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-[28px] font-semibold text-black tracking-tight">
              Content Management
            </h1>
            {!loading && (
              <p className="font-serif text-[13px] text-gray-400 mt-1">
                {total} {total === 1 ? "story" : "stories"} found
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Type filter */}
            <div className="relative min-w-[140px]">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-[10px] px-4 py-2 font-serif text-sm focus:outline-none focus:border-[#3448D6] transition-colors"
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Status filter */}
            <div className="relative min-w-[140px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-[10px] px-4 py-2 font-serif text-sm focus:outline-none focus:border-[#3448D6] transition-colors"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search stories..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearch(searchInput);
                }}
                className="border border-gray-200 rounded-[10px] px-4 py-2 pl-10 font-serif text-sm focus:outline-none focus:border-[#3448D6] w-56 transition-colors"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => setSearch(searchInput)}
              />
            </div>

            {/* Refresh */}
            <button
              onClick={fetchStories}
              disabled={loading}
              className="p-2 border border-gray-200 rounded-[10px] text-gray-400 hover:text-[#3448D6] hover:border-[#3448D6] transition-colors disabled:opacity-40"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                {["Article Title", "Writer", "Type", "Status", "Submitted", "Actions"].map((h) => (
                  <th key={h} className="px-8 py-4 font-serif text-sm font-semibold text-black">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : stories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center font-serif text-gray-400 text-sm">
                    No stories found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                stories.map((story) => {
                  const isActing =
                    actionLoading === story._id + "_approve" ||
                    actionLoading === story._id + "_reject";

                  return (
                    <tr
                      key={story._id}
                      className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors"
                    >
                      {/* Title */}
                      <td className="px-8 py-5 font-serif text-sm text-gray-700 max-w-[200px]">
                        <span className="line-clamp-2 leading-snug">{story.title}</span>
                      </td>

                      {/* Writer */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          {story.author?.profileImage && (
                            <img
                              src={story.author.profileImage}
                              alt={story.author.name}
                              className="w-7 h-7 rounded-full object-cover border border-gray-100 shrink-0"
                            />
                          )}
                          <span className="font-serif text-sm text-gray-700 whitespace-nowrap">
                            {story.author?.name ?? "—"}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-8 py-5 font-serif text-sm text-gray-600 capitalize whitespace-nowrap">
                        {story.type.replace("_", " ")}
                      </td>

                      {/* Status */}
                      <td className="px-8 py-5">
                        <StatusBadge status={story.status} />
                      </td>

                      {/* Date */}
                      <td className="px-8 py-5 font-serif text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(story.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-5">
                        {story.status === "published" ? (
                          <Link
                            href={`/editor/content/${story._id}`}
                            className="px-5 py-2 bg-[#E2E4F0] text-[#3448D6] rounded-[8px] text-xs font-medium font-serif hover:bg-[#d0d4f0] transition-colors"
                          >
                            View
                          </Link>
                        ) : (
                          <div className="flex gap-2 flex-wrap">
                            {/* Edit/Review */}
                            <Link
                              href={`/editor/content/${story._id}`}
                              className="px-4 py-1.5 bg-[#E2E4F0] text-[#3448D6] rounded-[6px] text-xs font-medium font-serif hover:bg-[#d0d4f0] transition-colors"
                            >
                              Review
                            </Link>

                            {/* Reject – only for pending/revision */}
                            {(story.status === "pending" || story.status === "revision") && (
                              <button
                                disabled={isActing}
                                onClick={() =>
                                  setConfirm({
                                    open: true,
                                    id: story._id,
                                    action: "reject",
                                    title: story.title,
                                  })
                                }
                                className="px-4 py-1.5 bg-[#FDE2E2] text-[#EE264F] rounded-[6px] text-xs font-medium font-serif hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === story._id + "_reject"
                                  ? "Rejecting..."
                                  : "Reject"}
                              </button>
                            )}

                            {/* Approve – only for pending */}
                            {story.status === "pending" && (
                              <button
                                disabled={isActing}
                                onClick={() =>
                                  setConfirm({
                                    open: true,
                                    id: story._id,
                                    action: "approve",
                                    title: story.title,
                                  })
                                }
                                className="px-4 py-1.5 bg-[#E2F0E5] text-[#4CAF50] rounded-[6px] text-xs font-medium font-serif hover:bg-green-100 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === story._id + "_approve"
                                  ? "Publishing..."
                                  : "Publish"}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-8 flex items-center justify-between">
            <p className="font-serif text-[13px] text-gray-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 border border-gray-200 rounded-[8px] text-gray-400 hover:border-[#3448D6] hover:text-[#3448D6] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={i} className="px-2 text-gray-400 font-serif text-sm">
                    ...
                  </span>
                ) : (
                  <button
                    key={i}
                    onClick={() => setPage(p as number)}
                    className={`w-9 h-9 rounded-[8px] font-serif text-sm transition-colors ${
                      page === p
                        ? "bg-[#3448D6] text-white"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 border border-gray-200 rounded-[8px] text-gray-400 hover:border-[#3448D6] hover:text-[#3448D6] disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ContentManagement;