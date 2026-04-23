// Topbar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Bell, User, LogOut, Settings } from "lucide-react";
import { TokenService } from "@/components/apiClient";

interface TopbarProps {
  toggleMobileMenu: () => void;
}

interface UserData {
  id: string;
  email: string;
  name?: string;
  profileImage?: string;
  role?: string;
}

const Topbar: React.FC<TopbarProps> = ({ toggleMobileMenu }) => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [notificationCount, setNotificationCount] = useState<number>(8);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Load user data from localStorage and listen for changes
  useEffect(() => {
    loadUserData();

    // Listen for storage events (when profile updates in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        loadUserData();
      }
    };

    // Custom event for profile updates within the same tab
    const handleProfileUpdate = () => {
      loadUserData();
    };

    const handleUserUpdate = () => {
      loadUserData();
    };

    // Click outside to close dropdown
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".user-dropdown")) {
        setShowDropdown(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profileUpdated", handleProfileUpdate);
    window.addEventListener("userUpdated", handleUserUpdate);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("userUpdated", handleUserUpdate);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const loadUserData = () => {
    const user = TokenService.getUser() as UserData | null;
    if (user) {
      setUserName(user.name || "Editor");
      setUserAvatar(user.profileImage || "");
      setUserRole(user.role || "editor");
    } else {
      // Default values if no user found
      setUserName("Editor");
      setUserAvatar("");
      setUserRole("editor");
    }
  };

  const handleUserImageClick = (): void => {
    router.push("/editor/profile");
    setShowDropdown(false);
  };

  const handleNotificationClick = (): void => {
    router.push("/editor/notifications");
  };

  const handleSettingsClick = (): void => {
    router.push("/editor/settings");
    setShowDropdown(false);
  };

  const handleLogout = (): void => {
    TokenService.clearTokens();
    router.push("/");
    setShowDropdown(false);
  };

  // Get initial letter for fallback avatar
  const getInitial = () => {
    if (userName && userName.length > 0) {
      return userName.charAt(0).toUpperCase();
    }
    return "E";
  };

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch (userRole.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "editor":
        return "bg-blue-100 text-blue-700";
      case "writer":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between lg:justify-end bg-white px-4 py-3 border-b border-gray-100 shadow-sm font-sans">
      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Toggle Menu"
      >
        <Menu size={24} />
      </button>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div
          className="relative cursor-pointer flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-full py-2 px-3 transition-all group"
          onClick={handleNotificationClick}
        >
          <Bell size={20} stroke="#636363" className="group-hover:stroke-black transition-colors" />
          
          {/* Notification Badge */}
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 text-white bg-[#2444FF] rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold font-sans px-1">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative user-dropdown">
          <div
            className="relative rounded-full cursor-pointer border-2 border-gray-100 hover:border-[#2444FF] transition-all overflow-hidden w-10 h-10 bg-gray-100 flex items-center justify-center"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {userAvatar && userAvatar !== "" ? (
              <Image
                src={userAvatar}
                alt={userName}
                fill
                className="object-cover"
                onError={(e) => {
                  // If image fails to load, show fallback
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement("span");
                    fallback.className = "text-sm font-bold text-gray-600";
                    fallback.textContent = getInitial();
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <span className="text-sm font-bold text-gray-600">
                {getInitial()}
              </span>
            )}
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-slideDown">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#343E87] to-[#3448D6] flex items-center justify-center text-white font-bold">
                    {getInitial()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">Editor Account</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor()}`}>
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={handleUserImageClick}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={16} className="text-gray-400" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={handleSettingsClick}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={16} className="text-gray-400" />
                  <span>Settings</span>
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Topbar;