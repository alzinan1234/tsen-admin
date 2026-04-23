// earningsApiClient.ts
import { BASE_URL, API_ENDPOINTS } from "./api";
import { TokenService } from "./apiClient";

export interface ChartDataPoint {
  label: string;
  revenue: number;
}

export interface EarningsData {
  period: string;
  totalRevenue: number;
  activeSubscribers: number;
  breakdown: {
    monthly: number;
    yearly: number;
  };
  chartData: ChartDataPoint[];
}

export interface GetEarningsResponse {
  success: boolean;
  data: EarningsData;
}

export type PeriodType = "daily" | "weekly" | "monthly" | "yearly";

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

export async function getEarnings(period: PeriodType): Promise<GetEarningsResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_GET_EARNINGS}?period=${period}`;
  
  console.log("Fetching earnings from:", url);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data: GetEarningsResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch earnings data");
    }

    return data;
  } catch (error) {
    console.error("Get earnings error:", error);
    throw error;
  }
}