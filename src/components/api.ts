// api.ts
export const BASE_URL = "https://katheleen-unerrant-consolingly.ngrok-free.dev";

export const API_ENDPOINTS = {
  // ─── Admin Auth ───────────────────────────────────────────────────────────
  ADMIN_LOGIN: "/api/v1/admin/auth/login",
  ADMIN_FORGOT_PASSWORD: "/api/v1/admin/auth/forgot-password",
  ADMIN_RESET_PASSWORD: "/api/v1/admin/auth/reset-password",

  // ─── Admin Profile ────────────────────────────────────────────────────────
  ADMIN_GET_PROFILE: "/api/v1/admin/profile/get-profile",
  ADMIN_EDIT_PROFILE: "/api/v1/admin/profile/edit",
  ADMIN_CHANGE_PASSWORD: "/api/v1/admin/profile/change-password",

  // ─── Admin Dashboard ──────────────────────────────────────────────────────
  ADMIN_DASHBOARD_STATS: "/api/v1/admin/dashboard/stats",

  // ─── Admin User Management ────────────────────────────────────────────────
  ADMIN_GET_USERS: "/api/v1/admin/dashboard/users",
  ADMIN_GET_USER_BY_ID: (id: string) => `/api/v1/admin/dashboard/users/${id}`,
  ADMIN_DELETE_USER: (id: string) => `/api/v1/admin/dashboard/users/${id}`,

  // ─── Admin Archive (Content Management) ───────────────────────────────────
  ADMIN_GET_ARCHIVE: "/api/v1/admin/dashboard/archive",

  // ─── Admin Subscription Management ────────────────────────────────────────
  ADMIN_GET_PLANS: "/api/v1/admin/subscription/plans",
  ADMIN_UPDATE_MONTHLY_PLAN: "/api/v1/admin/subscription/plans/monthly",
  ADMIN_UPDATE_YEARLY_PLAN: "/api/v1/admin/subscription/plans/yearly",
  ADMIN_GET_SUBSCRIBERS: "/api/v1/admin/subscription/subscribers",
  ADMIN_GET_SUBSCRIPTION_STATS: "/api/v1/admin/subscription/stats",

  // ─── Admin Earnings/Revenue ───────────────────────────────────────────────
  ADMIN_GET_EARNINGS: "/api/v1/admin/dashboard/earnings",
} as const;