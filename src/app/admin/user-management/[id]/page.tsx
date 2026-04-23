// app/admin/users/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  BookOpen,
  UserCheck,
  Shield,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { getUserById, deleteUser, User } from "@/components/userManagementApiClient";

const UserDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Get the id from params - Fix for Next.js App Router
  const userId = params?.id as string;
  const role = searchParams?.get("role") || "reader";
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (userId && userId !== "undefined") {
      fetchUserDetails();
    } else {
      setError("Invalid user ID");
      setLoading(false);
    }
  }, [userId, role]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching user with ID:", userId, "Role:", role);
      const response = await getUserById(userId, role);
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setError(err instanceof Error ? err.message : "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    
    try {
      setDeleting(true);
      await deleteUser(userId, role);
      router.push("/admin/user-management");
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#3448D6]" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="bg-white rounded-[20px] p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h2 className="font-serif text-[20px] font-semibold text-black mb-2">
            User Not Found
          </h2>
          <p className="text-[#8C8C8C] text-sm mb-6">{error || "Unable to load user details"}</p>
          <button
            onClick={() => router.push("/admin/user-management")}
            className="px-4 py-2 bg-[#3448D6] text-white rounded-[8px] text-sm hover:opacity-90"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/admin/user-management")}
            className="flex items-center gap-2 text-[#8C8C8C] hover:text-[#3448D6] transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-[14px]">Back to Users</span>
          </button>
          
          <button
            onClick={handleDeleteUser}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-[12px] text-[14px] font-medium hover:bg-red-100 transition-all disabled:opacity-50"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {deleting ? "Deleting..." : "Delete User"}
          </button>
        </div>

        {/* User Profile Header */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.profileImage || "/placeholder-avatar.png"}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-avatar.png";
                }}
              />
              <div
                className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${
                  user.isVerified ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="font-serif text-[32px] font-bold text-black">{user.name}</h1>
                {user.isVerified && (
                  <span className="flex items-center gap-1 text-[12px] px-2 py-1 bg-green-50 text-green-600 rounded-full">
                    <CheckCircle size={12} />
                    Verified
                  </span>
                )}
                {user.isSocialLogin && (
                  <span className="text-[12px] px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                    Social Login
                  </span>
                )}
                {user.isSubscribed && (
                  <span className="text-[12px] px-2 py-1 bg-purple-50 text-purple-600 rounded-full">
                    Premium Member
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-[14px] text-[#8C8C8C] mb-2">
                <Mail size={14} />
                <span>{user.email}</span>
              </div>
              
              <div className="flex items-center gap-4 text-[13px] text-[#B5B5B5]">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen size={12} />
                  <span>Following {user.followingCount} users</span>
                </div>
              </div>
            </div>

            {/* Role Badge */}
            <div className="px-4 py-2 bg-[#E9ECFF] rounded-[12px]">
              <div className="flex items-center gap-2">
                {role === "reader" && <Users size={16} className="text-[#3448D6]" />}
                {role === "writer" && <BookOpen size={16} className="text-[#3448D6]" />}
                {role === "editor" && <UserCheck size={16} className="text-[#3448D6]" />}
                <span className="font-serif text-[16px] font-semibold text-[#3448D6] capitalize">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-[20px] border border-gray-100 p-6">
            <h2 className="font-serif text-[18px] font-semibold text-black mb-4 flex items-center gap-2">
              <UserCheck size={18} className="text-[#3448D6]" />
              Personal Information
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-[13px] text-[#8C8C8C]">Full Name</span>
                <span className="text-[13px] text-black font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-[13px] text-[#8C8C8C]">Email Address</span>
                <span className="text-[13px] text-black font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-[13px] text-[#8C8C8C]">Phone Number</span>
                <span className="text-[13px] text-black font-medium">
                  {user.phoneNumber || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-[13px] text-[#8C8C8C]">Age</span>
                <span className="text-[13px] text-black font-medium">
                  {user.age || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-[13px] text-[#8C8C8C]">City</span>
                <span className="text-[13px] text-black font-medium">
                  {user.city || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-[13px] text-[#8C8C8C]">Interest</span>
                <span className="text-[13px] text-black font-medium capitalize">
                  {user.interest}
                </span>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-[20px] border border-gray-100 p-6">
            <h2 className="font-serif text-[18px] font-semibold text-black mb-4 flex items-center gap-2">
              <Shield size={18} className="text-[#3448D6]" />
              Account Information
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-[13px] text-[#8C8C8C]">Account Status</span>
                <span className={`text-[13px] font-medium ${user.isVerified ? "text-green-600" : "text-orange-500"}`}>
                  {user.isVerified ? "Verified" : "Not Verified"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-[13px] text-[#8C8C8C]">Subscription</span>
                <span className={`text-[13px] font-medium ${user.isSubscribed ? "text-purple-600" : "text-gray-500"}`}>
                  {user.isSubscribed ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-[13px] text-[#8C8C8C]">Login Method</span>
                <span className="text-[13px] text-black font-medium">
                  {user.isSocialLogin ? "Social Login" : "Email/Password"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-[13px] text-[#8C8C8C]">Following Count</span>
                <span className="text-[13px] text-black font-medium">{user.followingCount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-[13px] text-[#8C8C8C]">Member Since</span>
                <span className="text-[13px] text-black font-medium">
                  {formatDate(user.createdAt)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[13px] text-[#8C8C8C]">Last Updated</span>
                <span className="text-[13px] text-black font-medium">
                  {formatDate(user.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="md:col-span-2 bg-white rounded-[20px] border border-gray-100 p-6">
            <h2 className="font-serif text-[18px] font-semibold text-black mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-[#3448D6]" />
              Bio
            </h2>
            <p className="text-[14px] text-[#636363] leading-relaxed">
              {user.bio || "No bio provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;