import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserProfile {
  firstName: string;
  hasCompletedOnboarding: boolean;
}

interface UserContextType {
  profile: UserProfile | null;
  loaded: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (profile: Omit<UserProfile, "hasCompletedOnboarding">) => Promise<void>;
  clearUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileStr = await AsyncStorage.getItem("userProfile");
        if (profileStr) {
          setProfile(JSON.parse(profileStr));
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setLoaded(true);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile && loaded) {
      AsyncStorage.setItem("userProfile", JSON.stringify(profile));
    }
  }, [profile, loaded]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...updates });
  };

  const completeOnboarding = async (newProfile: Omit<UserProfile, "hasCompletedOnboarding">) => {
    const completeProfile: UserProfile = {
      ...newProfile,
      hasCompletedOnboarding: true,
    };
    setProfile(completeProfile);
  };

  const clearUserData = async () => {
    setProfile(null);
    await AsyncStorage.removeItem("userProfile");
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        loaded,
        updateProfile,
        completeOnboarding,
        clearUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
