// editorProfileApiClient.ts
import { BASE_URL, API_ENDPOINTS } from "./api";
import { TokenService } from "./apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface EditorProfile {
  _id: string;
  name: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetProfileResponse {
  success: boolean;
  data: EditorProfile;
}

export interface EditProfileResponse {
  success: boolean;
  message: string;
  data: EditorProfile;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface EditProfileParams {
  name?: string;
  phone?: string;
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

// ─── API Calls ────────────────────────────────────────────────────────────

/**
 * Get editor profile
 */
export async function getEditorProfile(): Promise<EditorProfile> {
  const url = `${BASE_URL}${API_ENDPOINTS.EDITOR_GET_PROFILE}`;
  console.log("Fetching profile from:", url);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(false),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: GetProfileResponse = await response.json();
    console.log("Profile data:", data);

    if (!data.success) {
      throw new Error(data as any || "Failed to fetch profile");
    }

    return data.data;
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
}

/**
 * Edit editor profile (with optional image upload)
 */
export async function editEditorProfile(params: EditProfileParams): Promise<EditProfileResponse> {
  const formData = new FormData();

  if (params.name) formData.append("name", params.name);
  if (params.phone) formData.append("phone", params.phone);
  if (params.profileImage) formData.append("profileImage", params.profileImage);

  const url = `${BASE_URL}${API_ENDPOINTS.EDITOR_EDIT_PROFILE}`;
  console.log("Updating profile at:", url);
  console.log("Form data entries:", Array.from(formData.entries()));

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: formData,
    });

    console.log("Update response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: EditProfileResponse = await response.json();
    console.log("Update response:", data);

    if (!data.success) {
      throw new Error(data.message || "Failed to update profile");
    }

    return data;
  } catch (error) {
    console.error("Edit profile error:", error);
    throw error;
  }
}

/**
 * Change editor password
 */
export async function changeEditorPassword(params: ChangePasswordParams): Promise<ChangePasswordResponse> {
  const url = `${BASE_URL}${API_ENDPOINTS.EDITOR_CHANGE_PASSWORD}`;
  const body = JSON.stringify({
    oldPassword: params.oldPassword,
    newPassword: params.newPassword,
  });
  
  console.log("Changing password at:", url);
  console.log("Request body:", { oldPassword: "***", newPassword: "***" });

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeaders(false),
      body: body,
    });

    console.log("Password change response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data: ChangePasswordResponse = await response.json();
    console.log("Password change response:", data);

    if (!data.success) {
      throw new Error(data.message || "Failed to change password");
    }

    return data;
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
}