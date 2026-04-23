// dashboardStatsApiClient.ts
import { BASE_URL, API_ENDPOINTS } from "./api";
import { TokenService } from "./apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  users: {
    readers: number;
    writers: number;
    editors: number;
  };
  subscriptions: {
    active: number;
    total: number;
    totalEarning: number;
  };
  content: {
    stories: {
      total: number;
      published: number;
    };
    podcasts: {
      total: number;
      published: number;
    };
    liveNews: {
      total: number;
      published: number;
    };
  };
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
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
 * Get Dashboard Statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_DASHBOARD_STATS}`;
  
  console.log("Fetching dashboard stats from:", url); // Debug log
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    console.log("Response status:", response.status); // Debug log

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText); // Debug log
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data: DashboardStatsResponse = await response.json();
    console.log("Dashboard stats response:", data); // Debug log

    if (!data.success) {
      throw new Error(data as any || "Failed to fetch dashboard stats");
    }

    return data.data;
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    throw error;
  }
}