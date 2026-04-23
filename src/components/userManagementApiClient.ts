// userManagementApiClient.ts
import { BASE_URL, API_ENDPOINTS } from "./api";
import { TokenService } from "./apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  isSubscribed: boolean;
  profileImage: string;
  phoneNumber: string | null;
  bio: string;
  isSocialLogin: boolean;
  city: string | null;
  age: number | null;
  interest: string;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetUserResponse {
  success: boolean;
  data: User;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export interface GetUsersParams {
  role: "reader" | "writer" | "editor";
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
 * Get Users by role with pagination
 */
export async function getUsers(params: GetUsersParams): Promise<GetUsersResponse> {
  const { role, page, limit, search = "" } = params;
  const queryParams = new URLSearchParams({
    role,
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_GET_USERS}?${queryParams}`;
  
  console.log("Fetching users from:", url);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data: GetUsersResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch users");
    }

    return data;
  } catch (error) {
    console.error("Get users error:", error);
    throw error;
  }
}

/**
 * Get User by ID
 */
export async function getUserById(id: string, role: string): Promise<GetUserResponse> {
  // Validate ID
  if (!id || id === "undefined") {
    throw new Error("Invalid user ID");
  }
  
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_GET_USER_BY_ID(id)}?role=${role}`;
  
  console.log("Fetching user from:", url);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data: GetUserResponse = await response.json();

    if (!data.success) {
      throw new Error(data as any || "Failed to fetch user");
    }

    return data;
  } catch (error) {
    console.error("Get user by ID error:", error);
    throw error;
  }
}

/**
 * Delete User
 */
export async function deleteUser(id: string, role: string): Promise<DeleteUserResponse> {
  // Validate ID
  if (!id || id === "undefined") {
    throw new Error("Invalid user ID");
  }
  
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_DELETE_USER(id)}?role=${role}`;
  
  console.log("Deleting user at:", url);
  
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const data: DeleteUserResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to delete user");
    }

    return data;
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
}