import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";

import { useUser } from "@/context/UserContext";
import { useCycle } from "@/context/CycleContext";
import { useColors } from "@/hooks/useColors";

function LoadingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const native = Platform.OS !== "web";
    Animated.spring(logoScale, {
      toValue: 1,
      useNativeDriver: native,
      tension: 60,
      friction: 8,
    }).start();

    const makeDotAnim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: native }),
          Animated.timing(dot, { toValue: 0, duration: 350, useNativeDriver: native }),
          Animated.delay(650 - delay),
        ])
      );

    Animated.parallel([
      makeDotAnim(dot1, 0),
      makeDotAnim(dot2, 200),
      makeDotAnim(dot3, 400),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", paddingTop: topPad }}>
      <Animated.View style={{ alignItems: "center", transform: [{ scale: logoScale }] }}>
        <Text style={{ fontSize: 72, marginBottom: 16 }}>🌸</Text>
        <Text style={{
          fontSize: 36,
          fontWeight: "700",
          color: colors.foreground,
          letterSpacing: -1,
          marginBottom: 6,
        }}>
          Bloom
        </Text>
        <Text style={{ fontSize: 15, color: colors.mutedForeground, marginBottom: 40 }}>
          Your cycle companion
        </Text>
      </Animated.View>

      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.primary,
              opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              transform: [{
                scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }),
              }],
            }}
          />
        ))}
      </View>
    </View>
  );
}

export function AppNavigator() {
  const { profile, loaded: userLoaded } = useUser();
  const { loaded: cycleLoaded } = useCycle();

  const allLoaded = userLoaded && cycleLoaded;

  useEffect(() => {
    if (allLoaded) {
      SplashScreen.hideAsync();
    }
  }, [allLoaded]);

  if (!allLoaded) {
    return <LoadingScreen />;
  }

  if (!profile || !profile.hasCompletedOnboarding) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}
