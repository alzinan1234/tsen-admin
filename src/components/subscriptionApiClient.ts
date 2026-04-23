// subscriptionApiClient.ts
import { BASE_URL, API_ENDPOINTS } from "./api";
import { TokenService } from "./apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Plan {
  _id: string;
  planType: "monthly" | "yearly";
  price: number;
  stripePriceId: string;
  stripeProductId: string;
  currency: string;
  isActive: boolean;
  features: string[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface GetPlansResponse {
  success: boolean;
  data: Plan[];
}

export interface UpdatePlanResponse {
  success: boolean;
  message: string;
  data: Plan;
}

export interface UpdatePlanParams {
  price: number;
  features: string[];
}

export interface Subscriber {
  _id: string;
  userId: string;
  planId: string;
  status: "active" | "canceled" | "past_due";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetSubscribersResponse {
  success: boolean;
  data: Subscriber[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SubscriptionStats {
  totalActive: number;
  totalCanceled: number;
  totalPastDue: number;
  monthlySubscribers: number;
  yearlySubscribers: number;
  estimatedMRR: number;
  plans: {
    monthly: {
      price: number;
      stripePriceId: string;
      isActive: boolean;
    };
    yearly: {
      price: number;
      stripePriceId: string;
      isActive: boolean;
    };
  };
}

export interface GetSubscriptionStatsResponse {
  success: boolean;
  data: SubscriptionStats;
}

export interface GetSubscribersParams {
  page: number;
  limit: number;
  status?: "active" | "canceled" | "past_due";
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
 * Get all subscription plans
 */
export async function getPlans(): Promise<GetPlansResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_GET_PLANS}`;
  
  console.log("Fetching plans from:", url);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data: GetPlansResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch plans");
    }

    return data;
  } catch (error) {
    console.error("Get plans error:", error);
    throw error;
  }
}

/**
 * Update monthly plan
 */
export async function updateMonthlyPlan(params: UpdatePlanParams): Promise<UpdatePlanResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_UPDATE_MONTHLY_PLAN}`;
  
  console.log("Updating monthly plan at:", url);
  
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        price: params.price,
        features: params.features,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data: UpdatePlanResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to update monthly plan");
    }

    return data;
  } catch (error) {
    console.error("Update monthly plan error:", error);
    throw error;
  }
}

/**
 * Update yearly plan
 */
export async function updateYearlyPlan(params: UpdatePlanParams): Promise<UpdatePlanResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_UPDATE_YEARLY_PLAN}`;
  
  console.log("Updating yearly plan at:", url);
  
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        price: params.price,
        features: params.features,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data: UpdatePlanResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to update yearly plan");
    }

    return data;
  } catch (error) {
    console.error("Update yearly plan error:", error);
    throw error;
  }
}

/**
 * Get subscribers with pagination
 */
export async function getSubscribers(params: GetSubscribersParams): Promise<GetSubscribersResponse> {
  const { page, limit, status } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
  });
  
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_GET_SUBSCRIBERS}?${queryParams}`;
  
  console.log("Fetching subscribers from:", url);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data: GetSubscribersResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch subscribers");
    }

    return data;
  } catch (error) {
    console.error("Get subscribers error:", error);
    throw error;
  }
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats(): Promise<GetSubscriptionStatsResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_GET_SUBSCRIPTION_STATS}`;
  
  console.log("Fetching subscription stats from:", url);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data: GetSubscriptionStatsResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch subscription stats");
    }

    return data;
  } catch (error) {
    console.error("Get subscription stats error:", error);
    throw error;
  }
}