"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  HandHelping,
  Hexagon,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  LucideIcon,
  User,
  FileText,
  CreditCard,
  Loader2,
} from "lucide-react";
import { logoutAdmin } from "@/components/apiClient";

// 1. Define types for navigation items
interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

// 2. Define types for Component Props
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutGrid },
  { name: "User Management", href: "/admin/user-management", icon: User },
  { name: "Archive", href: "/admin/archive", icon: FileText },
  { name: "Subscription", href: "/admin/subscription", icon: CreditCard },
  // { name: "Settings", href: "/admin/settings", icon: Hexagon },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  setIsOpen, 
  isCollapsed, 
  setIsCollapsed 
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActiveRoute = (item: NavItem): boolean => {
    // For Dashboard - active when path is exactly "/admin" or starts with "/admin/dashboard"
    if (item.href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/dashboard" || pathname.startsWith("/admin/dashboard");
    }
    
    // For User Management - active when path starts with "/admin/user-management"
    if (item.href === "/admin/user-management") {
      return pathname === "/admin/user-management" || pathname.startsWith("/admin/user-management/");
    }
    
    // For Content Management - active when path starts with "/admin/content"
    if (item.href === "/admin/content") {
      return pathname === "/admin/content" || pathname.startsWith("/admin/content/");
    }
    if (item.href === "/admin/subscription") {
      return pathname === "/admin/subscription" || pathname.startsWith("/admin/subscription/");
    }
    if (item.href === "/admin/archive") {
      return pathname === "/admin/archive" || pathname.startsWith("/admin/archive/");
    }
    
    // For Settings - active when path starts with "/admin/settings"
    if (item.href === "/admin/settings") {
      return pathname === "/admin/settings" || pathname.startsWith("/admin/settings/");
    }
    
    // Default fallback
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call logout function to clear tokens
      logoutAdmin();
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        // Redirect to login page
        router.push("/");
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, clear local storage and redirect
      localStorage.clear();
      router.push("/");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  if (!mounted) return null;

  const activeGradient = "linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
     
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white text-[#636363] z-50
          transition-all duration-300 ease-in-out border-r border-gray-100
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        <div className="flex flex-col h-full">
          
          {/* Logo Section */}
          <div className={`flex items-center h-24 px-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <img src="/oped (2).png" alt="Logo" className="w-[116px]" />
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
            >
              {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center min-h-[54px] rounded-[10px] transition-all duration-200
                    ${isCollapsed ? "justify-center px-0" : "gap-4 px-4"}
                    ${isActive 
                      ? "text-white shadow-md shadow-blue-900/10" 
                      : "text-[#8E92BC] hover:bg-gray-50 hover:text-[#3448D6]"
                    }
                  `}
                  style={{
                    background: isActive ? activeGradient : "transparent",
                  }}
                >
                  <Icon 
                    className={`w-6 h-6 transition-colors ${
                      isActive 
                        ? "text-white" 
                        : "text-[#8E92BC] group-hover:text-[#3448D6]"
                    }`} 
                    strokeWidth={2} 
                  />
                  {!isCollapsed && (
                    <span 
                      className={`text-[15px] font-medium font-sans transition-colors ${
                        isActive 
                          ? "text-white" 
                          : "text-[#8E92BC]"
                      }`}
                    >
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Logout Section */}
          <div className="p-4 mt-auto mb-4">
            <button 
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className={`
                flex items-center gap-4 w-full h-[54px] rounded-[10px] bg-[#FFF0F0] text-[#FF5B5B] hover:bg-[#FFE5E5] transition-all disabled:opacity-50 disabled:cursor-not-allowed
                ${isCollapsed ? "justify-center px-0" : "px-6"}
              `}
            >
              {isLoggingOut ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
              {!isCollapsed && (
                <span className="text-[15px] font-medium font-serif">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancelLogout}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-[24px] w-full max-w-md mx-4 p-6 shadow-2xl animate-slideUp">
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-500" />
              </div>
              
              {/* Title */}
              <h3 className="font-serif text-[22px] font-semibold text-black mb-2">
                Logout Confirmation
              </h3>
              
              {/* Message */}
              <p className="text-[14px] text-[#8C8C8C] mb-6">
                Are you sure you want to logout? You will need to login again to access your account.
              </p>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelLogout}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-[12px] text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-[12px] text-[14px] font-medium hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    "Yes, Logout"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Sidebar;