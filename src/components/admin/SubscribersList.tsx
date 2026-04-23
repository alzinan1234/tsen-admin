// components/SubscribersList.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { getSubscribers, Subscriber } from "@/components/subscriptionApiClient";

// ─── Types ─────────────────────────────────────────────────────────────────

type StatusFilter = "active" | "canceled" | "past_due";

// ─── Status Badge Component ────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    active: { color: "bg-green-50 text-green-600", icon: CheckCircle, label: "Active" },
    canceled: { color: "bg-red-50 text-red-600", icon: XCircle, label: "Canceled" },
    past_due: { color: "bg-yellow-50 text-yellow-600", icon: AlertCircle, label: "Past Due" },
  };
  
  const { color, icon: Icon, label } = config[status];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${color}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────

const SubscribersList: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const limit = 20;

  useEffect(() => {
    fetchSubscribers();
  }, [statusFilter, currentPage]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await getSubscribers({
        page: currentPage,
        limit,
        status: statusFilter,
      });
      
      setSubscribers(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
      setError(err instanceof Error ? err.message : "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSubscribers();
  };

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "canceled", label: "Canceled" },
    { value: "past_due", label: "Past Due" },
  ];

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-[#3448D6]" />
          <h2 className="font-serif text-[18px] font-semibold text-black">Subscribers</h2>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Status Filters */}
      <div className="px-6 pt-4 flex gap-2 border-b border-gray-100">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setStatusFilter(filter.value);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-[13px] font-medium transition-all ${
              statusFilter === filter.value
                ? "text-[#3448D6] border-b-2 border-[#3448D6]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={36} className="animate-spin text-[#3448D6]" />
            <p className="text-[#8C8C8C] text-sm mt-4">Loading subscribers...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchSubscribers}
              className="mt-4 px-4 py-2 bg-[#3448D6] text-white rounded-[8px] text-sm hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-[#8C8C8C]">No {statusFilter} subscribers found</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {subscribers.map((subscriber) => (
                <div key={subscriber._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-[16px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E9ECFF] rounded-full flex items-center justify-center">
                      <Mail size={18} className="text-[#3448D6]" />
                    </div>
                    <div>
                      <p className="font-medium text-black text-[14px]">Subscriber ID: {subscriber.userId}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#B5B5B5]" />
                          <span className="text-[11px] text-[#8C8C8C]">
                            Started: {new Date(subscriber.currentPeriodStart).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#B5B5B5]" />
                          <span className="text-[11px] text-[#8C8C8C]">
                            Ends: {new Date(subscriber.currentPeriodEnd).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={subscriber.status} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-[8px] border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <span className="text-[14px] text-[#8C8C8C]">
                  Page {currentPage} of {totalPages}
                </span>
                
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

export default SubscribersList;