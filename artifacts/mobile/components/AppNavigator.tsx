import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { useUser } from "@/context/UserContext";

export function AppNavigator() {
  const { profile, loaded } = useUser();

  React.useEffect(() => {
    if (loaded && profile?.hasCompletedOnboarding) {
      SplashScreen.hideAsync();
    }
  }, [loaded, profile]);

  if (!loaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FBF7F4]">
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!profile || !profile.hasCompletedOnboarding) {
    SplashScreen.hideAsync();
    return (
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
