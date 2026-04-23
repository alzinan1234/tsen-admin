// archiveApiClient.ts
import { BASE_URL, API_ENDPOINTS } from "./api";
import { TokenService } from "./apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Author {
  _id: string;
  name: string;
  email: string;
  profileImage: string;
}

export interface ArchiveItem {
  _id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  isPremium: boolean;
  status: string;
  author: Author;
  feedback: string | null;
  scheduledAt: string | null;
  readingTime: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ArchiveSummary {
  total: number;
  published: number;
  pending: number;
  rejected: number;
  revision: number;
}

export interface GetArchiveResponse {
  success: boolean;
  summary: ArchiveSummary;
  data: ArchiveItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetArchiveParams {
  type: "story" | "podcast" | "liveNews";
  status?: string;
  page: number;
  limit: number;
  search?: string;
}

// ─── Helper Functions ─────────────────────────────────────────────────────

const getAuthHeaders = (): HeadersInit => {
  const token = TokenService.getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

// ─── API Calls ────────────────────────────────────────────────────────────

/**
 * Get Archive (rejected/revision content)
 */
export async function getArchive(params: GetArchiveParams): Promise<GetArchiveResponse> {
  const { type, status, page, limit, search = "" } = params;
  const queryParams = new URLSearchParams({
    type,
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
    ...(search && { search }),
  });
  
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_GET_ARCHIVE}?${queryParams}`;
  
  console.log("Fetching archive from:", url);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data: GetArchiveResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch archive");
    }

    return data;
  } catch (error) {
    console.error("Get archive error:", error);
    throw error;
  }
}