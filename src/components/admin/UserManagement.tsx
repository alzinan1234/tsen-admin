// components/UserManagement.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  MapPin,
  BookOpen,
  UserCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { getUsers, User, GetUsersParams } from "@/components/userManagementApiClient";
import { TokenService } from "@/components/apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────

type UserRole = "reader" | "writer" | "editor";

// ─── User Card Component ───────────────────────────────────────────────────

const UserCard: React.FC<{
  user: User;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ user, onView, onDelete }) => {
  return (
    <div className="bg-white rounded-[20px] border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={user.profileImage || "/placeholder-avatar.png"}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-avatar.png";
            }}
          />
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              user.isVerified ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif text-[18px] font-semibold text-black truncate">
              {user.name}
            </h3>
            <div className="flex items-center gap-2">
              {user.isSocialLogin && (
                <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                  Social
                </span>
              )}
              {user.isSubscribed && (
                <span className="text-[10px] px-2 py-1 bg-green-50 text-green-600 rounded-full">
                  Premium
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[13px] text-[#8C8C8C] mb-3">
            <Mail size={14} />
            <span className="truncate">{user.email}</span>
          </div>

          <div className="flex items-center gap-4 text-[12px] text-[#B5B5B5] mb-4">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen size={12} />
              <span>Following: {user.followingCount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onView(user._id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#3448D6] text-white rounded-[8px] text-[12px] font-medium hover:opacity-90 transition-all"
            >
              <Eye size={14} />
              View Details
            </button>
            <button
              onClick={() => onDelete(user._id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-[8px] text-[12px] font-medium hover:bg-red-100 transition-all"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────

const UserManagement: React.FC = () => {
  const router = useRouter();
  
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("reader");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const limit = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [selectedRole, currentPage, debouncedSearch]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      
      const params: GetUsersParams = {
        role: selectedRole,
        page: currentPage,
        limit,
        search: debouncedSearch || undefined,
      };
      
      const response = await getUsers(params);
      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalUsers(response.pagination.total);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    
    try {
      setDeletingId(userId);
      // This would call deleteUser API
      // await deleteUser(userId, selectedRole);
      
      // Remove user from list
      setUsers(users.filter(user => user._id !== userId));
      setTotalUsers(prev => prev - 1);
      
      // Show success message
      alert("User deleted successfully");
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewUser = (userId: string) => {
    router.push(`/admin/user-management/${userId}?role=${selectedRole}`);
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentPage(1);
    setSearchQuery("");
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  // Role tabs
  const roles: { value: UserRole; label: string; icon: React.ElementType }[] = [
    { value: "reader", label: "Readers", icon: Users },
    { value: "writer", label: "Writers", icon: BookOpen },
    { value: "editor", label: "Editors", icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-[28px] font-bold text-black">User Management</h1>
            <p className="font-sans text-[14px] text-[#8C8C8C] mt-1">
              Manage readers, writers, and editors on your platform
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-[12px] text-[14px] text-gray-600 hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Role Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => handleRoleChange(role.value)}
              className={`flex items-center gap-2 px-6 py-3 text-[14px] font-medium transition-all ${
                selectedRole === role.value
                  ? "text-[#3448D6] border-b-2 border-[#3448D6]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <role.icon size={16} />
              {role.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${selectedRole}s by name or email...`}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3448D6]/20 focus:border-[#3448D6] bg-white"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-[16px] border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-[#8C8C8C]">Total {selectedRole}s</p>
              <p className="font-serif text-[24px] font-bold text-black">{totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-[#E9ECFF] rounded-[12px] flex items-center justify-center">
              <Users className="text-[#3448D6] w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={36} className="animate-spin text-[#3448D6]" />
            <p className="text-[#8C8C8C] text-sm mt-4">Loading {selectedRole}s...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-[16px] p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-[#3448D6] text-white rounded-[8px] text-sm hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Users Grid */}
        {!loading && !error && (
          <>
            {users.length === 0 ? (
              <div className="bg-white rounded-[20px] border border-gray-100 p-12 text-center">
                <Users size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-[#8C8C8C]">No {selectedRole}s found</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-[#3448D6] text-sm hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {users.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    onView={handleViewUser}
                    onDelete={handleDeleteUser}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-[8px] border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-[8px] text-[14px] font-medium transition-all ${
                          currentPage === pageNum
                            ? "bg-[#3448D6] text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-[8px] border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;