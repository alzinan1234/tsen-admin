// app/admin/content/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Tag,
  Eye,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getArchive, ArchiveItem } from "@/components/archiveApiClient";

const ContentDetailsPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const contentId = params?.id as string;
  const contentType = searchParams?.get("type") || "story";
  
  const [content, setContent] = useState<ArchiveItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (contentId) {
      fetchContentDetails();
    }
  }, [contentId, contentType]);

  const fetchContentDetails = async () => {
    try {
      setLoading(true);
      // Fetch all items and find the one with matching ID
      const response = await getArchive({
        type: contentType as any,
        page: 1,
        limit: 100,
      });
      const foundItem = response.data.find(item => item._id === contentId);
      if (foundItem) {
        setContent(foundItem);
      } else {
        setError("Content not found");
      }
    } catch (err) {
      console.error("Failed to fetch content:", err);
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { color: string; icon: React.ElementType; label: string }> = {
      published: { color: "bg-green-50 text-green-600", icon: CheckCircle, label: "Published" },
      pending: { color: "bg-yellow-50 text-yellow-600", icon: Clock, label: "Pending" },
      rejected: { color: "bg-red-50 text-red-600", icon: XCircle, label: "Rejected" },
      revision: { color: "bg-orange-50 text-orange-600", icon: AlertCircle, label: "Revision" },
    };
    return config[status] || { color: "bg-gray-50 text-gray-600", icon: BookOpen, label: status };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#3448D6]" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="bg-white rounded-[20px] p-8 text-center max-w-md">
          <h2 className="font-serif text-[20px] font-semibold text-black mb-2">Content Not Found</h2>
          <p className="text-[#8C8C8C] text-sm mb-6">{error || "Unable to load content"}</p>
          <button
            onClick={() => router.push("/admin/content")}
            className="px-4 py-2 bg-[#3448D6] text-white rounded-[8px] text-sm hover:opacity-90"
          >
            Back to Content
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(content.status);

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/admin/archive")}
            className="flex items-center gap-2 text-[#8C8C8C] hover:text-[#3448D6] transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-[14px]">Back to Content</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
          {/* Cover Image */}
          {content.coverImage && (
            <div className="relative h-64 w-full">
              <img
                src={content.coverImage}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Content Body */}
          <div className="p-8">
            {/* Title & Status */}
            <div className="flex items-start justify-between mb-4">
              <h1 className="font-serif text-[32px] font-bold text-black flex-1">
                {content.title}
              </h1>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium ${statusConfig.color}`}>
                <statusConfig.icon size={14} />
                {statusConfig.label}
              </span>
            </div>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <User size={16} className="text-[#8C8C8C]" />
                <span className="text-[14px] text-gray-700">{content.author?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#8C8C8C]" />
                <span className="text-[14px] text-gray-700">
                  {new Date(content.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#8C8C8C]" />
                <span className="text-[14px] text-gray-700">{content.readingTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#8C8C8C]" />
                <span className="text-[14px] text-gray-700 capitalize">{content.category}</span>
              </div>
              {content.isPremium && (
                <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-[12px] font-medium">
                  Premium Content
                </span>
              )}
            </div>
            
            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <Tag size={16} className="text-[#8C8C8C]" />
                <div className="flex gap-2 flex-wrap">
                  {content.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-[12px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Feedback if rejected or revision */}
            {content.feedback && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-[16px]">
                <h3 className="font-semibold text-orange-800 mb-2">Editor Feedback</h3>
                <p className="text-orange-700 text-[14px]">{content.feedback}</p>
              </div>
            )}
            
            {/* Summary */}
            <div className="mb-6">
              <h2 className="font-serif text-[20px] font-semibold text-black mb-3">Summary</h2>
              <p className="text-[14px] text-[#636363] leading-relaxed">{content.summary}</p>
            </div>
            
            {/* Content */}
            <div>
              <h2 className="font-serif text-[20px] font-semibold text-black mb-3">Content</h2>
              <div className="prose max-w-none">
                <div className="text-[14px] text-[#636363] leading-relaxed whitespace-pre-wrap">
                  {content.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetailsPage;