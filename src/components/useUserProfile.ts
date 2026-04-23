// hooks/useUserProfile.ts
import { useState, useEffect } from "react";
import { TokenService, User } from "@/components/apiClient";

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = () => {
    const userData = TokenService.getUser();
    setUser(userData);
    setLoading(false);
  };

  useEffect(() => {
    loadUser();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        loadUser();
      }
    };

    const handleProfileUpdate = () => {
      loadUser();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  return { user, loading, refresh: loadUser };
};