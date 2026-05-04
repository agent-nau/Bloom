import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useUser } from "@/context/UserContext";

interface NavigationGuardProps {
  children: React.ReactNode;
}

export function NavigationGuard({ children }: NavigationGuardProps) {
  const { profile, loaded } = useUser();

  useEffect(() => {
    if (loaded) {
      if (!profile || !profile.hasCompletedOnboarding) {
        router.replace("/onboarding");
      } else {
        SplashScreen.hideAsync();
      }
    }
  }, [loaded, profile]);

  if (!loaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FBF7F4]">
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  // Don't render anything while navigating to onboarding
  if (!profile || !profile.hasCompletedOnboarding) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FBF7F4]">
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return <>{children}</>;
}
