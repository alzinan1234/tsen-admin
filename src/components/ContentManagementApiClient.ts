// ContentManagementApiClient.ts
// All story-related API calls for the editor content management system

import { BASE_URL, API_ENDPOINTS } from "./api";
import { TokenService } from "./apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StoryStatus =
  | "pending"
  | "published"
  | "rejected"
  | "revision"
  | "scheduled";

export type StoryType = "story" | "podcast" | "live_news";

export interface StoryAuthor {
  _id: string;
  name: string;
  email: string;
  profileImage: string;
  bio?: string;
}

/** Shape returned by STORY_GET_ALL (list view – no content field) */
export interface StoryListItem {
  _id: string;
  title: string;
  summary: string;
  coverImage: string;
  category: string;
  tags: string[];
  isPremium: boolean;
  status: StoryStatus;
  author: StoryAuthor;
  feedback: string | null;
  scheduledAt: string | null;
  readingTime: number;
  type: StoryType;
  createdAt: string;
  updatedAt: string;
}

/** Shape returned by STORY_REVIEW (detail view – includes content field) */
export interface StoryDetail extends StoryListItem {
  content: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StoriesResponse {
  success: boolean;
  data: StoryListItem[];
  pagination: PaginationMeta;
}

export interface StoryDetailResponse {
  success: boolean;
  data: StoryDetail;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  data: {
    id?: string;
    _id?: string;
    status: StoryStatus;
    feedback?: string;
    scheduledAt?: string;
  };
}

export interface GetAllStoriesParams {
  status?: StoryStatus | "all";
  page?: number;
  limit?: number;
  search?: string;
  type?: StoryType | "all";
}

// ─── Core Auth-aware fetch ────────────────────────────────────────────────────

async function authFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = TokenService.getAccessToken();

  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
    ...(options.headers as Record<string, string>),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Only set Content-Type to JSON if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      (data as { message?: string })?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data as T;
}

// ─── Story API Functions ──────────────────────────────────────────────────────

/**
 * Get all stories with optional filters
 * GET /api/v1/story/editor/all?status=pending&page=1&limit=10
 */
export async function getAllStories(
  params: GetAllStoriesParams = {}
): Promise<StoriesResponse> {
  const query = new URLSearchParams();

  if (params.status && params.status !== "all")
    query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.type && params.type !== "all") query.set("type", params.type);
  if (params.search) query.set("search", params.search);

  const qs = query.toString();
  const url = `${BASE_URL}${API_ENDPOINTS.STORY_GET_ALL}${qs ? `?${qs}` : ""}`;

  return authFetch<StoriesResponse>(url, { method: "GET" });
}

/**
 * Get a single story for review (includes full content)
 * GET /api/v1/story/editor/review/:id
 */
export async function getStoryForReview(
  id: string
): Promise<StoryDetailResponse> {
  return authFetch<StoryDetailResponse>(
    `${BASE_URL}${API_ENDPOINTS.STORY_REVIEW(id)}`,
    { method: "GET" }
  );
}

/**
 * Approve & immediately publish a story
 * PATCH /api/v1/story/editor/approve/:id  (no body)
 */
export async function approveStory(id: string): Promise<ActionResponse> {
  return authFetch<ActionResponse>(
    `${BASE_URL}${API_ENDPOINTS.STORY_APPROVE(id)}`,
    { method: "PATCH" }
  );
}

/**
 * Approve & schedule a story for later publication
 * PATCH /api/v1/story/editor/schedule/:id
 * Body: { scheduledAt: ISO date string }
 */
export async function scheduleStory(
  id: string,
  scheduledAt: string
): Promise<ActionResponse> {
  return authFetch<ActionResponse>(
    `${BASE_URL}${API_ENDPOINTS.STORY_SCHEDULE(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ scheduledAt }),
    }
  );
}

/**
 * Reject a story with feedback
 * PATCH /api/v1/story/editor/reject/:id
 * Body: { feedback: string }
 */
export async function rejectStory(
  id: string,
  feedback: string
): Promise<ActionResponse> {
  return authFetch<ActionResponse>(
    `${BASE_URL}${API_ENDPOINTS.STORY_REJECT(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ feedback }),
    }
  );
}

/**
 * Request revision from the writer with feedback
 * PATCH /api/v1/story/editor/request-revision/:id
 * Body: { feedback: string }
 */
export async function requestRevision(
  id: string,
  feedback: string
): Promise<ActionResponse> {
  return authFetch<ActionResponse>(
    `${BASE_URL}${API_ENDPOINTS.STORY_REQUEST_REVISION(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ feedback }),
    }
  );
}

/**
 * Edit a story (editor can update content, isPremium, coverImage)
 * PATCH /api/v1/story/editor/edit/:id
 * multipart/form-data: isPremium (text), content (text), coverImage? (file)
 */
export async function editStory(
  id: string,
  payload: {
    isPremium?: boolean;
    content?: string;
    coverImage?: File | null;
  }
): Promise<{ success: boolean; message: string; data: StoryDetail }> {
  const formData = new FormData();

  if (payload.isPremium !== undefined)
    formData.append("isPremium", String(payload.isPremium));
  if (payload.content !== undefined)
    formData.append("content", payload.content);
  if (payload.coverImage instanceof File)
    formData.append("coverImage", payload.coverImage);

  return authFetch<{ success: boolean; message: string; data: StoryDetail }>(
    `${BASE_URL}${API_ENDPOINTS.STORY_EDIT(id)}`,
    {
      method: "PATCH",
      body: formData,
      // NOTE: Do NOT set Content-Type manually for FormData —
      // the browser sets it with the correct boundary automatically.
    }
  );
}