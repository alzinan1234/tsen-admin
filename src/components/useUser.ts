// hooks/useUser.ts
import { useState, useEffect } from "react";
import { TokenService, User } from "@/components/apiClient";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = () => {
    const userData = TokenService.getUser();
    setUser(userData);
    setLoading(false);
  };

  useEffect(() => {
    loadUser();

    // Listen for user updates
    const handleUserUpdate = () => {
      loadUser();
    };

    const handleProfileUpdate = () => {
      loadUser();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        loadUser();
      }
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    window.addEventListener("profileUpdated", handleProfileUpdate);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return { user, loading, refresh: loadUser };
};