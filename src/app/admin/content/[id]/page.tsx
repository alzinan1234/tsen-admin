"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Edit3,
  Clock,
  MessageSquare,
  XCircle,
  CheckCircle2,
  ChevronDown,
  Save,
  X,
  AlertCircle,
  Info,
  Upload,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getStoryForReview,
  approveStory,
  scheduleStory,
  rejectStory,
  requestRevision,
  editStory,
  StoryDetail,
} from "@/components/ContentManagementApiClient";

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info";
interface Toast { id: string; type: ToastType; message: string }

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

const ToastContainer = ({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) => (
  <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 min-w-[320px]">
    {toasts.map((t) => (
      <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-[10px] border shadow-md font-serif text-[13px] ${TOAST_STYLES[t.type]}`}>
        {TOAST_ICONS[t.type]}
        <span className="flex-1">{t.message}</span>
        <button onClick={() => remove(t.id)}><X size={14} /></button>
      </div>
    ))}
  </div>
);

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const remove = (id: string) => setToasts((p) => p.filter((t) => t.id !== id));
  const show = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => remove(id), 4500);
  };
  return { toasts, show, remove };
}

// ─── Feedback Modal (for Reject / Request Revision) ───────────────────────────

interface FeedbackModalProps {
  open: boolean;
  title: string;
  placeholder: string;
  confirmLabel: string;
  confirmClass: string;
  loading: boolean;
  onConfirm: (feedback: string) => void;
  onCancel: () => void;
}

const FeedbackModal = ({
  open, title, placeholder, confirmLabel, confirmClass, loading, onConfirm, onCancel,
}: FeedbackModalProps) => {
  const [feedback, setFeedback] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-xl p-8 w-full max-w-[480px] border border-gray-100">
        <h3 className="font-serif text-[20px] font-semibold text-black mb-3">{title}</h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full p-4 border border-gray-200 rounded-[12px] font-serif text-[14px] text-gray-700 focus:outline-none focus:border-[#3448D6] resize-none transition-colors mb-6"
        />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 border border-gray-200 rounded-full font-serif text-sm text-gray-600 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button
            disabled={!feedback.trim() || loading}
            onClick={() => onConfirm(feedback.trim())}
            className={`flex-1 py-3 rounded-full font-serif text-sm text-white font-medium transition-all disabled:opacity-50 ${confirmClass}`}
          >
            {loading ? "Submitting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Schedule Modal ───────────────────────────────────────────────────────────

interface ScheduleModalProps {
  open: boolean;
  loading: boolean;
  onConfirm: (date: string) => void;
  onCancel: () => void;
}

const ScheduleModal = ({ open, loading, onConfirm, onCancel }: ScheduleModalProps) => {
  const [dateValue, setDateValue] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-xl p-8 w-full max-w-[420px] border border-gray-100">
        <h3 className="font-serif text-[20px] font-semibold text-black mb-2">Schedule Publication</h3>
        <p className="font-serif text-[13px] text-gray-400 mb-6">Choose a date and time to publish this story.</p>
        <div className="mb-6">
          <label className="font-serif text-[12px] text-gray-400 mb-2 block">Publication Date & Time</label>
          <input
            type="datetime-local"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-[12px] font-serif text-[14px] focus:outline-none focus:border-[#3448D6] transition-colors"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 border border-gray-200 rounded-full font-serif text-sm text-gray-600 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button
            disabled={!dateValue || loading}
            onClick={() => onConfirm(new Date(dateValue).toISOString())}
            className="flex-1 py-3 bg-[#3448D6] rounded-full font-serif text-sm text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Scheduling..." : "Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonBlock = ({ h = "h-4", w = "w-full" }: { h?: string; w?: string }) => (
  <div className={`${h} ${w} bg-gray-100 rounded-full animate-pulse`} />
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = ["Technology", "Business", "Politics", "Health", "Sports", "Entertainment", "Science", "Culture"];

const ContentReviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toasts, show, remove } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const id = params?.id as string;

  const [story, setStory] = useState<StoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editIsPremium, setEditIsPremium] = useState(false);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);

  // Modal state
  const [feedbackModal, setFeedbackModal] = useState<{
    open: boolean;
    type: "reject" | "revision";
  }>({ open: false, type: "reject" });
  const [scheduleModal, setScheduleModal] = useState(false);

  const activeGradient = "linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)";

  // ── Load story ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getStoryForReview(id);
        if (res.success) {
          setStory(res.data);
          setEditContent(res.data.content);
          setEditIsPremium(res.data.isPremium);
        }
      } catch (err: unknown) {
        show("error", err instanceof Error ? err.message : "Failed to load story.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditCoverFile(file);
    setEditCoverPreview(URL.createObjectURL(file));
  };

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleSaveEdit = async () => {
    if (!story) return;
    setActionLoading("edit");
    try {
      const res = await editStory(story._id, {
        isPremium: editIsPremium,
        content: editContent,
        coverImage: editCoverFile,
      });
      if (res.success) {
        setStory(res.data);
        setIsEditing(false);
        setEditCoverFile(null);
        setEditCoverPreview(null);
        show("success", res.message || "Story updated successfully.");
      }
    } catch (err: unknown) {
      show("error", err instanceof Error ? err.message : "Edit failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async () => {
    if (!story) return;
    setActionLoading("approve");
    try {
      const res = await approveStory(story._id);
      if (res.success) {
        show("success", res.message || "Story approved and published!");
        setStory((s) => s ? { ...s, status: "published" } : s);
      }
    } catch (err: unknown) {
      show("error", err instanceof Error ? err.message : "Approval failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSchedule = async (scheduledAt: string) => {
    if (!story) return;
    setActionLoading("schedule");
    try {
      const res = await scheduleStory(story._id, scheduledAt);
      if (res.success) {
        show("success", res.message || "Story scheduled successfully.");
        setStory((s) => s ? { ...s, status: "scheduled", scheduledAt: res.data.scheduledAt ?? null } : s);
        setScheduleModal(false);
      }
    } catch (err: unknown) {
      show("error", err instanceof Error ? err.message : "Scheduling failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    if (!story) return;
    const isReject = feedbackModal.type === "reject";
    setActionLoading(isReject ? "reject" : "revision");
    try {
      const res = isReject
        ? await rejectStory(story._id, feedback)
        : await requestRevision(story._id, feedback);
      if (res.success) {
        show(isReject ? "warning" : "info", res.message || (isReject ? "Story rejected." : "Revision requested."));
        setStory((s) => s ? { ...s, status: res.data.status, feedback: res.data.feedback ?? null } : s);
        setFeedbackModal({ open: false, type: "reject" });
      }
    } catch (err: unknown) {
      show("error", err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const coverSrc = editCoverPreview ?? story?.coverImage;
  const isPublished = story?.status === "published";

  return (
    <>
      <ToastContainer toasts={toasts} remove={remove} />

      <FeedbackModal
        open={feedbackModal.open}
        title={feedbackModal.type === "reject" ? "Reject Story" : "Request Revision"}
        placeholder={
          feedbackModal.type === "reject"
            ? "Explain why this story is being rejected..."
            : "Describe what needs to be revised..."
        }
        confirmLabel={feedbackModal.type === "reject" ? "Reject" : "Send Request"}
        confirmClass={feedbackModal.type === "reject" ? "bg-[#EE264F] hover:opacity-90" : "bg-[#3448D6] hover:opacity-90"}
        loading={actionLoading === "reject" || actionLoading === "revision"}
        onConfirm={handleFeedbackSubmit}
        onCancel={() => setFeedbackModal({ open: false, type: "reject" })}
      />

      <ScheduleModal
        open={scheduleModal}
        loading={actionLoading === "schedule"}
        onConfirm={handleSchedule}
        onCancel={() => setScheduleModal(false)}
      />

      <div className="mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/editor/content"
              className="p-2 bg-[#E2E4F0] text-[#3448D6] rounded-full hover:bg-[#d0d4f0] transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-serif text-[22px] font-semibold text-black tracking-tight">
                Content Review
              </h1>
              {story && (
                <span className={`text-[12px] font-serif capitalize px-2 py-0.5 rounded-full ${
                  story.status === "published" ? "bg-green-100 text-green-600" :
                  story.status === "pending" ? "bg-black text-white" :
                  story.status === "rejected" ? "bg-red-100 text-red-500" :
                  story.status === "revision" ? "bg-yellow-100 text-yellow-600" :
                  "bg-blue-100 text-blue-600"
                }`}>
                  {story.status === "revision" ? "Needs Revision" : story.status}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main Content ── */}
          <div className="lg:col-span-2 bg-white rounded-[24px] p-8 border border-gray-50 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-[24px] font-semibold">Content Details</h2>
              {!isPublished && (
                isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setIsEditing(false); setEditCoverFile(null); setEditCoverPreview(null); }}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-[10px] font-serif text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <X size={15} /> Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={actionLoading === "edit"}
                      className="flex items-center gap-2 px-4 py-2 rounded-[10px] font-serif text-sm text-white font-medium hover:opacity-90 transition-colors disabled:opacity-60"
                      style={{ background: activeGradient }}
                    >
                      <Save size={15} />
                      {actionLoading === "edit" ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-[10px] font-serif text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                )
              )}
            </div>

            {/* Cover Image */}
            {loading ? (
              <div className="w-full aspect-[16/9] bg-gray-100 rounded-[16px] animate-pulse" />
            ) : (
              <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-[16px] overflow-hidden group">
                {coverSrc && (
                  <img src={coverSrc} alt="Cover" className="w-full h-full object-cover" />
                )}
                {isEditing && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Upload size={28} className="text-white mb-2" />
                    <p className="text-white font-serif text-sm">Click to change cover</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>
            )}

            {/* Title */}
            {loading ? (
              <div className="space-y-2">
                <SkeletonBlock h="h-7" w="w-3/4" />
                <SkeletonBlock h="h-7" w="w-1/2" />
              </div>
            ) : (
              <h3 className="font-serif text-[24px] font-bold leading-tight">
                {story?.title}
              </h3>
            )}

            {/* Content */}
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonBlock key={i} h="h-4" w={i % 3 === 2 ? "w-4/5" : "w-full"} />
                ))
              ) : isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={14}
                  className="w-full p-4 border border-gray-200 rounded-[12px] font-serif text-[14px] text-gray-700 leading-relaxed focus:outline-none focus:border-[#3448D6] resize-none transition-colors"
                />
              ) : (
                <div className="font-serif text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
                  {story?.content}
                </div>
              )}
            </div>

            {/* Feedback (if any) */}
            {story?.feedback && !isEditing && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-[12px]">
                <p className="font-serif text-[12px] text-yellow-600 font-semibold mb-1 uppercase tracking-wide">
                  Editor Feedback
                </p>
                <p className="font-serif text-[14px] text-yellow-700">{story.feedback}</p>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Metadata */}
            <div className="bg-white rounded-[24px] p-8 border border-gray-50 shadow-sm space-y-6">
              <h3 className="font-serif text-[20px] font-semibold">Metadata</h3>

              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <SkeletonBlock h="h-3" w="w-1/4" />
                      <SkeletonBlock h="h-10" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-serif text-[12px] text-gray-400">Submitted</label>
                    <div className="w-full p-4 border border-gray-100 rounded-[12px] font-serif text-sm text-gray-700">
                      {story ? formatDate(story.createdAt) : "—"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-serif text-[12px] text-gray-400">Writer</label>
                    <div className="w-full p-4 border border-gray-100 rounded-[12px] font-serif text-sm flex items-center gap-3">
                      {story?.author?.profileImage && (
                        <img
                          src={story.author.profileImage}
                          className="w-7 h-7 rounded-full object-cover"
                          alt={story.author.name}
                        />
                      )}
                      <div>
                        <p className="text-gray-700 font-medium">{story?.author?.name}</p>
                        <p className="text-gray-400 text-[12px]">{story?.author?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-serif text-[12px] text-gray-400">Type</label>
                    <div className="w-full p-4 border border-gray-100 rounded-[12px] font-serif text-sm text-gray-700 capitalize">
                      {story?.type?.replace("_", " ")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-serif text-[12px] text-gray-400">Tags</label>
                    <div className="w-full p-4 border border-gray-100 rounded-[12px] flex flex-wrap gap-2">
                      {story?.tags?.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-[#E2E4F0] text-[#3448D6] rounded-full text-[12px] font-serif">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Premium toggle */}
                  <div className="flex items-center justify-between py-2">
                    <span className="font-serif text-sm font-medium">Premium Story</span>
                    <button
                      disabled={!isEditing}
                      onClick={() => setEditIsPremium((v) => !v)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        (isEditing ? editIsPremium : story?.isPremium)
                          ? "bg-[#3448D6]"
                          : "bg-gray-200"
                      } ${!isEditing ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        (isEditing ? editIsPremium : story?.isPremium) ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="font-serif text-[12px] text-gray-400">Category</label>
                    <div className="w-full p-4 border border-gray-100 rounded-[12px] font-serif text-sm text-gray-700 capitalize">
                      {story?.category}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-serif text-[12px] text-gray-400">Reading Time</label>
                    <div className="w-full p-4 border border-gray-100 rounded-[12px] font-serif text-sm text-gray-700">
                      {story?.readingTime} min read
                    </div>
                  </div>

                  {story?.scheduledAt && (
                    <div className="space-y-2">
                      <label className="font-serif text-[12px] text-gray-400">Scheduled For</label>
                      <div className="w-full p-4 border border-blue-100 bg-blue-50 rounded-[12px] font-serif text-sm text-blue-700 flex items-center gap-2">
                        <Calendar size={14} />
                        {formatDate(story.scheduledAt)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {!loading && !isPublished && (
              <div className="bg-white rounded-[24px] p-8 border border-gray-50 shadow-sm space-y-3">
                <h3 className="font-serif text-[20px] font-semibold">Actions</h3>

                {/* Approve & Schedule */}
                <button
                  disabled={!!actionLoading}
                  onClick={() => setScheduleModal(true)}
                  className="w-full py-4 border border-black rounded-full font-serif text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  <Clock size={18} />
                  Approve & Schedule
                </button>

                {/* Request Revision */}
                <button
                  disabled={!!actionLoading}
                  onClick={() => setFeedbackModal({ open: true, type: "revision" })}
                  className="w-full py-4 border border-black rounded-full font-serif text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  <MessageSquare size={18} />
                  Request Revision
                </button>

                {/* Reject */}
                <button
                  disabled={!!actionLoading}
                  onClick={() => setFeedbackModal({ open: true, type: "reject" })}
                  className="w-full py-4 bg-[#EE264F] text-white rounded-full font-serif text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-red-100 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <XCircle size={18} />
                  {actionLoading === "reject" ? "Rejecting..." : "Reject"}
                </button>

                {/* Approve & Publish */}
                <button
                  disabled={!!actionLoading}
                  onClick={handleApprove}
                  className="w-full py-4 text-white rounded-full font-serif text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:opacity-90 transition-all disabled:opacity-50"
                  style={{ background: activeGradient }}
                >
                  <CheckCircle2 size={18} />
                  {actionLoading === "approve" ? "Publishing..." : "Approve & Publish"}
                </button>
              </div>
            )}

            {/* Published state */}
            {!loading && isPublished && (
              <div className="bg-green-50 rounded-[24px] p-6 border border-green-100 text-center">
                <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" strokeWidth={1.5} />
                <p className="font-serif text-[15px] font-semibold text-green-700">Story Published</p>
                <p className="font-serif text-[13px] text-green-500 mt-1">This story is live for readers.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentReviewPage;