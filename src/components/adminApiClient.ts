// adminApiClient.ts
import { BASE_URL, API_ENDPOINTS } from "./api";
import { TokenService } from "./apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: AdminProfile;
  access_token: string;
  refresh_token: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface GetProfileResponse {
  success: boolean;
  data: AdminProfile;
}

export interface EditProfileResponse {
  success: boolean;
  message: string;
  data: AdminProfile;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface EditProfileParams {
  name?: string;
  profileImage?: File;
}

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

// ─── Helper Functions ─────────────────────────────────────────────────────

const getAuthHeaders = (isFormData: boolean = false): HeadersInit => {
  const token = TokenService.getAccessToken();
  const headers: HeadersInit = {
    "ngrok-skip-browser-warning": "true",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
};

// ─── Auth API Calls ────────────────────────────────────────────────────────

/**
 * Admin Login
 */
export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_LOGIN}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ email, password }),
    });

    const data: AdminLoginResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  } catch (error) {
    console.error("Admin login error:", error);
    throw error;
  }
}

/**
 * Admin Forgot Password - Send OTP
 */
export async function adminForgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_FORGOT_PASSWORD}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ email }),
    });

    const data: ForgotPasswordResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to send OTP");
    }

    return data;
  } catch (error) {
    console.error("Admin forgot password error:", error);
    throw error;
  }
}

/**
 * Admin Reset Password
 */
export async function adminResetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<ResetPasswordResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_RESET_PASSWORD}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data: ResetPasswordResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to reset password");
    }

    return data;
  } catch (error) {
    console.error("Admin reset password error:", error);
    throw error;
  }
}

/**
 * Get Admin Profile
 */
export async function getAdminProfile(): Promise<AdminProfile> {
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_GET_PROFILE}`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(false),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: GetProfileResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch profile");
    }

    return data.data;
  } catch (error) {
    console.error("Get admin profile error:", error);
    throw error;
  }
}

/**
 * Edit Admin Profile
 */
export async function editAdminProfile(params: EditProfileParams): Promise<EditProfileResponse> {
  const formData = new FormData();

  if (params.name) formData.append("name", params.name);
  if (params.profileImage) formData.append("profileImage", params.profileImage);

  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_EDIT_PROFILE}`;
  
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: EditProfileResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to update profile");
    }

    return data;
  } catch (error) {
    console.error("Edit admin profile error:", error);
    throw error;
  }
}

/**
 * Change Admin Password
 */
export async function changeAdminPassword(params: ChangePasswordParams): Promise<ChangePasswordResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.ADMIN_CHANGE_PASSWORD}`;
  const body = JSON.stringify({
    oldPassword: params.oldPassword,
    newPassword: params.newPassword,
  });
  
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeaders(false),
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: ChangePasswordResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to change password");
    }

    return data;
  } catch (error) {
    console.error("Change admin password error:", error);
    throw error;
  }
}